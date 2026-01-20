// Stage 4: SITE_CONFIG Generation

import path from 'path';
import { generateJsonWithClaude } from '../lib/claude.js';
import { buildSiteConfigPrompt, validateSiteConfig } from '../prompts/generate-site-config.js';
import { writeFile } from '../utils/files.js';
import type { Artifact, GenerationConfig, ExtractedEntity, SiteConfig } from '../lib/types.js';
import type { Ora } from 'ora';

interface SiteConfigOptions {
  config: GenerationConfig;
  intelligenceBrief: Artifact;
  strategicQuestions: Artifact;
  narrativeResearch: Artifact | null;
  entities: ExtractedEntity[];
  spinner: Ora;
  outputDir: string;
}

export async function generateSiteConfig(options: SiteConfigOptions): Promise<Artifact> {
  const {
    config,
    intelligenceBrief,
    strategicQuestions,
    narrativeResearch,
    entities,
    spinner,
    outputDir,
  } = options;

  spinner.text = 'Stage 4/6: Generating SITE_CONFIG with Claude...';

  const prompt = buildSiteConfigPrompt(
    intelligenceBrief.content,
    strategicQuestions.content,
    entities,
    {
      title: config.title,
      subtitle: config.subtitle,
      accentColor: config.accent,
    }
  );

  const siteConfig = await generateJsonWithClaude<SiteConfig>({
    prompt,
    maxTokens: 8192,
    temperature: 0.5, // Balanced for structured but creative output
  });

  // Validate the generated config
  if (!validateSiteConfig(siteConfig)) {
    throw new Error('Generated SITE_CONFIG failed validation');
  }

  // Enhance entities with extracted data
  const enhancedConfig = enhanceConfigWithEntities(siteConfig, entities);

  // Add source artifacts referencing the generated files
  const topic = config.title || 'Research';
  const slug = topic
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .slice(0, 40);

  enhancedConfig.sourceArtifacts = [
    {
      id: 'transcript-clean',
      title: 'Cleaned Transcript',
      subtitle: 'Processed meeting notes',
      file: `artifacts/${slug}_Transcript_Clean.md`,
      description: 'Original transcript with filler words removed and structure added',
    },
    {
      id: 'intelligence-brief',
      title: 'Intelligence Brief',
      subtitle: 'Executive analysis',
      file: `artifacts/${slug}_Intelligence_Brief.md`,
      description: 'Comprehensive analysis of the research topic with key insights',
    },
    {
      id: 'strategic-questions',
      title: 'Strategic Questions',
      subtitle: 'Research framework',
      file: `artifacts/${slug}_Strategic_Questions.md`,
      description: 'Key questions for further investigation and analysis',
    },
    ...(narrativeResearch
      ? [
          {
            id: 'narrative-research',
            title: 'Narrative Research',
            subtitle: 'Multi-source synthesis',
            file: `artifacts/${narrativeResearch.filename}`,
            description: 'Research synthesized from Grok, Perplexity, and Twitter sources',
          },
        ]
      : []),
    {
      id: 'entities',
      title: 'Extracted Entities',
      subtitle: 'Knowledge graph data',
      file: `artifacts/${slug}_Entities.json`,
      description: `${entities.length} entities extracted with metadata and relationships`,
    },
  ];

  const artifact: Artifact = {
    id: 'site-config',
    name: 'SITE_CONFIG',
    filename: `${slug}_SITE_CONFIG.json`,
    content: JSON.stringify(enhancedConfig, null, 2),
  };
  artifact.path = path.join(outputDir, 'artifacts', artifact.filename);

  if (!config.dryRun) {
    await writeFile(artifact.path, artifact.content);
  }

  return artifact;
}

/**
 * Enhance the generated config with entity metadata from extraction
 */
function enhanceConfigWithEntities(config: SiteConfig, entities: ExtractedEntity[]): SiteConfig {
  const enhanced = { ...config };

  // Merge entity data - prefer extracted data over generated
  for (const entity of entities) {
    const existingEntity = enhanced.entities[entity.canonicalName];

    enhanced.entities[entity.canonicalName] = {
      website: entity.url || existingEntity?.website || undefined,
      twitter: entity.twitter || existingEntity?.twitter || undefined,
      tvSymbol: existingEntity?.tvSymbol || undefined,
    };
  }

  return enhanced;
}
