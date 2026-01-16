// Perplexity API client

import { GenerationError, GenerationErrorType, withRetry } from './errors.js';
import type { PerplexityOutput, ResearchChainInput } from './types.js';

const PERPLEXITY_ENDPOINT = 'https://api.perplexity.ai/chat/completions';

export interface PerplexityOptions {
  prompt: string;
  maxTokens?: number;
}

export async function searchWithPerplexity(options: PerplexityOptions): Promise<{
  content: string;
  citations: string[];
}> {
  const { prompt, maxTokens = 4096 } = options;

  const apiKey = process.env.PERPLEXITY_API_KEY;
  if (!apiKey) {
    throw new GenerationError(
      GenerationErrorType.PERPLEXITY_API_ERROR,
      'PERPLEXITY_API_KEY not found in environment'
    );
  }

  return withRetry(
    async () => {
      const response = await fetch(PERPLEXITY_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'sonar-pro',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: maxTokens,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Perplexity API error: ${response.status} - ${error}`);
      }

      const data = await response.json();
      return {
        content: data.choices[0].message.content,
        citations: data.citations || [],
      };
    },
    GenerationErrorType.PERPLEXITY_API_ERROR
  );
}

const PERPLEXITY_RESEARCH_PROMPT = `Research the following topic comprehensively: {topic}

## Specific Entities to Research
{entities}

## Required Research Areas

1. **Entity Deep Dives**
   For each entity, find:
   - Official description and mission
   - Key metrics (TVL, users, volume if applicable)
   - Recent news (last 90 days)
   - Competitive positioning

2. **Market Context**
   - Market size and growth
   - Key trends
   - Regulatory landscape

3. **Competitive Analysis**
   - Main competitors for each entity
   - Differentiation factors

Provide CITATIONS for all facts and figures. Format as markdown with [Title](URL) links.`;

export async function executePerplexityResearch(input: ResearchChainInput): Promise<PerplexityOutput> {
  const { topic, entities } = input;

  const prompt = PERPLEXITY_RESEARCH_PROMPT
    .replace('{topic}', topic)
    .replace('{entities}', entities.map(e => `- ${e}`).join('\n'));

  const { content, citations } = await searchWithPerplexity({
    prompt,
    maxTokens: 4096,
  });

  return {
    research: content,
    citations: citations.map((url, i) => ({
      url,
      title: `Source ${i + 1}`,
      snippet: '',
    })),
    entityInsights: {}, // Could be parsed from content if needed
  };
}
