#!/usr/bin/env npx tsx
import {
  DEFAULT_MODE_ID,
  MODE_CONFIGS,
  SHARED_SCHEMA,
  getSchemaTable,
  type ModeId,
} from '@ritual-research/core';
/**
 * Migration script: JSON data → Supabase
 *
 * Migrates existing JSON data files to the Supabase database.
 * Uses service role key (bypasses RLS).
 *
 * Usage: npx tsx scripts/migrate-json-to-supabase.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

function resolveModeId(value?: string | null): ModeId {
  if (value && value in MODE_CONFIGS) {
    return value as ModeId;
  }
  return DEFAULT_MODE_ID;
}

const args = process.argv.slice(2);
const modeIndex = args.indexOf('--mode');
const modeArg = modeIndex >= 0 ? args[modeIndex + 1] : undefined;
const modeId = resolveModeId(modeArg);

// Map JSON section names to DB enum values
const sectionMap: Record<string, string> = {
  thesis: 'thesis',
  keyFindings: 'key_findings',
  key_findings: 'key_findings',
  recommendations: 'recommendations',
  deepDives: 'deep_dives',
  deep_dives: 'deep_dives',
};

async function loadJsonFile<T>(filename: string): Promise<T> {
  const filepath = path.join(process.cwd(), 'data', filename);
  const content = fs.readFileSync(filepath, 'utf-8');
  return JSON.parse(content) as T;
}

interface OpportunityJson {
  slug: string;
  name: string;
  description: string;
  parent: string | null;
  children: string[];
  relatedOpportunities: string[];
  entityCount: number;
  micrositeCount: number;
}

interface EntityAppearance {
  micrositeId: string;
  micrositeTitle: string;
  context: string;
  section: string;
}

interface RelatedEntity {
  slug: string;
  coOccurrenceCount: number;
}

interface EntityJson {
  slug: string;
  canonicalName: string;
  aliases: string[];
  type: string;
  metadata: Record<string, string>;
  appearances: EntityAppearance[];
  relatedEntities: RelatedEntity[];
  opportunities: string[];
  createdAt: string;
  updatedAt: string;
}

interface MicrositeJson {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  thesis: string;
  sourceTranscript: string;
  artifacts: string[];
  entities: string[];
  opportunities: string[];
  keyFindingTitles: string[];
  recommendationTitles: string[];
  backlinks: string[];
  url: string;
  localPath: string;
  createdAt: string;
  updatedAt: string;
}

async function migrateOpportunities(opportunities: Record<string, OpportunityJson>) {
  console.log('\n📁 Migrating opportunities...');

  // First pass: insert all without parent references
  for (const [slug, opp] of Object.entries(opportunities)) {
    const { error } = await supabase
    .from(getSchemaTable('opportunities', modeId))
      .upsert({
        slug: opp.slug,
        name: opp.name,
        description: opp.description,
        parent_id: null, // Will update in second pass
        entity_count: opp.entityCount,
        microsite_count: opp.micrositeCount,
      }, { onConflict: 'slug' });

    if (error) {
      console.error(`  ❌ Failed to insert opportunity ${slug}:`, error.message);
    } else {
      console.log(`  ✓ ${opp.name}`);
    }
  }

  // Second pass: update parent references
  for (const [slug, opp] of Object.entries(opportunities)) {
    if (opp.parent) {
      // Get parent ID
      const { data: parent } = await supabase
      .from(getSchemaTable('opportunities', modeId))
        .select('id')
        .eq('slug', opp.parent)
        .single();

      if (parent) {
        const { error } = await supabase
          .from(getSchemaTable('opportunities', modeId))
          .update({ parent_id: parent.id })
          .eq('slug', slug);

        if (error) {
          console.error(`  ❌ Failed to set parent for ${slug}:`, error.message);
        }
      }
    }
  }

  console.log(`  ✓ ${Object.keys(opportunities).length} opportunities migrated`);
}

async function migrateEntities(entities: Record<string, EntityJson>) {
  console.log('\n🏢 Migrating entities...');

  const entityIdMap: Record<string, string> = {};

  for (const [slug, entity] of Object.entries(entities)) {
    const { data, error } = await supabase
    .from(getSchemaTable('entities', modeId))
      .upsert({
        slug: entity.slug,
        canonical_name: entity.canonicalName,
        aliases: entity.aliases,
        type: entity.type,
        metadata: entity.metadata,
        appearance_count: entity.appearances.length,
      }, { onConflict: 'slug' })
      .select('id')
      .single();

    if (error) {
      console.error(`  ❌ Failed to insert entity ${slug}:`, error.message);
    } else {
      entityIdMap[slug] = data.id;
      console.log(`  ✓ ${entity.canonicalName}`);
    }
  }

  console.log(`  ✓ ${Object.keys(entities).length} entities migrated`);
  return entityIdMap;
}

async function getOrCreateSystemUser(): Promise<string> {
  // Check if any user exists (use first admin or create via auth)
  const { data: existing } = await supabase
    .from(getSchemaTable('users', modeId, SHARED_SCHEMA))
    .select('id')
    .eq('role', 'admin')
    .limit(1)
    .single();

  if (existing) {
    return existing.id;
  }

  // Create user via Supabase Auth (which triggers the handle_new_user function)
  const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
    email: 'migration@ritual.net',
    email_confirm: true,
    user_metadata: { full_name: 'Migration System' },
  });

  if (authError) {
    console.error('Failed to create auth user:', authError.message);
    throw authError;
  }

  // Update the user to admin role
  const { error: updateError } = await supabase
    .from(getSchemaTable('users', modeId, SHARED_SCHEMA))
    .update({ role: 'admin' })
    .eq('id', authUser.user.id);

  if (updateError) {
    console.error('Failed to update user role:', updateError.message);
  }

  return authUser.user.id;
}

async function migrateMicrosites(
  microsites: Record<string, MicrositeJson>,
  systemUserId: string
) {
  console.log('\n📄 Migrating microsites...');

  const micrositeIdMap: Record<string, string> = {};

  for (const [slug, site] of Object.entries(microsites)) {
    const { data, error } = await supabase
      .from(getSchemaTable('microsites', modeId))
      .upsert({
        slug: site.id,
        user_id: systemUserId,
        title: site.title,
        subtitle: site.subtitle,
        thesis: site.thesis,
        config: {
          sourceTranscript: site.sourceTranscript,
          artifacts: site.artifacts,
          keyFindingTitles: site.keyFindingTitles,
          recommendationTitles: site.recommendationTitles,
          localPath: site.localPath,
          date: site.date,
        },
        visibility: 'internal',
        url: site.url,
        entity_count: site.entities.length,
      }, { onConflict: 'slug' })
      .select('id')
      .single();

    if (error) {
      console.error(`  ❌ Failed to insert microsite ${slug}:`, error.message);
    } else {
      micrositeIdMap[site.id] = data.id;
      console.log(`  ✓ ${site.title}`);
    }
  }

  console.log(`  ✓ ${Object.keys(microsites).length} microsites migrated`);
  return micrositeIdMap;
}

async function migrateEntityAppearances(
  entities: Record<string, EntityJson>,
  entityIdMap: Record<string, string>,
  micrositeIdMap: Record<string, string>
) {
  console.log('\n🔗 Migrating entity appearances...');

  let count = 0;

  for (const [slug, entity] of Object.entries(entities)) {
    const entityId = entityIdMap[slug];
    if (!entityId) continue;

    for (const appearance of entity.appearances) {
      const micrositeId = micrositeIdMap[appearance.micrositeId];
      if (!micrositeId) continue;

      const section = sectionMap[appearance.section] || 'key_findings';

      const { error } = await supabase
        .from(getSchemaTable('entity_appearances', modeId))
        .upsert({
          entity_id: entityId,
          microsite_id: micrositeId,
          section: section,
          context: appearance.context,
          sentiment: 'neutral',
        }, { onConflict: 'entity_id,microsite_id,section' });

      if (error) {
        console.error(`  ❌ Failed to insert appearance for ${slug}:`, error.message);
      } else {
        count++;
      }
    }
  }

  console.log(`  ✓ ${count} entity appearances migrated`);
}

async function migrateEntityRelations(
  entities: Record<string, EntityJson>,
  entityIdMap: Record<string, string>
) {
  console.log('\n🔀 Migrating entity relations...');

  let count = 0;
  const seenPairs = new Set<string>();

  for (const [slug, entity] of Object.entries(entities)) {
    const entityAId = entityIdMap[slug];
    if (!entityAId) continue;

    for (const related of entity.relatedEntities) {
      const entityBId = entityIdMap[related.slug];
      if (!entityBId) continue;

      // Ensure consistent ordering (a < b) and avoid duplicates
      const [id1, id2] = entityAId < entityBId
        ? [entityAId, entityBId]
        : [entityBId, entityAId];

      const pairKey = `${id1}-${id2}`;
      if (seenPairs.has(pairKey)) continue;
      seenPairs.add(pairKey);

      const { error } = await supabase
        .from(getSchemaTable('entity_relations', modeId))
        .upsert({
          entity_a_id: id1,
          entity_b_id: id2,
          co_occurrence_count: related.coOccurrenceCount,
        }, { onConflict: 'entity_a_id,entity_b_id' });

      if (error) {
        console.error(`  ❌ Failed to insert relation ${slug}<->${related.slug}:`, error.message);
      } else {
        count++;
      }
    }
  }

  console.log(`  ✓ ${count} entity relations migrated`);
}

async function migrateEntityOpportunities(
  entities: Record<string, EntityJson>,
  entityIdMap: Record<string, string>
) {
  console.log('\n🎯 Migrating entity-opportunity mappings...');

  let count = 0;

  for (const [slug, entity] of Object.entries(entities)) {
    const entityId = entityIdMap[slug];
    if (!entityId) continue;

    for (const oppSlug of entity.opportunities) {
      // Get opportunity ID
      const { data: opp } = await supabase
        .from(getSchemaTable('opportunities', modeId))
        .select('id')
        .eq('slug', oppSlug)
        .single();

      if (!opp) continue;

      const { error } = await supabase
        .from(getSchemaTable('entity_opportunities', modeId))
        .upsert({
          entity_id: entityId,
          opportunity_id: opp.id,
        }, { onConflict: 'entity_id,opportunity_id' });

      if (error) {
        console.error(`  ❌ Failed to insert entity-opp ${slug}<->${oppSlug}:`, error.message);
      } else {
        count++;
      }
    }
  }

  console.log(`  ✓ ${count} entity-opportunity mappings migrated`);
}

async function main() {
  console.log('🚀 Starting JSON to Supabase migration...\n');
  console.log(`   URL: ${SUPABASE_URL}`);

  try {
    // Load JSON files
    const entitiesData = await loadJsonFile<{ entities: Record<string, EntityJson> }>('entities.json');
    const opportunitiesData = await loadJsonFile<{ opportunities: Record<string, OpportunityJson> }>('opportunities.json');
    const indexData = await loadJsonFile<{ microsites: Record<string, MicrositeJson> }>('index.json');

    // Get or create system user
    const systemUserId = await getOrCreateSystemUser();
    console.log(`\n👤 Using system user: ${systemUserId}`);

    // Migrate in dependency order
    await migrateOpportunities(opportunitiesData.opportunities);
    const entityIdMap = await migrateEntities(entitiesData.entities);
    const micrositeIdMap = await migrateMicrosites(indexData.microsites, systemUserId);
    await migrateEntityAppearances(entitiesData.entities, entityIdMap, micrositeIdMap);
    await migrateEntityRelations(entitiesData.entities, entityIdMap);
    await migrateEntityOpportunities(entitiesData.entities, entityIdMap);

    console.log('\n✅ Migration complete!');
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

main();