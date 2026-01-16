// Claude API client

import Anthropic from '@anthropic-ai/sdk';
import { GenerationError, GenerationErrorType, withRetry } from './errors.js';

let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new GenerationError(
        GenerationErrorType.CLAUDE_API_ERROR,
        'ANTHROPIC_API_KEY not found in environment'
      );
    }
    client = new Anthropic({ apiKey });
  }
  return client;
}

export interface ClaudeOptions {
  prompt: string;
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
}

export async function generateWithClaude(options: ClaudeOptions): Promise<string> {
  const { prompt, maxTokens = 8192, temperature = 0.7, systemPrompt } = options;

  return withRetry(
    async () => {
      const anthropic = getClient();

      const messages: Anthropic.MessageParam[] = [
        {
          role: 'user',
          content: prompt,
        },
      ];

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: maxTokens,
        temperature,
        ...(systemPrompt && { system: systemPrompt }),
        messages,
      });

      // Extract text from response
      const textBlock = response.content.find(block => block.type === 'text');
      if (!textBlock || textBlock.type !== 'text') {
        throw new Error('No text response from Claude');
      }

      return textBlock.text;
    },
    GenerationErrorType.CLAUDE_API_ERROR
  );
}

export async function generateJsonWithClaude<T>(options: ClaudeOptions): Promise<T> {
  const response = await generateWithClaude({
    ...options,
    prompt: options.prompt + '\n\nRespond with valid JSON only. No markdown code blocks.',
  });

  // Try to parse JSON from response
  try {
    // Handle case where response might have markdown code blocks
    const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
    const jsonStr = jsonMatch ? jsonMatch[1].trim() : response.trim();
    return JSON.parse(jsonStr) as T;
  } catch (error) {
    // Try direct parse
    try {
      return JSON.parse(response) as T;
    } catch {
      throw new GenerationError(
        GenerationErrorType.INVALID_RESPONSE,
        `Failed to parse JSON from Claude response: ${response.slice(0, 200)}...`
      );
    }
  }
}
