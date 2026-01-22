// Stage 6: Supabase Graph Integration

import path from 'path';
import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase.js';
import {
  DEFAULT_MODE_ID,
  SHARED_SCHEMA,
  getSchemaForMode,
  getSchemaTable,
  type ModeId,
} from '@ritual-research/core';
import { slugify } from '../utils/files.js';
import { entityNameToSlug, resolveLinkedEntities } from './entities.js';
import type { Artifact, GenerationConfig, ExtractedEntity, ExtractedOpportunity, SiteConfig } from '../lib/types.js';
import type { Ora } from 'ora';

interface GraphIntegrationOptions {
  config: GenerationConfig;
  siteConfig: SiteConfig;
  entities: ExtractedEntity[];
  opportunities?: ExtractedOpportunity[]; // Opportunities extracted from Stage 3
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
  opportunityCount: number;
}

// Map ExtractedEntity type to database enum
const TYPE_MAP: Record<string, string> = {
  company: 'company',
  protocol: 'protocol',
  person: 'person',
  concept: 'concept',
  opportunity: 'opportunity',
  feature: 'feature',
  topic: 'topic',
  decision: 'decision',
  component: 'component',
  idea: 'idea',
  prototype: 'prototype',
  experiment: 'experiment',
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
  const { config, siteConfig, entities, opportunities = [], artifacts, spinner } = options;

  if (!isSupabaseConfigured()) {
    spinner.warn('Stage 6/6: Skipping graph integration (Supabase not configured)');
    return null;
  }

  const supabase = getSupabaseClient();
  const mode = config.mode ?? DEFAULT_MODE_ID;

  // Step 1: Get or create system user for CLI operations
  spinner.text = 'Stage 6/6: Setting up database connection...';
  const userId = options.userId || await getOrCreateSystemUser(supabase, mode);

  // Step 2: Create generation job record
  spinner.text = 'Stage 6/6: Creating generation job...';
  const jobId = await createGenerationJob(supabase, {
    userId,
    config,
    transcriptPath: config.transcript,
  }, mode);

  // Step 3: Create artifacts in database
  spinner.text = 'Stage 6/6: Storing artifacts...';
  await storeArtifacts(supabase, jobId, artifacts, mode);

  // Step 4: Upsert entities to global registry
  spinner.text = 'Stage 6/6: Upserting entities...';
  const entityIds = await upsertEntities(supabase, entities, mode);

  // Step 4b: Insert opportunities into pipeline (if any)
  let opportunityCount = 0;
  if (opportunities.length > 0) {
    spinner.text = 'Stage 6/6: Creating opportunities...';
    opportunityCount = await insertOpportunities(supabase, opportunities, entities, entityIds, jobId, userId, mode);
  }

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
  }, mode);

  // Step 6: Link entities to microsite via appearances
  spinner.text = 'Stage 6/6: Creating entity appearances...';
  await createEntityAppearances(supabase, micrositeId, entities, entityIds, mode);

  // Step 7: Update entity relations (co-occurrences)
  spinner.text = 'Stage 6/6: Updating entity relations...';
  const relationCount = await updateEntityRelations(supabase, Object.values(entityIds), mode);

  // Step 8: Mark job as completed
  spinner.text = 'Stage 6/6: Finalizing...';
  await completeGenerationJob(supabase, jobId, micrositeId, mode);

  return {
    micrositeId,
    entityCount: Object.keys(entityIds).length,
    relationCount,
    opportunityCount,
  };
}

async function getOrCreateSystemUser(
  supabase: ReturnType<typeof getSupabaseClient>,
  mode: ModeId
): Promise<string> {
  const systemEmail = 'system@ritual.net';

  // Check if system user exists
  const { data: existing } = await supabase
    .from(getSchemaTable('users', mode, SHARED_SCHEMA))
    .select('id')
    .eq('email', systemEmail)
    .single();

  if (existing) return existing.id;

  // Create system user (requires auth.users entry first - this is for CLI use)
  // For now, just use a generated UUID for CLI operations
  const systemId = crypto.randomUUID();

  const { error } = await supabase.from(getSchemaTable('users', mode, SHARED_SCHEMA)).insert({
    id: systemId,
    email: systemEmail,
    name: 'CLI System',
    role: 'admin',
  });

  if (error) {
    // If the insert fails (e.g., foreign key to auth.users), try to find any existing admin user
    const { data: adminUser } = await supabase
      .from(getSchemaTable('users', mode, SHARED_SCHEMA))
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
  options: { userId: string; config: GenerationConfig; transcriptPath: string },
  mode: ModeId
): Promise<string> {
  const { data, error } = await supabase
    .from(getSchemaTable('generation_jobs', mode))
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
  artifacts: GraphIntegrationOptions['artifacts'],
  mode: ModeId
): Promise<void> {
  const artifactRecords: Array<{
    job_id: string;
    type: string;
    file_path: string;
    file_size: number;
  }> = [
    {
      job_id: jobId,
      type: 'cleaned_transcript',
      file_path: artifacts.cleanedTranscript.path!,
      file_size: artifacts.cleanedTranscript.content.length,
    },
    {
      job_id: jobId,
      type: 'intelligence_brief',
      file_path: artifacts.intelligenceBrief.path!,
      file_size: artifacts.intelligenceBrief.content.length,
    },
    {
      job_id: jobId,
      type: 'strategic_questions',
      file_path: artifacts.strategicQuestions.path!,
      file_size: artifacts.strategicQuestions.content.length,
    },
    {
      job_id: jobId,
      type: 'site_config',
      file_path: artifacts.siteConfig.path!,
      file_size: artifacts.siteConfig.content.length,
    },
  ];

  if (artifacts.narrativeResearch?.path) {
    artifactRecords.push({
      job_id: jobId,
      type: 'narrative_research',
      file_path: artifacts.narrativeResearch.path,
      file_size: artifacts.narrativeResearch.content.length,
    });
  }

  if (artifacts.entities?.path) {
    artifactRecords.push({
      job_id: jobId,
      type: 'entity_extraction',
      file_path: artifacts.entities.path,
      file_size: artifacts.entities.content.length,
    });
  }

  const { error } = await supabase.from(getSchemaTable('artifacts', mode)).insert(artifactRecords);
  if (error) throw new Error(`Failed to store artifacts: ${error.message}`);
}

async function upsertEntities(
  supabase: ReturnType<typeof getSupabaseClient>,
  entities: ExtractedEntity[],
  mode: ModeId
): Promise<Record<string, string>> {
  const entityIds: Record<string, string> = {};

  for (const entity of entities) {
    const slug = slugify(entity.canonicalName);
    const entityType = TYPE_MAP[entity.type] || 'concept';

    // Upsert entity
    const { data, error } = await supabase
      .from(getSchemaTable('entities', mode))
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
  },
  mode: ModeId
): Promise<string> {
  // Check for existing microsite with same title (case-insensitive) to prevent duplicates
  // Use .limit(1) instead of .single() because .single() errors when >1 match exists
  const { data: existingMatches } = await supabase
    .from(getSchemaTable('microsites', mode))
    .select('id, slug, created_at')
    .ilike('title', options.title)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(1);

  const existingByTitle = existingMatches?.[0] || null;

  // If microsite with same title exists, update it instead of creating duplicate
  if (existingByTitle) {
    console.log(`Updating existing microsite ${existingByTitle.slug} instead of creating duplicate`);
    const { error: updateError } = await supabase
      .from(getSchemaTable('microsites', mode))
      .update({
        job_id: options.jobId,
        subtitle: options.subtitle,
        thesis: options.thesis,
        config: options.config,
        entity_count: options.entityCount,
        blob_path: options.blobPath || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existingByTitle.id);

    if (updateError) {
      console.warn(`Failed to update existing microsite: ${updateError.message}, creating new one`);
    } else {
      return existingByTitle.id;
    }
  }

  // Ensure unique slug by appending timestamp if needed
  let slug = options.slug;
  const timestamp = Date.now().toString(36);

  // Use .limit(1) instead of .single() for safe existence check
  const { data: slugMatches } = await supabase
    .from(getSchemaTable('microsites', mode))
    .select('id')
    .eq('slug', slug)
    .is('deleted_at', null)
    .limit(1);

  if (slugMatches && slugMatches.length > 0) {
    slug = `${options.slug}-${timestamp}`;
  }

  const { data, error } = await supabase
    .from(getSchemaTable('microsites', mode))
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
  entityIds: Record<string, string>,
  mode: ModeId
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
      .from(getSchemaTable('entity_appearances', mode))
      .upsert(appearances, { onConflict: 'entity_id,microsite_id,section' });

    if (error) {
      console.warn(`Failed to create some entity appearances: ${error.message}`);
    }
  }
}

async function updateEntityRelations(
  supabase: ReturnType<typeof getSupabaseClient>,
  entityIds: string[],
  mode: ModeId
): Promise<number> {
  if (entityIds.length < 2) return 0;

  let relationCount = 0;

  // Create pairs with consistent ordering (a < b)
  for (let i = 0; i < entityIds.length; i++) {
    for (let j = i + 1; j < entityIds.length; j++) {
      const [entityA, entityB] = [entityIds[i], entityIds[j]].sort();

      const { error } = await supabase
        .schema(getSchemaForMode(mode))
        .rpc('increment_entity_relation', {
          a_id: entityA,
          b_id: entityB,
        });

      // If the RPC doesn't exist, fall back to upsert
      if (error?.code === 'PGRST202') {
        await supabase.from(getSchemaTable('entity_relations', mode)).upsert(
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
  micrositeId: string,
  mode: ModeId
): Promise<void> {
  await supabase
    .from(getSchemaTable('generation_jobs', mode))
    .update({
      status: 'completed',
      microsite_id: micrositeId,
      completed_at: new Date().toISOString(),
    })
    .eq('id', jobId);
}

/**
 * Insert opportunities into the pipeline from Stage 3 extraction
 */
async function insertOpportunities(
  supabase: ReturnType<typeof getSupabaseClient>,
  opportunities: ExtractedOpportunity[],
  entities: ExtractedEntity[],
  entityIds: Record<string, string>,
  jobId: string,
  userId: string,
  mode: ModeId
): Promise<number> {
  let insertedCount = 0;

  // Resolve linked entities to entity IDs
  const linkedEntityMap = resolveLinkedEntities(opportunities, entities);

  for (const opp of opportunities) {
    // Insert opportunity
    const oppSlug = slugify(opp.name);
    const { data: oppData, error: oppError } = await supabase
      .from(getSchemaTable('opportunities', mode))
      .insert({
        slug: oppSlug,
        name: opp.name,
        description: opp.thesis, // Store thesis in description for base schema compatibility
        status: 'active',
        thesis: opp.thesis,
        angle: opp.angle,
        confidence: opp.confidence,
        source_job_id: jobId,
        created_by: userId,
      })
      .select('id')
      .single();

    if (oppError) {
      console.warn(`Failed to insert opportunity ${opp.name}: ${oppError.message}`);
      continue;
    }

    insertedCount++;

    // Link entities to opportunity
    const linkedSlugs = linkedEntityMap.get(opp.name) || [];
    for (const slug of linkedSlugs) {
      // Find entity ID by matching slug
      for (const [name, id] of Object.entries(entityIds)) {
        if (entityNameToSlug(name) === slug) {
          await supabase.from(getSchemaTable('opportunity_entities', mode)).insert({
            opportunity_id: oppData.id,
            entity_id: id,
            relationship: 'related',
          });
          break;
        }
      }
    }

    // Log activity
    await supabase.from(getSchemaTable('opportunity_activity', mode)).insert({
      opportunity_id: oppData.id,
      user_id: userId,
      action: 'created',
      details: { source: 'stage3_extraction', job_id: jobId },
    });
  }

  return insertedCount;
}
