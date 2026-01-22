// Stage 3: Entity and Opportunity Extraction

import path from 'path';
import { generateJsonWithClaude } from '../lib/claude.js';
import { buildEntityExtractionPrompt } from '../prompts/extract-entities.js';
import { writeFile, readFile, fileExists } from '../utils/files.js';
import type {
  Artifact,
  GenerationConfig,
  ExtractedEntity,
  ExtractedOpportunity,
  EntityExtractionResult
} from '../lib/types.js';
import type { Ora } from 'ora';

interface EntityExtractionOptions {
  config: GenerationConfig;
  intelligenceBrief: Artifact;
  narrativeResearch: Artifact | null;
  spinner: Ora;
  outputDir: string;
  jobId?: string; // Optional job ID for opportunity linking
}

interface ExtractionOutput {
  entitiesArtifact: Artifact;
  opportunitiesArtifact: Artifact | null;
  entities: ExtractedEntity[];
  opportunities: ExtractedOpportunity[];
}

export async function extractEntities(options: EntityExtractionOptions): Promise<ExtractionOutput> {
  const { config, intelligenceBrief, narrativeResearch, spinner, outputDir, jobId } = options;

  spinner.text = 'Stage 3/6: Extracting entities and opportunities with Claude...';

  const prompt = buildEntityExtractionPrompt(
    intelligenceBrief.content,
    narrativeResearch?.content || null
  );

  const result = await generateJsonWithClaude<EntityExtractionResult>({
    prompt,
    maxTokens: 8192,
    temperature: 0.3, // Lower temperature for structured extraction
  });

  // Validate and deduplicate entities
  const entities = deduplicateEntities(result.entities || []);

  // Extract opportunities (if any)
  const opportunities = result.opportunities || [];

  // Create output artifact
  const topic = config.title || 'Research';
  const slug = topic
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .slice(0, 40);

  // Entities artifact
  const entitiesArtifact: Artifact = {
    id: 'entities',
    name: 'Extracted Entities',
    filename: `${slug}_Entities.json`,
    content: JSON.stringify({
      entities,
      extractedAt: new Date().toISOString()
    }, null, 2),
  };
  entitiesArtifact.path = path.join(outputDir, 'artifacts', entitiesArtifact.filename);

  // Opportunities artifact (if any found)
  let opportunitiesArtifact: Artifact | null = null;
  if (opportunities.length > 0) {
    opportunitiesArtifact = {
      id: 'opportunities',
      name: 'Extracted Opportunities',
      filename: `${slug}_Opportunities.json`,
      content: JSON.stringify({
        opportunities,
        jobId,
        extractedAt: new Date().toISOString()
      }, null, 2),
    };
    opportunitiesArtifact.path = path.join(outputDir, 'artifacts', opportunitiesArtifact.filename);

    spinner.text = `Stage 3/6: Found ${entities.length} entities and ${opportunities.length} opportunities`;
  }

  if (!config.dryRun) {
    await writeFile(entitiesArtifact.path, entitiesArtifact.content);
    if (opportunitiesArtifact?.path) {
      await writeFile(opportunitiesArtifact.path, opportunitiesArtifact.content);
    }
  }

  return {
    entitiesArtifact,
    opportunitiesArtifact,
    entities,
    opportunities,
  };
}

/**
 * Deduplicate entities by canonical name (case-insensitive)
 * Merge aliases and mentions from duplicates
 */
function deduplicateEntities(entities: ExtractedEntity[]): ExtractedEntity[] {
  const seen = new Map<string, ExtractedEntity>();

  for (const entity of entities) {
    const key = entity.canonicalName.toLowerCase();

    if (seen.has(key)) {
      // Merge with existing
      const existing = seen.get(key)!;

      // Merge aliases (unique)
      const allAliases = new Set([...existing.aliases, ...entity.aliases]);
      existing.aliases = Array.from(allAliases);

      // Merge mentions (max 5)
      existing.mentions = [...existing.mentions, ...entity.mentions].slice(0, 5);

      // Prefer non-null values for url/twitter
      existing.url = existing.url || entity.url;
      existing.twitter = existing.twitter || entity.twitter;

      // Keep longer description
      if (entity.description.length > existing.description.length) {
        existing.description = entity.description;
      }
    } else {
      seen.set(key, { ...entity });
    }
  }

  return Array.from(seen.values());
}

/**
 * Load existing entities from file if available
 */
export async function loadExistingEntities(outputDir: string, slug: string): Promise<ExtractedEntity[]> {
  const entityPath = path.join(outputDir, 'artifacts', `${slug}_Entities.json`);

  if (await fileExists(entityPath)) {
    const content = await readFile(entityPath);
    const data = JSON.parse(content);
    return data.entities || [];
  }

  return [];
}

/**
 * Create slugs for entities to match with linked_entities
 */
export function entityNameToSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 50);
}

/**
 * Match opportunity linked_entities to entity slugs
 */
export function resolveLinkedEntities(
  opportunities: ExtractedOpportunity[],
  entities: ExtractedEntity[]
): Map<string, string[]> {
  const entitySlugMap = new Map<string, string>();

  // Build lookup: canonicalName (lowercase) -> slug
  for (const entity of entities) {
    const slug = entityNameToSlug(entity.canonicalName);
    entitySlugMap.set(entity.canonicalName.toLowerCase(), slug);
    // Also add aliases
    for (const alias of entity.aliases) {
      entitySlugMap.set(alias.toLowerCase(), slug);
    }
  }

  // For each opportunity, resolve linked_entities to slugs
  const result = new Map<string, string[]>();

  for (const opp of opportunities) {
    const resolvedSlugs: string[] = [];
    for (const linked of opp.linked_entities) {
      const slug = entitySlugMap.get(linked.toLowerCase());
      if (slug) {
        resolvedSlugs.push(slug);
      }
    }
    result.set(opp.name, resolvedSlugs);
  }

  return result;
}
