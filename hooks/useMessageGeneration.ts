import { useState, useCallback, useEffect, useRef } from 'react';
import { useStore } from '@/lib/store';
import { getMessagePrompt } from '@/lib/prompts';
import { streamCompletion, extractJsonFromResponse } from '@/lib/openrouter';
import type { PageData, AnalysisResult, VoiceProfile, GeneratedMessage, OutreachAngle } from '@/types';

interface UseMessageGenerationResult {
  messages: Record<string, GeneratedMessage | null>;
  streamingText: Record<string, string>;
  isGenerating: Record<string, boolean>;
  selectedAngle: OutreachAngle['angle'];
  setSelectedAngle: (angle: OutreachAngle['angle']) => void;
  generateMessage: (pageData: PageData, analysis: AnalysisResult, angle: OutreachAngle['angle']) => Promise<void>;
  regenerateMessage: (pageData: PageData, analysis: AnalysisResult, angle: OutreachAngle['angle']) => Promise<void>;
  cancelGeneration: () => void;
  setMessages: React.Dispatch<React.SetStateAction<Record<string, GeneratedMessage | null>>>;
}

/**
 * Extract the "message" field from partial JSON as it streams in.
 * This allows us to show the message text before the full JSON is complete.
 */
function extractPartialMessage(text: string): string | null {
  const cleaned = extractJsonFromResponse(text);

  // Try full parse first
  try {
    const parsed = JSON.parse(cleaned);
    if (parsed.message) return parsed.message;
  } catch {
    // Not complete JSON yet — try to extract partial message field
  }

  // Look for "message": "..." pattern and extract what we have so far
  const messageMatch = cleaned.match(/"message"\s*:\s*"((?:[^"\\]|\\.)*)(?:"|$)/s);
  if (messageMatch?.[1]) {
    // Unescape JSON string escapes
    return messageMatch[1]
      .replace(/\\n/g, '\n')
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, '\\')
      .replace(/\\t/g, '\t');
  }

  return null;
}

export function useMessageGeneration(): UseMessageGenerationResult {
  const [messages, setMessages] = useState<Record<string, GeneratedMessage | null>>({});
  const [streamingText, setStreamingText] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState<Record<string, boolean>>({});
  const [selectedAngle, setSelectedAngle] = useState<OutreachAngle['angle']>('service');
  const [voiceProfile, setVoiceProfile] = useState<VoiceProfile | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const apiKey = useStore((state) => state.apiKey);
  const preferredModel = useStore((state) => state.preferredModel);

  const pageDataRef = useRef<PageData | null>(null);
  const analysisRef = useRef<AnalysisResult | null>(null);
  const angleRef = useRef<OutreachAngle['angle'] | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const MAX_RETRIES = 3;

  // Load voice profile on mount
  useEffect(() => {
    const loadVoiceProfile = () => {
      chrome.storage.local.get('voiceProfile', (result) => {
        if (result.voiceProfile) {
          setVoiceProfile(result.voiceProfile as VoiceProfile);
        }
      });
    };

    loadVoiceProfile();

    const listener = () => loadVoiceProfile();
    chrome.storage.onChanged.addListener(listener);
    return () => chrome.storage.onChanged.removeListener(listener);
  }, []);

  const cancelGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  const generateMessage = useCallback(async (
    pageData: PageData,
    analysis: AnalysisResult,
    angle: OutreachAngle['angle']
  ) => {
    if (!apiKey) return;

    pageDataRef.current = pageData;
    analysisRef.current = analysis;
    angleRef.current = angle;

    // Cancel any in-flight generation for this angle
    cancelGeneration();

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsGenerating((prev) => ({ ...prev, [angle]: true }));
    setStreamingText((prev) => ({ ...prev, [angle]: '' }));

    try {
      const prompt = getMessagePrompt(pageData, analysis, angle, voiceProfile || undefined);
      let fullResponse = '';

      await streamCompletion(
        [
          { role: 'system', content: 'You are a helpful assistant that generates personalized outreach messages.' },
          { role: 'user', content: prompt }
        ],
        apiKey,
        {
          signal: controller.signal,
          onChunk: (chunk) => {
            fullResponse += chunk;

            // Try to extract partial message text for live streaming display
            const partialMessage = extractPartialMessage(fullResponse);
            if (partialMessage) {
              setStreamingText((prev) => ({ ...prev, [angle]: partialMessage }));
            }

            // Also try full JSON parse for early completion
            try {
              const jsonStr = extractJsonFromResponse(fullResponse);
              const parsed = JSON.parse(jsonStr) as GeneratedMessage;
              if (parsed.message && parsed.wordCount) {
                setMessages((prev) => ({ ...prev, [angle]: parsed }));
                setStreamingText((prev) => ({ ...prev, [angle]: '' }));
              }
            } catch {
              // Partial JSON, not parseable yet — streaming text handles display
            }
          },
          onComplete: (finalText) => {
            try {
              const jsonStr = extractJsonFromResponse(finalText);
              const parsed = JSON.parse(jsonStr) as GeneratedMessage;
              setMessages((prev) => ({ ...prev, [angle]: parsed }));
              setStreamingText((prev) => ({ ...prev, [angle]: '' }));
              setIsGenerating((prev) => ({ ...prev, [angle]: false }));
              setRetryCount(0);
            } catch {
              // If JSON parse fails but we have streaming text, create a fallback message
              const partialMessage = extractPartialMessage(finalText);
              if (partialMessage) {
                setMessages((prev) => ({
                  ...prev,
                  [angle]: {
                    message: partialMessage,
                    wordCount: partialMessage.split(/\s+/).filter(Boolean).length,
                    hook: '',
                    voiceScore: 50,
                  },
                }));
              }
              setStreamingText((prev) => ({ ...prev, [angle]: '' }));
              setIsGenerating((prev) => ({ ...prev, [angle]: false }));
            }
            abortControllerRef.current = null;
          },
          onError: (err) => {
            if (err instanceof DOMException && err.name === 'AbortError') {
              setIsGenerating((prev) => ({ ...prev, [angle]: false }));
              setStreamingText((prev) => ({ ...prev, [angle]: '' }));
              return;
            }

            const errorMessage = err instanceof Error ? err.message : 'Generation failed';
            const isRetryable =
              errorMessage.includes('network') ||
              errorMessage.includes('timeout') ||
              errorMessage.includes('503') ||
              errorMessage.includes('502');

            if (isRetryable && retryCount < MAX_RETRIES) {
              setRetryCount((prev) => prev + 1);

              const backoffDelay = Math.pow(2, retryCount) * 1000;
              setTimeout(() => {
                if (pageDataRef.current && analysisRef.current && angleRef.current) {
                  generateMessage(pageDataRef.current, analysisRef.current, angleRef.current);
                }
              }, backoffDelay);
            } else {
              setIsGenerating((prev) => ({ ...prev, [angle]: false }));
              setStreamingText((prev) => ({ ...prev, [angle]: '' }));
              setRetryCount(0);
            }
            abortControllerRef.current = null;
          }
        },
        preferredModel
      );
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        setIsGenerating((prev) => ({ ...prev, [angle]: false }));
        setStreamingText((prev) => ({ ...prev, [angle]: '' }));
        return;
      }
      setIsGenerating((prev) => ({ ...prev, [angle]: false }));
      setStreamingText((prev) => ({ ...prev, [angle]: '' }));
      abortControllerRef.current = null;
    }
  }, [apiKey, voiceProfile, retryCount, cancelGeneration]);

  const regenerateMessage = useCallback(async (
    pageData: PageData,
    analysis: AnalysisResult,
    angle: OutreachAngle['angle']
  ) => {
    setMessages((prev) => ({ ...prev, [angle]: null }));
    setStreamingText((prev) => ({ ...prev, [angle]: '' }));
    await generateMessage(pageData, analysis, angle);
  }, [generateMessage]);

  return {
    messages,
    streamingText,
    isGenerating,
    selectedAngle,
    setSelectedAngle,
    generateMessage,
    regenerateMessage,
    cancelGeneration,
    setMessages,
  };
}
