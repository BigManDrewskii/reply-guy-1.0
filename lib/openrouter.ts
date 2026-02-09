import type { AnalysisResult, CachedAnalysis } from '@/types';
import { db } from '@/lib/db';

interface StreamCallback {
  (chunk: string): void;
}

interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface StreamOptions {
  onChunk?: StreamCallback;
  onComplete?: (fullText: string) => void;
  onError?: (error: Error) => void;
  signal?: AbortSignal;
}

/**
 * Model fallback chain as specified in PRD:
 * claude-sonnet-4 → gpt-4o → llama-3.3-70b-instruct
 */
const MODEL_FALLBACK_CHAIN = [
  'anthropic/claude-sonnet-4',
  'openai/gpt-4o',
  'meta-llama/llama-3.3-70b-instruct',
];

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Stream a completion from OpenRouter with model fallback chain.
 * Tries each model in sequence if the previous one fails.
 * Always sends data_collection: 'deny' for user privacy.
 */
export async function streamCompletion(
  messages: OpenRouterMessage[],
  apiKey: string,
  options: StreamOptions = {}
): Promise<void> {
  const { onChunk, onComplete, onError, signal } = options;

  let lastError: Error | null = null;

  for (const model of MODEL_FALLBACK_CHAIN) {
    try {
      // Check if aborted before attempting
      if (signal?.aborted) {
        throw new DOMException('Aborted', 'AbortError');
      }

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': chrome.runtime?.id
            ? `chrome-extension://${chrome.runtime.id}`
            : 'chrome-extension://reply-guy',
          'X-Title': 'Reply Guy',
        },
        body: JSON.stringify({
          model,
          messages,
          stream: true,
          temperature: 0.7,
          max_tokens: 2000,
          data_collection: 'deny', // Privacy: never allow data collection
        }),
        signal,
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        throw new Error(`OpenRouter API error (${model}): ${response.status} ${errorText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();
      let fullText = '';

      try {
        while (true) {
          if (signal?.aborted) {
            reader.cancel();
            throw new DOMException('Aborted', 'AbortError');
          }

          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);

              if (data === '[DONE]') {
                if (onComplete) onComplete(fullText);
                return;
              }

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content;

                if (content) {
                  fullText += content;
                  if (onChunk) onChunk(content);
                }
              } catch {
                // Skip invalid JSON chunks
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }

      if (onComplete) onComplete(fullText);
      return; // Success — exit the fallback loop
    } catch (error) {
      // If aborted, don't try fallback models
      if (error instanceof DOMException && error.name === 'AbortError') {
        if (onError) onError(error);
        return;
      }

      lastError = error instanceof Error ? error : new Error('Unknown error');

      // If this is the last model in the chain, report the error
      if (model === MODEL_FALLBACK_CHAIN[MODEL_FALLBACK_CHAIN.length - 1]) {
        if (onError) {
          onError(new Error(`All models failed. Last error: ${lastError.message}`));
        } else {
          throw lastError;
        }
      }
      // Otherwise, continue to next model in fallback chain
    }
  }
}

/**
 * Generate a cache key from a page URL.
 */
export function getCacheKey(url: string): string {
  return url;
}

/**
 * Check if a cached timestamp is still valid (within 24hr TTL).
 */
export function isCacheValid(timestamp: number): boolean {
  return Date.now() - timestamp < CACHE_DURATION;
}

/**
 * Retrieve a cached analysis from Dexie (IndexedDB).
 * Returns null if not found or expired.
 */
export async function getCachedAnalysis(pageUrl: string): Promise<AnalysisResult | null> {
  try {
    const cached = await db.analysisCache.get(pageUrl);
    if (cached && isCacheValid(cached.timestamp)) {
      return cached.analysis;
    }
    // Clean up expired cache entry
    if (cached) {
      await db.analysisCache.delete(pageUrl);
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Store an analysis result in Dexie cache with current timestamp.
 */
export async function setCachedAnalysis(pageUrl: string, analysis: AnalysisResult): Promise<void> {
  try {
    await db.analysisCache.put({
      pageUrl,
      analysis,
      timestamp: Date.now(),
    });
  } catch {
    // Silently fail — caching is non-critical
  }
}

/**
 * Extract JSON from a response that may contain markdown code blocks.
 * Shared utility to avoid duplication across hooks.
 */
export function extractJsonFromResponse(text: string): string {
  // Strip markdown code block wrappers if present
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }
  return cleaned.trim();
}
