// Stage 2: Multi-AI Research Chain

import path from 'path';
import { generateWithClaude } from '../lib/claude.js';
import { executeGrokResearch } from '../lib/grok.js';
import { executePerplexityResearch } from '../lib/perplexity.js';
import { executeBirdResearch } from '../lib/bird.js';
import { buildSynthesisPrompt } from '../prompts/synthesize-research.js';
import { writeFile } from '../utils/files.js';
import type { Artifact, GenerationConfig, ResearchChainInput, ResearchChainOutput, GrokOutput, PerplexityOutput, BirdOutput } from '../lib/types.js';
import type { Ora } from 'ora';

interface ResearchChainOptions {
  config: GenerationConfig;
  intelligenceBrief: string;
  entities: string[];
  spinner: Ora;
  outputDir: string;
}

export async function executeResearchChain(options: ResearchChainOptions): Promise<Artifact | null> {
  const { config, intelligenceBrief, entities, spinner, outputDir } = options;

  const topic = config.title || 'Research Topic';
  const input: ResearchChainInput = {
    topic,
    entities,
    intelligenceBrief,
  };

  spinner.text = 'Stage 2/6: Starting multi-AI research chain...';

  // Execute Steps 1-3 in parallel using Promise.allSettled
  // This allows graceful degradation if some providers fail
  spinner.text = 'Stage 2/6: Querying Grok, Perplexity, and bird-cli in parallel...';

  const [grokResult, perplexityResult, birdResult] = await Promise.allSettled([
    executeGrokResearch(input).catch(err => {
      console.warn('\n⚠️  Grok research failed:', err.message);
      return { error: err.message } as { error: string };
    }),
    executePerplexityResearch(input).catch(err => {
      console.warn('\n⚠️  Perplexity research failed:', err.message);
      return { error: err.message } as { error: string };
    }),
    executeBirdResearch(entities).catch(err => {
      console.warn('\n⚠️  bird-cli research failed:', err.message);
      return { error: err.message } as { error: string };
    }),
  ]);

  // Extract results with error handling
  const grokOutput = grokResult.status === 'fulfilled'
    ? grokResult.value
    : { error: (grokResult.reason as Error).message };

  const perplexityOutput = perplexityResult.status === 'fulfilled'
    ? perplexityResult.value
    : { error: (perplexityResult.reason as Error).message };

  const birdOutput = birdResult.status === 'fulfilled'
    ? birdResult.value
    : { error: (birdResult.reason as Error).message };

  // Save intermediate results for debugging
  const debugDir = path.join(outputDir, 'debug');
  if (!config.dryRun) {
    await writeFile(path.join(debugDir, 'grok.json'), JSON.stringify(grokOutput, null, 2));
    await writeFile(path.join(debugDir, 'perplexity.json'), JSON.stringify(perplexityOutput, null, 2));
    await writeFile(path.join(debugDir, 'bird.json'), JSON.stringify(birdOutput, null, 2));
  }

  // Check if we have any usable data
  const hasGrok = !('error' in grokOutput);
  const hasPerplexity = !('error' in perplexityOutput);
  const hasBird = !('error' in birdOutput);

  if (!hasGrok && !hasPerplexity && !hasBird) {
    spinner.warn('Stage 2/6: All external research providers failed, skipping synthesis');
    return null;
  }

  // Step 4: Claude synthesis
  spinner.text = 'Stage 2/6: Synthesizing research with Claude...';

  const grokText = hasGrok
    ? formatGrokOutput(grokOutput as GrokOutput)
    : '(Grok data unavailable)';

  const perplexityText = hasPerplexity
    ? formatPerplexityOutput(perplexityOutput as PerplexityOutput)
    : '(Perplexity data unavailable)';

  const birdText = hasBird
    ? formatBirdOutput(birdOutput as BirdOutput)
    : '(Twitter data unavailable)';

  const synthesisContent = await generateWithClaude({
    prompt: buildSynthesisPrompt(topic, grokText, perplexityText, birdText),
    maxTokens: 8192,
    temperature: 0.7,
  });

  // Create slug for filename
  const slug = topic
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .slice(0, 40);

  const artifact: Artifact = {
    id: 'narrative-research',
    name: 'Narrative Research Notes',
    filename: `${slug}_Narrative_Research.md`,
    content: synthesisContent,
  };
  artifact.path = path.join(outputDir, 'artifacts', artifact.filename);

  if (!config.dryRun) {
    await writeFile(artifact.path, artifact.content);
  }

  return artifact;
}

function formatGrokOutput(output: GrokOutput): string {
  let text = `**Real-Time Context:**\n${output.realTimeContext}\n\n`;

  if (output.recentEvents?.length > 0) {
    text += '**Recent Events:**\n';
    for (const event of output.recentEvents) {
      text += `- ${event.date}: ${event.event} (${event.source})\n`;
    }
    text += '\n';
  }

  if (output.sentiment) {
    text += `**Overall Sentiment:** ${output.sentiment.overall}\n`;
    if (output.sentiment.breakdown) {
      for (const [entity, sentiment] of Object.entries(output.sentiment.breakdown)) {
        text += `- ${entity}: ${sentiment}\n`;
      }
    }
  }

  return text;
}

function formatPerplexityOutput(output: PerplexityOutput): string {
  let text = output.research + '\n\n';

  if (output.citations?.length > 0) {
    text += '**Citations:**\n';
    for (const citation of output.citations) {
      text += `- [${citation.title}](${citation.url})\n`;
    }
  }

  return text;
}

function formatBirdOutput(output: BirdOutput): string {
  let text = '';

  if (output.threads?.length > 0) {
    text += '**Relevant Twitter Threads:**\n\n';
    for (const thread of output.threads.slice(0, 10)) {
      text += `**@${thread.author}** (${thread.timestamp}):\n`;
      text += `> ${thread.content.slice(0, 280)}${thread.content.length > 280 ? '...' : ''}\n`;
      text += `Engagement: ${thread.engagement.likes} likes, ${thread.engagement.retweets} retweets\n\n`;
    }
  } else {
    text = '(No Twitter threads found)\n';
  }

  return text;
}

// Helper to extract preliminary entities from intelligence brief
export function extractPreliminaryEntities(intelligenceBrief: string): string[] {
  // Simple extraction: look for capitalized multi-word names, protocol names, etc.
  const entityPatterns = [
    // Known protocol patterns
    /\b(Ondo Finance|Maple Finance|Zivoe|Credix|Centrifuge|Goldfinch|Clearpool|Provenance|Plume)\b/gi,
    // Known companies
    /\b(BlackRock|Franklin Templeton|WisdomTree|Hamilton Lane)\b/gi,
    // DeFi protocols
    /\b(Aave|Compound|Morpho|Euler|Hyperliquid|EtherFi|Alchemix)\b/gi,
  ];

  const entities = new Set<string>();

  for (const pattern of entityPatterns) {
    const matches = intelligenceBrief.matchAll(pattern);
    for (const match of matches) {
      entities.add(match[0]);
    }
  }

  return Array.from(entities);
}
