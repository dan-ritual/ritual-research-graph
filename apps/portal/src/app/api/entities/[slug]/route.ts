import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch entity
  const { data: entity, error: entityError } = await supabase
    .from("entities")
    .select("*")
    .eq("slug", slug)
    .is("deleted_at", null)
    .single();

  if (entityError || !entity) {
    return NextResponse.json({ error: "Entity not found" }, { status: 404 });
  }

  // Fetch appearances with microsite context
  const { data: appearances } = await supabase
    .from("entity_appearances")
    .select(`
      id,
      section,
      context,
      sentiment,
      created_at,
      microsites (
        id,
        slug,
        title,
        subtitle,
        created_at
      )
    `)
    .eq("entity_id", entity.id)
    .order("created_at", { ascending: false });

  // Fetch co-occurrences (bidirectional)
  const { data: relationsA } = await supabase
    .from("entity_relations")
    .select(`
      co_occurrence_count,
      entity_b:entities!entity_relations_entity_b_id_fkey (
        id,
        slug,
        canonical_name,
        type
      )
    `)
    .eq("entity_a_id", entity.id)
    .order("co_occurrence_count", { ascending: false })
    .limit(10);

  const { data: relationsB } = await supabase
    .from("entity_relations")
    .select(`
      co_occurrence_count,
      entity_a:entities!entity_relations_entity_a_id_fkey (
        id,
        slug,
        canonical_name,
        type
      )
    `)
    .eq("entity_b_id", entity.id)
    .order("co_occurrence_count", { ascending: false })
    .limit(10);

  // Combine and dedupe co-occurrences
  const coOccurrences: Array<{
    id: string;
    slug: string;
    canonical_name: string;
    type: string;
    co_occurrence_count: number;
  }> = [];

  const seen = new Set<string>();

  type EntityInfo = {
    id: string;
    slug: string;
    canonical_name: string;
    type: string;
  };

  relationsA?.forEach((r) => {
    const e = r.entity_b as EntityInfo | EntityInfo[] | null;
    const entity = Array.isArray(e) ? e[0] : e;
    if (entity && !seen.has(entity.id)) {
      seen.add(entity.id);
      coOccurrences.push({
        ...entity,
        co_occurrence_count: r.co_occurrence_count,
      });
    }
  });

  relationsB?.forEach((r) => {
    const e = r.entity_a as EntityInfo | EntityInfo[] | null;
    const entity = Array.isArray(e) ? e[0] : e;
    if (entity && !seen.has(entity.id)) {
      seen.add(entity.id);
      coOccurrences.push({
        ...entity,
        co_occurrence_count: r.co_occurrence_count,
      });
    }
  });

  // Sort by co-occurrence count
  coOccurrences.sort((a, b) => b.co_occurrence_count - a.co_occurrence_count);

  // Fetch linked opportunities
  const { data: opportunityLinks } = await supabase
    .from("opportunity_entities")
    .select(`
      relationship,
      opportunities (
        id,
        slug,
        name,
        thesis,
        confidence,
        pipeline_stages (
          name
        )
      )
    `)
    .eq("entity_id", entity.id);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const opportunities = opportunityLinks
    ?.map((link) => {
      const opp = link.opportunities as any;
      const opportunity = Array.isArray(opp) ? opp[0] : opp;
      if (!opportunity) return null;
      const stage = opportunity.pipeline_stages;
      const stageName = Array.isArray(stage) ? stage[0]?.name : stage?.name;
      return {
        id: opportunity.id as string,
        slug: opportunity.slug as string,
        name: opportunity.name as string,
        thesis: opportunity.thesis as string | null,
        confidence: opportunity.confidence as number | null,
        pipeline_stages: stageName ? { name: stageName } : null,
        relationship: link.relationship,
      };
    })
    .filter((o): o is NonNullable<typeof o> => o !== null && o.id !== undefined);

  return NextResponse.json({
    entity,
    appearances: appearances || [],
    coOccurrences: coOccurrences.slice(0, 10),
    opportunities: opportunities || [],
  });
}
