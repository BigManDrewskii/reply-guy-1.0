import { streamCompletion, extractJsonFromResponse } from '@/lib/openrouter';

// ============================================
// Multi-Source Content Ingestion Engine
// Accepts URLs, raw documents, and freeform text
// Extracts and segments into discrete writing samples
// ============================================

/**
 * A single ingested content source with metadata.
 */
export interface IngestedSource {
  id: string;
  type: 'url' | 'text';
  label: string;           // Display label (URL domain, "Pasted text", etc.)
  rawContent: string;      // The raw extracted content
  status: 'pending' | 'fetching' | 'ready' | 'error';
  error?: string;
}

/**
 * A discrete writing sample extracted from ingested sources.
 */
export interface WritingSample {
  text: string;
  sourceId: string;
  sourceLabel: string;
  wordCount: number;
}

/**
 * URL detection regex — matches http(s) URLs in pasted text.
 */
const URL_REGEX = /https?:\/\/[^\s<>"{}|\\^`\[\]]+/gi;

/**
 * Detect URLs in a block of text.
 */
export function detectUrls(text: string): string[] {
  const matches = text.match(URL_REGEX) || [];
  return [...new Set(matches)]; // deduplicate
}

/**
 * Check if a string looks like it's primarily a URL (single URL pasted).
 */
export function isUrl(text: string): boolean {
  const trimmed = text.trim();
  return /^https?:\/\/\S+$/.test(trimmed);
}

/**
 * Generate a short label from a URL (domain + path hint).
 */
export function urlToLabel(url: string): string {
  try {
    const parsed = new URL(url);
    const domain = parsed.hostname.replace('www.', '');
    const pathParts = parsed.pathname.split('/').filter(Boolean);
    if (pathParts.length > 0) {
      const lastPart = pathParts[pathParts.length - 1].slice(0, 30);
      return `${domain}/${lastPart}`;
    }
    return domain;
  } catch {
    return url.slice(0, 40);
  }
}

/**
 * Fetch content from a URL using Jina Reader API.
 * Returns clean markdown text extracted from the page.
 * Works from any context (sidepanel, background script).
 */
export async function fetchUrlContent(url: string): Promise<string> {
  const jinaUrl = `https://r.jina.ai/${url}`;

  const response = await fetch(jinaUrl, {
    headers: {
      'Accept': 'text/markdown',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch content (${response.status})`);
  }

  const text = await response.text();

  if (!text || text.trim().length < 50) {
    throw new Error('No meaningful content extracted from URL');
  }

  return text.trim();
}

/**
 * Use LLM to segment raw content into discrete writing samples.
 * This handles documents, extracted web pages, email threads, etc.
 * The AI identifies individual messages/posts/paragraphs that represent
 * the author's voice and returns them as separate samples.
 */
export async function segmentContentWithAI(
  rawContent: string,
  apiKey: string,
  onProgress?: (msg: string) => void,
): Promise<string[]> {
  const prompt = `You are a writing sample extraction specialist. Your job is to take raw content and extract discrete, individual writing samples from a SINGLE author.

INPUT CONTENT:
---
${rawContent.slice(0, 12000)}
---

TASK:
1. Identify individual writing samples (messages, posts, paragraphs, emails) from the content above
2. Each sample should be a complete thought or message from the same person
3. Remove any metadata, timestamps, usernames, "RT", "Retweeted", navigation text, or UI artifacts
4. Remove any content that is clearly NOT written by the primary author (quotes from others, retweets, etc.)
5. Keep the original wording exactly — do NOT paraphrase or clean up grammar
6. Each sample should be at least 10 words long
7. Aim for 5-30 samples depending on content length

Return a JSON array of strings, each being one writing sample. No markdown, no code blocks, just raw JSON:
["sample 1 text here", "sample 2 text here", ...]

CRITICAL: Return ONLY the JSON array. No explanation, no markdown formatting.`;

  return new Promise((resolve, reject) => {
    let fullResponse = '';

    streamCompletion(
      [
        {
          role: 'system',
          content: 'You extract writing samples from raw content. Return only a JSON array of strings.',
        },
        { role: 'user', content: prompt },
      ],
      apiKey,
      {
        onChunk: (chunk) => {
          fullResponse += chunk;
          if (onProgress) {
            onProgress(`Segmenting content... (${fullResponse.length} chars)`);
          }
        },
        onComplete: (finalText) => {
          try {
            const jsonStr = extractJsonFromResponse(finalText);
            const parsed = JSON.parse(jsonStr);

            if (!Array.isArray(parsed)) {
              throw new Error('Expected JSON array');
            }

            const samples = parsed
              .filter((s: unknown): s is string => typeof s === 'string')
              .map((s: string) => s.trim())
              .filter((s: string) => s.split(/\s+/).length >= 10); // min 10 words

            if (samples.length === 0) {
              throw new Error('No valid writing samples found in content');
            }

            resolve(samples);
          } catch (err) {
            console.error('[content-ingestion] Segmentation parse error:', err, '\nRaw:', finalText);
            reject(new Error('Failed to segment content into writing samples'));
          }
        },
        onError: (err) => {
          reject(err);
        },
      },
    );
  });
}

/**
 * Simple local segmentation for text that's already formatted
 * with clear separators (newlines, dashes, etc.).
 * Falls back to this when AI segmentation isn't needed.
 */
export function segmentTextLocally(text: string): string[] {
  // Try common separators in order of specificity
  const separators = [
    /\n---+\n/,      // Markdown horizontal rules
    /\n\n\n+/,       // Triple+ newlines
    /\n={3,}\n/,      // === separators
  ];

  for (const sep of separators) {
    const parts = text.split(sep).map(s => s.trim()).filter(s => s.length > 20);
    if (parts.length >= 3) {
      return parts;
    }
  }

  // Fall back to double-newline paragraph splitting
  const paragraphs = text.split(/\n\n+/).map(s => s.trim()).filter(s => s.length > 20);
  if (paragraphs.length >= 3) {
    return paragraphs;
  }

  // If nothing works, return the whole text as one sample
  return text.trim().length > 20 ? [text.trim()] : [];
}

/**
 * Generate a unique ID for sources.
 */
export function generateSourceId(): string {
  return `src_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
