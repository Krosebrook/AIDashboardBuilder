/**
 * Retry logic with exponential backoff
 */

import { ModelError } from '@/types/ai';
import { logAIError } from './logger';

interface RetryConfig {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
  retryableErrors: string[];
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 30000,
  backoffMultiplier: 2,
  retryableErrors: [
    'RATE_LIMIT',
    'TIMEOUT',
    'SERVICE_UNAVAILABLE',
    'NETWORK_ERROR',
    '429',
    '503',
    '504',
  ],
};

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Calculate delay with exponential backoff
 */
function calculateDelay(attempt: number, config: RetryConfig): number {
  const delay = config.initialDelayMs * Math.pow(config.backoffMultiplier, attempt);
  return Math.min(delay, config.maxDelayMs);
}

/**
 * Check if error is retryable
 */
function isRetryable(error: ModelError, config: RetryConfig): boolean {
  return config.retryableErrors.some(code => 
    error.code.includes(code) || error.message.includes(code)
  );
}

/**
 * Retry function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  context: {
    requestId: string;
    model: string;
    provider: string;
  },
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const retryConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  let lastError: ModelError | null = null;

  for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const modelError: ModelError = error instanceof Error
        ? {
            code: 'UNKNOWN_ERROR',
            message: error.message,
            provider: context.provider as any,
            retryable: false,
            originalError: error,
          }
        : {
            code: 'UNKNOWN_ERROR',
            message: 'An unknown error occurred',
            provider: context.provider as any,
            retryable: false,
            originalError: error,
          };

      lastError = modelError;

      // Check if error is retryable
      if (!isRetryable(modelError, retryConfig) || attempt === retryConfig.maxRetries) {
        logAIError({
          requestId: context.requestId,
          model: context.model,
          provider: context.provider,
          error: modelError.message,
          retryable: false,
          attempt,
        });
        throw modelError;
      }

      // Log retry attempt
      logAIError({
        requestId: context.requestId,
        model: context.model,
        provider: context.provider,
        error: modelError.message,
        retryable: true,
        attempt,
      });

      // Calculate and apply backoff delay
      const delay = calculateDelay(attempt, retryConfig);
      await sleep(delay);
    }
  }

  // Should never reach here, but TypeScript needs it
  throw lastError || new Error('Retry failed');
}

/**
 * Add jitter to delay to prevent thundering herd
 */
export function addJitter(delay: number, jitterFactor: number = 0.1): number {
  const jitter = delay * jitterFactor * (Math.random() * 2 - 1);
  return Math.max(0, delay + jitter);
}

/**
 * Create retryable function
 */
export function makeRetryable<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  config?: Partial<RetryConfig>
): T {
  return (async (...args: Parameters<T>): Promise<Awaited<ReturnType<T>>> => {
    return retryWithBackoff(
      () => fn(...args),
      {
        requestId: 'unknown',
        model: 'unknown',
        provider: 'unknown',
      },
      config
    );
  }) as T;
}
