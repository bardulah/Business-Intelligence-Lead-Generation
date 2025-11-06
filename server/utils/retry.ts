import pRetry, { AbortError } from 'p-retry';
import logger from './logger';

interface RetryOptions {
  retries?: number;
  minTimeout?: number;
  maxTimeout?: number;
  factor?: number;
  onFailedAttempt?: (error: any) => void | Promise<void>;
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const defaultOptions = {
    retries: 3,
    minTimeout: 1000,
    maxTimeout: 10000,
    factor: 2,
    onFailedAttempt: (error: any) => {
      logger.warn(
        `Attempt ${error.attemptNumber} failed. ${error.retriesLeft} retries left.`,
        { error: error.message }
      );
    },
    ...options,
  };

  return pRetry(async () => {
    try {
      return await fn();
    } catch (error: any) {
      // Don't retry on specific errors
      if (
        error.response?.status === 404 ||
        error.response?.status === 401 ||
        error.response?.status === 403
      ) {
        throw new AbortError(error);
      }
      throw error;
    }
  }, defaultOptions);
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function withExponentialBackoff<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;

      if (attempt < maxAttempts - 1) {
        const delay = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s, 8s...
        logger.info(`Retry attempt ${attempt + 1} after ${delay}ms`);
        await sleep(delay);
      }
    }
  }

  throw lastError!;
}
