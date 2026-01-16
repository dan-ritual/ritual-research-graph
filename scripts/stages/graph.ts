// Stage 6: Supabase Graph Integration

import path from 'path';
import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase.js';
import { slugify } from '../utils/files.js';
import type { Artifact, GenerationConfig, ExtractedEntity, SiteConfig } from '../lib/types.js';
import type { Ora } from 'ora';

interface GraphIntegrationOptions {
  config: GenerationConfig;
  siteConfig: SiteConfig;
  entities: ExtractedEntity[];
  artifacts: {
    cleanedTranscript: Artifact;
    intelligenceBrief: Artifact;
    strategicQuestions: Artifact;
    narrativeResearch?: Artifact | null;
    entities: Artifact;
    siteConfig: Artifact;
  };
  spinner: Ora;
  outputDir: string;
  userId?: string; // Optional - defaults to system user
  blobPath?: string; // Path in Vercel Blob storage (e.g., "microsites/rwa-defi-jan-2026")
}

interface GraphIntegrationResult {
  micrositeId: string;
  entityCount: number;
  relationCount: number;
}

// Map ExtractedEntity type to database enum
const TYPE_MAP: Record<string, string> = {
  company: 'company',
  protocol: 'protocol',
  person: 'person',
  concept: 'concept',
  opportunity: 'opportunity',
};

// Map section names to database enum
const SECTION_MAP: Record<string, string> = {
  'Intelligence Brief': 'key_findings',
  'Strategic Questions': 'recommendations',
  'Narrative Research': 'deep_dives',
  'Executive Summary': 'thesis',
  'Key Findings': 'key_findings',
  'Recommendations': 'recommendations',
  'Deep Dives': 'deep_dives',
};

export async function integrateWithGraph(
  options: GraphIntegrationOptions
): Promise<GraphIntegrationResult | null> {
  const { config, siteConfig, entities, artifacts, spinner } = options;

  if (!isSupabaseConfigured()) {
    spinner.warn('Stage 6/6: Skipping graph integration (Supabase not configured)');
    return null;
  }

  const supabase = getSupabaseClient();

  // Step 1: Get or create system user for CLI operations
  spinner.text = 'Stage 6/6: Setting up database connection...';
  const userId = options.userId || await getOrCreateSystemUser(supabase);

  // Step 2: Create generation job record
  spinner.text = 'Stage 6/6: Creating generation job...';
  const jobId = await createGenerationJob(supabase, {
    userId,
    config,
    transcriptPath: config.transcript,
  });

  // Step 3: Create artifacts in database
  spinner.text = 'Stage 6/6: Storing artifacts...';
  await storeArtifacts(supabase, jobId, artifacts);

  // Step 4: Upsert entities to global registry
  spinner.text = 'Stage 6/6: Upserting entities...';
  const entityIds = await upsertEntities(supabase, entities);

  // Step 5: Create microsite record
  spinner.text = 'Stage 6/6: Creating microsite record...';
  const micrositeSlug = slugify(siteConfig.branding.title);
  const micrositeId = await createMicrosite(supabase, {
    jobId,
    userId,
    slug: micrositeSlug,
    title: siteConfig.branding.title,
    subtitle: siteConfig.branding.subtitle,
    thesis: siteConfig.thesis,
    config: siteConfig,
    entityCount: entities.length,
    blobPath: options.blobPath,
  });

  // Step 6: Link entities to microsite via appearances
  spinner.text = 'Stage 6/6: Creating entity appearances...';
  await createEntityAppearances(supabase, micrositeId, entities, entityIds);

  // Step 7: Update entity relations (co-occurrences)
  spinner.text = 'Stage 6/6: Updating entity relations...';
  const relationCount = await updateEntityRelations(supabase, Object.values(entityIds));

  // Step 8: Mark job as completed
  spinner.text = 'Stage 6/6: Finalizing...';
  await completeGenerationJob(supabase, jobId, micrositeId);

  return {
    micrositeId,
    entityCount: Object.keys(entityIds).length,
    relationCount,
  };
}

async function getOrCreateSystemUser(supabase: ReturnType<typeof getSupabaseClient>): Promise<string> {
  const systemEmail = 'system@ritual.net';

  // Check if system user exists
  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('email', systemEmail)
    .single();

  if (existing) return existing.id;

  // Create system user (requires auth.users entry first - this is for CLI use)
  // For now, just use a generated UUID for CLI operations
  const systemId = crypto.randomUUID();

  const { error } = await supabase.from('users').insert({
    id: systemId,
    email: systemEmail,
    name: 'CLI System',
    role: 'admin',
  });

  if (error) {
    // If the insert fails (e.g., foreign key to auth.users), try to find any existing admin user
    const { data: adminUser } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'admin')
      .limit(1)
      .single();

    if (adminUser) return adminUser.id;

    throw new Error(`Failed to get or create system user: ${error.message}`);
  }

  return systemId;
}

async function createGenerationJob(
  supabase: ReturnType<typeof getSupabaseClient>,
  options: { userId: string; config: GenerationConfig; transcriptPath: string }
): Promise<string> {
  const { data, error } = await supabase
    .from('generation_jobs')
    .insert({
      user_id: options.userId,
      workflow_type: options.config.workflow,
      status: 'completed',
      transcript_path: options.transcriptPath,
      config: {
        title: options.config.title,
        subtitle: options.config.subtitle,
        accent: options.config.accent,
      },
      current_stage: 6,
      stage_progress: 100,
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (error) throw new Error(`Failed to create generation job: ${error.message}`);
  return data.id;
}

async function storeArtifacts(
  supabase: ReturnType<typeof getSupabaseClient>,
  jobId: string,
  artifacts: GraphIntegrationOptions['artifacts']
): Promise<void> {
  const artifactRecords = [
    {
      job_id: jobId,
      type: 'cleaned_transcript' as const,
      file_path: artifacts.cleanedTranscript.path,
      file_size: artifacts.cleanedTranscript.content.length,
    },
    {
      job_id: jobId,
      type: 'intelligence_brief' as const,
      file_path: artifacts.intelligenceBrief.path,
      file_size: artifacts.intelligenceBrief.content.length,
    },
    {
      job_id: jobId,
      type: 'strategic_questions' as const,
      file_path: artifacts.strategicQuestions.path,
      file_size: artifacts.strategicQuestions.content.length,
    },
    {
      job_id: jobId,
      type: 'site_config' as const,
      file_path: artifacts.siteConfig.path,
      file_size: artifacts.siteConfig.content.length,
    },
  ];

  if (artifacts.narrativeResearch) {
    artifactRecords.push({
      job_id: jobId,
      type: 'narrative_research' as const,
      file_path: artifacts.narrativeResearch.path,
      file_size: artifacts.narrativeResearch.content.length,
    });
  }

  if (artifacts.entities) {
    artifactRecords.push({
      job_id: jobId,
      type: 'entity_extraction' as const,
      file_path: artifacts.entities.path,
      file_size: artifacts.entities.content.length,
    });
  }

  const { error } = await supabase.from('artifacts').insert(artifactRecords);
  if (error) throw new Error(`Failed to store artifacts: ${error.message}`);
}

async function upsertEntities(
  supabase: ReturnType<typeof getSupabaseClient>,
  entities: ExtractedEntity[]
): Promise<Record<string, string>> {
  const entityIds: Record<string, string> = {};

  for (const entity of entities) {
    const slug = slugify(entity.canonicalName);
    const entityType = TYPE_MAP[entity.type] || 'concept';

    // Upsert entity
    const { data, error } = await supabase
      .from('entities')
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
          onConflict: 'slug',
          ignoreDuplicates: false,
        }
      )
      .select('id')
      .single();

    if (error) {
      console.warn(`Failed to upsert entity ${entity.canonicalName}: ${error.message}`);
      continue;
    }

    entityIds[entity.canonicalName] = data.id;
  }

  return entityIds;
}

async function createMicrosite(
  supabase: ReturnType<typeof getSupabaseClient>,
  options: {
    jobId: string;
    userId: string;
    slug: string;
    title: string;
    subtitle: string;
    thesis: string;
    config: SiteConfig;
    entityCount: number;
    blobPath?: string;
  }
): Promise<string> {
  // Ensure unique slug by appending timestamp if needed
  let slug = options.slug;
  const timestamp = Date.now().toString(36);

  const { data: existing } = await supabase
    .from('microsites')
    .select('id')
    .eq('slug', slug)
    .single();

  if (existing) {
    slug = `${options.slug}-${timestamp}`;
  }

  const { data, error } = await supabase
    .from('microsites')
    .insert({
      job_id: options.jobId,
      user_id: options.userId,
      slug,
      title: options.title,
      subtitle: options.subtitle,
      thesis: options.thesis,
      config: options.config,
      entity_count: options.entityCount,
      visibility: 'internal',
      blob_path: options.blobPath || null,
    })
    .select('id')
    .single();

  if (error) throw new Error(`Failed to create microsite: ${error.message}`);
  return data.id;
}

async function createEntityAppearances(
  supabase: ReturnType<typeof getSupabaseClient>,
  micrositeId: string,
  entities: ExtractedEntity[],
  entityIds: Record<string, string>
): Promise<void> {
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

    // Create appearance for each mention
    const seenSections = new Set<string>();
    for (const mention of entity.mentions.slice(0, 3)) {
      // Map section to enum value
      let section = 'key_findings';
      for (const [pattern, value] of Object.entries(SECTION_MAP)) {
        if (mention.section.includes(pattern)) {
          section = value;
          break;
        }
      }

      // Skip duplicate section entries
      if (seenSections.has(section)) continue;
      seenSections.add(section);

      appearances.push({
        entity_id: entityId,
        microsite_id: micrositeId,
        section: section as 'thesis' | 'key_findings' | 'recommendations' | 'deep_dives',
        context: mention.context.slice(0, 500),
        sentiment: entity.sentiment,
      });
    }
  }

  if (appearances.length > 0) {
    const { error } = await supabase
      .from('entity_appearances')
      .upsert(appearances, { onConflict: 'entity_id,microsite_id,section' });

    if (error) {
      console.warn(`Failed to create some entity appearances: ${error.message}`);
    }
  }
}

async function updateEntityRelations(
  supabase: ReturnType<typeof getSupabaseClient>,
  entityIds: string[]
): Promise<number> {
  if (entityIds.length < 2) return 0;

  let relationCount = 0;

  // Create pairs with consistent ordering (a < b)
  for (let i = 0; i < entityIds.length; i++) {
    for (let j = i + 1; j < entityIds.length; j++) {
      const [entityA, entityB] = [entityIds[i], entityIds[j]].sort();

      const { error } = await supabase.rpc('increment_entity_relation', {
        a_id: entityA,
        b_id: entityB,
      });

      // If the RPC doesn't exist, fall back to upsert
      if (error?.code === 'PGRST202') {
        await supabase.from('entity_relations').upsert(
          {
            entity_a_id: entityA,
            entity_b_id: entityB,
            co_occurrence_count: 1,
          },
          {
            onConflict: 'entity_a_id,entity_b_id',
          }
        );
      }

      relationCount++;
    }
  }

  return relationCount;
}

async function completeGenerationJob(
  supabase: ReturnType<typeof getSupabaseClient>,
  jobId: string,
  micrositeId: string
): Promise<void> {
  await supabase
    .from('generation_jobs')
    .update({
      status: 'completed',
      microsite_id: micrositeId,
      completed_at: new Date().toISOString(),
    })
    .eq('id', jobId);
}
