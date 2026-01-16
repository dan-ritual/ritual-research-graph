// Stage 3: Entity Extraction

import path from 'path';
import { generateJsonWithClaude } from '../lib/claude.js';
import { buildEntityExtractionPrompt } from '../prompts/extract-entities.js';
import { writeFile, readFile, fileExists } from '../utils/files.js';
import type { Artifact, GenerationConfig, ExtractedEntity, EntityExtractionResult } from '../lib/types.js';
import type { Ora } from 'ora';

interface EntityExtractionOptions {
  config: GenerationConfig;
  intelligenceBrief: Artifact;
  narrativeResearch: Artifact | null;
  spinner: Ora;
  outputDir: string;
}

export async function extractEntities(options: EntityExtractionOptions): Promise<Artifact> {
  const { config, intelligenceBrief, narrativeResearch, spinner, outputDir } = options;

  spinner.text = 'Stage 3/6: Extracting entities with Claude...';

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

  // Create output artifact
  const topic = config.title || 'Research';
  const slug = topic
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .slice(0, 40);

  const artifact: Artifact = {
    id: 'entities',
    name: 'Extracted Entities',
    filename: `${slug}_Entities.json`,
    content: JSON.stringify({ entities, extractedAt: new Date().toISOString() }, null, 2),
  };
  artifact.path = path.join(outputDir, 'artifacts', artifact.filename);

  if (!config.dryRun) {
    await writeFile(artifact.path, artifact.content);
  }

  return artifact;
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
