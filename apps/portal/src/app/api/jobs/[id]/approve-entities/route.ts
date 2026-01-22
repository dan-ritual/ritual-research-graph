import { resolveMode } from "@/lib/db.server";
import { createServiceClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

interface ExtractedEntity {
  canonicalName: string;
  aliases: string[];
  type: "company" | "protocol" | "person" | "concept" | "opportunity";
  url?: string;
  twitter?: string;
  category?: string;
  description: string;
  sentiment: "positive" | "neutral" | "negative";
  mentions: Array<{
    context: string;
    section: string;
  }>;
}

interface ApproveRequest {
  entities: ExtractedEntity[];
}

// Map entity type from extraction format to database enum
const TYPE_MAP: Record<string, string> = {
  company: "company",
  protocol: "protocol",
  person: "person",
  concept: "concept",
  opportunity: "opportunity",
};

// Map section names to database enum
const SECTION_MAP: Record<string, string> = {
  "Intelligence Brief": "key_findings",
  "Strategic Questions": "recommendations",
  "Narrative Research": "deep_dives",
  "Executive Summary": "thesis",
  "Key Findings": "key_findings",
  Recommendations: "recommendations",
  "Deep Dives": "deep_dives",
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/--+/g, "-")
    .trim();
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: jobId } = await params;
  // Middleware handles auth - use service client for fast DB access
  const supabase = createServiceClient();

  // Resolve mode from header or cookie
  const mode = await resolveMode();

  // Validate job exists and is in correct status
  const { data: job, error: jobError } = await supabase
    .schema(mode).from("generation_jobs")
    .select("id, status, user_id, config")
    .eq("id", jobId)
    .single();

  if (jobError || !job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  if (job.status !== "awaiting_entity_review") {
    return NextResponse.json(
      { error: `Job is not awaiting review (status: ${job.status})` },
      { status: 400 }
    );
  }

  // 3. Parse request body
  let body: ApproveRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { entities } = body;

  if (!Array.isArray(entities)) {
    return NextResponse.json(
      { error: "Entities must be an array" },
      { status: 400 }
    );
  }

  // 4. Upsert approved entities to the entities table
  const entityIds: Record<string, string> = {};

  for (const entity of entities) {
    const slug = slugify(entity.canonicalName);
    const entityType = TYPE_MAP[entity.type] || "concept";

    const { data, error } = await supabase
      .schema(mode).from("entities")
      .upsert(
        {
          slug,
          canonical_name: entity.canonicalName,
          aliases: entity.aliases,
          type: entityType,
          metadata: {
            url: entity.url,
            twitter: entity.twitter,
            category: entity.category,
            description: entity.description,
          },
        },
        {
          onConflict: "slug",
          ignoreDuplicates: false,
        }
      )
      .select("id")
      .single();

    if (error) {
      console.warn(`Failed to upsert entity ${entity.canonicalName}:`, error);
      continue;
    }

    if (data) {
      entityIds[entity.canonicalName] = data.id;
    }
  }

  // 5. Get or create microsite record for this job
  let micrositeId: string;

  const { data: existingMicrosite } = await supabase
    .schema(mode).from("microsites")
    .select("id")
    .eq("job_id", jobId)
    .single();

  if (existingMicrosite) {
    micrositeId = existingMicrosite.id;
  } else {
    // Create microsite placeholder - will be updated later when site is built
    const jobConfig = job.config as { title?: string; subtitle?: string };
    const slug = slugify(jobConfig.title || `research-${Date.now()}`);

    const { data: newMicrosite, error: createError } = await supabase
      .schema(mode).from("microsites")
      .insert({
        job_id: jobId,
        user_id: job.user_id,
        slug: `${slug}-${Date.now().toString(36)}`,
        title: jobConfig.title || "Untitled Research",
        subtitle: jobConfig.subtitle || "",
        config: {},
        entity_count: entities.length,
        visibility: "internal",
      })
      .select("id")
      .single();

    if (createError) {
      console.error("Failed to create microsite:", createError);
      return NextResponse.json(
        { error: "Failed to create microsite record" },
        { status: 500 }
      );
    }

    micrositeId = newMicrosite.id;

    // Update job with microsite reference
    await supabase
      .schema(mode).from("generation_jobs")
      .update({ microsite_id: micrositeId })
      .eq("id", jobId);
  }

  // 6. Create entity appearances
  const appearances: Array<{
    entity_id: string;
    microsite_id: string;
    section: string;
    context: string;
    sentiment: string;
  }> = [];

  for (const entity of entities) {
    const entityId = entityIds[entity.canonicalName];
    if (!entityId) continue;

    const seenSections = new Set<string>();
    for (const mention of entity.mentions.slice(0, 3)) {
      let section = "key_findings";
      for (const [pattern, value] of Object.entries(SECTION_MAP)) {
        if (mention.section.includes(pattern)) {
          section = value;
          break;
        }
      }

      if (seenSections.has(section)) continue;
      seenSections.add(section);

      appearances.push({
        entity_id: entityId,
        microsite_id: micrositeId,
        section,
        context: mention.context.slice(0, 500),
        sentiment: entity.sentiment,
      });
    }
  }

  if (appearances.length > 0) {
    const { error: appearanceError } = await supabase
      .schema(mode).from("entity_appearances")
      .upsert(appearances, { onConflict: "entity_id,microsite_id,section" });

    if (appearanceError) {
      console.warn("Failed to create some entity appearances:", appearanceError);
    }
  }

  // 7. Update entity relations (co-occurrences)
  const entityIdList = Object.values(entityIds);
  if (entityIdList.length >= 2) {
    for (let i = 0; i < entityIdList.length; i++) {
      for (let j = i + 1; j < entityIdList.length; j++) {
        const [entityA, entityB] = [entityIdList[i], entityIdList[j]].sort();

        await supabase.schema(mode).from("entity_relations").upsert(
          {
            entity_a_id: entityA,
            entity_b_id: entityB,
            co_occurrence_count: 1,
          },
          {
            onConflict: "entity_a_id,entity_b_id",
          }
        );
      }
    }
  }

  // 8. Update job status to continue pipeline
  const { error: statusError } = await supabase
    .schema(mode).from("generation_jobs")
    .update({
      status: "generating_site_config",
      current_stage: 4,
    })
    .eq("id", jobId);

  if (statusError) {
    console.error("Failed to update job status:", statusError);
    return NextResponse.json(
      { error: "Failed to update job status" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    entityCount: Object.keys(entityIds).length,
    appearanceCount: appearances.length,
    micrositeId,
  });
}
