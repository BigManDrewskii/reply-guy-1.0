// Rate Limiter - Prevents too many API requests
// Uses a simple sliding window: minimum 5 seconds between requests

interface RateLimitState {
  lastRequestTime: number;
  pending: boolean;
}

const state: RateLimitState = {
  lastRequestTime: 0,
  pending: false
};

const MIN_INTERVAL_MS = 5000; // 5 seconds

/**
 * Check if an API call can be made
 * @returns true if allowed, false if rate limited
 */
export function canMakeRequest(): boolean {
  const now = Date.now();
  const timeSinceLastRequest = now - state.lastRequestTime;
  return timeSinceLastRequest >= MIN_INTERVAL_MS;
}

/**
 * Get time until next request can be made (in milliseconds)
 * @returns milliseconds to wait, or 0 if request can be made now
 */
export function getTimeUntilNextRequest(): number {
  const now = Date.now();
  const timeSinceLastRequest = now - state.lastRequestTime;
  const waitTime = MIN_INTERVAL_MS - timeSinceLastRequest;
  return Math.max(0, waitTime);
}

/**
 * Mark a request as being made
 */
export function markRequest(): void {
  state.lastRequestTime = Date.now();
}

/**
 * Wait for rate limit to pass, then execute function
 * @param fn Function to execute after rate limit
 * @returns Promise with function result
 */
export async function withRateLimit<T>(fn: () => Promise<T>): Promise<T> {
  // If already pending, wait
  while (state.pending) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Check rate limit
  const waitTime = getTimeUntilNextRequest();
  if (waitTime > 0) {
    console.log(`[RateLimiter] Waiting ${waitTime}ms before request`);
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }

  // Mark as pending and execute
  state.pending = true;
  try {
    markRequest();
    const result = await fn();
    return result;
  } finally {
    state.pending = false;
  }
}

/**
 * Get human-readable wait time
 * @returns String like "2s" or "Ready"
 */
export function getWaitTimeDisplay(): string {
  const waitTime = getTimeUntilNextRequest();
  if (waitTime === 0) return 'Ready';
  const seconds = Math.ceil(waitTime / 1000);
  return `${seconds}s`;
}
