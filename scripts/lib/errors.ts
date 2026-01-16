// Error types for the processing pipeline

export enum GenerationErrorType {
  TRANSCRIPT_NOT_FOUND = 'TRANSCRIPT_NOT_FOUND',
  INVALID_WORKFLOW = 'INVALID_WORKFLOW',
  CLAUDE_API_ERROR = 'CLAUDE_API_ERROR',
  CLAUDE_RATE_LIMIT = 'CLAUDE_RATE_LIMIT',
  GROK_API_ERROR = 'GROK_API_ERROR',
  PERPLEXITY_API_ERROR = 'PERPLEXITY_API_ERROR',
  BIRD_CLI_ERROR = 'BIRD_CLI_ERROR',
  INVALID_RESPONSE = 'INVALID_RESPONSE',
  BUILD_FAILED = 'BUILD_FAILED',
  ENTITY_EXTRACTION_FAILED = 'ENTITY_EXTRACTION_FAILED',
  SUPABASE_ERROR = 'SUPABASE_ERROR',
}

export class GenerationError extends Error {
  constructor(
    public type: GenerationErrorType,
    message: string,
    public stage?: number,
    public recoverable: boolean = false
  ) {
    super(message);
    this.name = 'GenerationError';
  }
}

const RETRY_CONFIG = {
  maxRetries: 3,
  backoffMs: 1000,
  backoffMultiplier: 2,
};

export async function withRetry<T>(
  fn: () => Promise<T>,
  errorType: GenerationErrorType,
  options?: { maxRetries?: number }
): Promise<T> {
  const maxRetries = options?.maxRetries ?? RETRY_CONFIG.maxRetries;
  let lastError: Error;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      console.warn(`Attempt ${attempt + 1}/${maxRetries} failed:`, lastError.message);

      if (attempt < maxRetries - 1) {
        const delay = RETRY_CONFIG.backoffMs * Math.pow(RETRY_CONFIG.backoffMultiplier, attempt);
        await sleep(delay);
      }
    }
  }

  throw new GenerationError(errorType, lastError!.message, undefined, false);
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
