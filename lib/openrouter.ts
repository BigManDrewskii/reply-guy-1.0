import type { PageData, AnalysisResult, CachedAnalysis } from '@/types';

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
}

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export async function streamCompletion(
  messages: OpenRouterMessage[],
  apiKey: string,
  options: StreamOptions = {}
): Promise<void> {
  const { onChunk, onComplete, onError } = options;

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': chrome.runtime?.id || 'chrome-extension://reply-guy',
        'X-Title': 'Reply Guy',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-sonnet-4',
        messages,
        stream: true,
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body');
    }

    const decoder = new TextDecoder();
    let fullText = '';

    while (true) {
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
            // Skip invalid JSON
          }
        }
      }
    }

    if (onComplete) onComplete(fullText);
  } catch (error) {
    if (onError) {
      onError(error instanceof Error ? error : new Error('Unknown error'));
    } else {
      throw error;
    }
  }
}

export function getCacheKey(pageData: PageData): string {
  return pageData.url;
}

export function isCacheValid(timestamp: number): boolean {
  return Date.now() - timestamp < CACHE_DURATION;
}

export async function getCachedAnalysis(pageUrl: string): Promise<AnalysisResult | null> {
  return new Promise((resolve) => {
    chrome.storage.local.get(`analysis_${pageUrl}`, (result) => {
      const cached = result[`analysis_${pageUrl}`] as CachedAnalysis | undefined;
      if (cached && isCacheValid(cached.timestamp)) {
        resolve(cached.analysis);
      } else {
        resolve(null);
      }
    });
  });
}

export async function setCachedAnalysis(pageUrl: string, analysis: AnalysisResult): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.set({
      [`analysis_${pageUrl}`]: {
        analysis,
        timestamp: Date.now(),
      }
    }, () => resolve());
  });
}
