// Grok (xAI) API client

import { GenerationError, GenerationErrorType, withRetry } from './errors.js';
import type { GrokOutput, ResearchChainInput } from './types.js';

const GROK_ENDPOINT = 'https://api.x.ai/v1/chat/completions';

export interface GrokOptions {
  prompt: string;
  maxTokens?: number;
  temperature?: number;
}

export async function generateWithGrok(options: GrokOptions): Promise<string> {
  const { prompt, maxTokens = 4096, temperature = 0.7 } = options;

  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) {
    throw new GenerationError(
      GenerationErrorType.GROK_API_ERROR,
      'XAI_API_KEY not found in environment'
    );
  }

  return withRetry(
    async () => {
      const response = await fetch(GROK_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'grok-3',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: maxTokens,
          temperature,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Grok API error: ${response.status} - ${error}`);
      }

      const data = await response.json() as { choices: Array<{ message: { content: string } }> };
      return data.choices[0].message.content;
    },
    GenerationErrorType.GROK_API_ERROR
  );
}

const GROK_RESEARCH_PROMPT = `You are gathering real-time context for research on: {topic}

## Key Entities to Research
{entities}

## Intelligence Brief Context
{briefPreview}

## Task
Provide real-time context including:

1. **Recent Events** (last 30 days)
   - Major announcements from these entities
   - Market developments
   - Partnership or integration news

2. **Current Sentiment**
   - How is each entity being discussed on Twitter/X?
   - Any controversies or concerns?
   - Community enthusiasm levels

3. **Trending Topics**
   - Related hashtags or discussions
   - Emerging narratives

## Output Format
Return valid JSON only (no markdown code blocks):
{
  "realTimeContext": "Summary paragraph of current market sentiment and recent developments...",
  "recentEvents": [
    { "event": "Description of event", "date": "YYYY-MM-DD", "source": "Source name or URL" }
  ],
  "sentiment": {
    "overall": "positive|neutral|negative",
    "breakdown": { "EntityName": "Brief sentiment description" }
  }
}`;

export async function executeGrokResearch(input: ResearchChainInput): Promise<GrokOutput> {
  const { topic, entities, intelligenceBrief } = input;

  const prompt = GROK_RESEARCH_PROMPT
    .replace('{topic}', topic)
    .replace('{entities}', entities.map(e => `- ${e}`).join('\n'))
    .replace('{briefPreview}', intelligenceBrief.slice(0, 2000));

  const response = await generateWithGrok({
    prompt,
    maxTokens: 4096,
    temperature: 0.7,
  });

  // Parse JSON from response
  try {
    // Handle case where response might have markdown code blocks
    const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
    const jsonStr = jsonMatch ? jsonMatch[1].trim() : response.trim();
    return JSON.parse(jsonStr) as GrokOutput;
  } catch (error) {
    // Try direct parse
    try {
      return JSON.parse(response) as GrokOutput;
    } catch {
      throw new GenerationError(
        GenerationErrorType.INVALID_RESPONSE,
        `Failed to parse JSON from Grok response: ${response.slice(0, 200)}...`
      );
    }
  }
}
