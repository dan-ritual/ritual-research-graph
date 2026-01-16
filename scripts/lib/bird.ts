// bird-cli SSH integration

import { exec } from 'child_process';
import { promisify } from 'util';
import { GenerationError, GenerationErrorType } from './errors.js';
import type { BirdOutput } from './types.js';

const execAsync = promisify(exec);

const SSH_HOST = process.env.BIRD_SSH_HOST || 'gcp-agentic';
const BIRD_PROJECT_PATH = process.env.BIRD_PROJECT_PATH || '~/rite';
const SSH_TIMEOUT = 60000; // 60 seconds per elicitation decision

export interface BirdOptions {
  command: 'search' | 'thread' | 'user' | 'engagement';
  query: string;
  limit?: number;
}

export async function queryBird(options: BirdOptions): Promise<unknown> {
  const { command, query, limit = 20 } = options;

  // Escape single quotes in query
  const escapedQuery = query.replace(/'/g, "'\\''");

  const sshCommand = `ssh ${SSH_HOST} "cd ${BIRD_PROJECT_PATH} && bird ${command} '${escapedQuery}' --limit ${limit} --json"`;

  try {
    const { stdout, stderr } = await execAsync(sshCommand, { timeout: SSH_TIMEOUT });

    if (stderr && !stdout) {
      throw new Error(`bird-cli stderr: ${stderr}`);
    }

    return JSON.parse(stdout);
  } catch (error) {
    const err = error as Error & { killed?: boolean; code?: string };

    if (err.killed) {
      throw new GenerationError(
        GenerationErrorType.BIRD_CLI_ERROR,
        `bird-cli timed out after ${SSH_TIMEOUT / 1000}s`
      );
    }

    throw new GenerationError(
      GenerationErrorType.BIRD_CLI_ERROR,
      `bird-cli error: ${err.message}`
    );
  }
}

export async function executeBirdResearch(entities: string[]): Promise<BirdOutput> {
  const threads: BirdOutput['threads'] = [];
  const accounts: BirdOutput['accounts'] = [];

  // Limit to top 5 entities to avoid too many SSH calls
  const entitiesToSearch = entities.slice(0, 5);

  for (const entity of entitiesToSearch) {
    try {
      const searchResult = await queryBird({
        command: 'search',
        query: entity,
        limit: 10,
      }) as { tweets?: Array<{
        id: string;
        author: string;
        text: string;
        likes?: number;
        retweets?: number;
        replies?: number;
        created_at: string;
      }> };

      if (searchResult.tweets) {
        threads.push(...searchResult.tweets.map(t => ({
          id: t.id,
          author: t.author,
          content: t.text,
          engagement: {
            likes: t.likes || 0,
            retweets: t.retweets || 0,
            replies: t.replies || 0,
          },
          timestamp: t.created_at,
        })));
      }
    } catch (error) {
      // Log but continue with other entities
      console.warn(`bird-cli failed for "${entity}":`, (error as Error).message);
    }
  }

  return { threads, accounts };
}
