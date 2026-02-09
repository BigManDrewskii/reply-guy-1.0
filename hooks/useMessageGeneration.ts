import { useState, useCallback, useEffect, useRef } from 'react';
import { useStore } from '@/lib/store';
import { getMessagePrompt } from '@/lib/prompts';
import { streamCompletion, extractJsonFromResponse } from '@/lib/openrouter';
import type { PageData, AnalysisResult, VoiceProfile, GeneratedMessage, OutreachAngle } from '@/types';

interface UseMessageGenerationResult {
  messages: Record<string, GeneratedMessage | null>;
  isGenerating: Record<string, boolean>;
  selectedAngle: OutreachAngle['angle'];
  setSelectedAngle: (angle: OutreachAngle['angle']) => void;
  generateMessage: (pageData: PageData, analysis: AnalysisResult, angle: OutreachAngle['angle']) => Promise<void>;
  regenerateMessage: (pageData: PageData, analysis: AnalysisResult, angle: OutreachAngle['angle']) => Promise<void>;
  cancelGeneration: () => void;
  setMessages: React.Dispatch<React.SetStateAction<Record<string, GeneratedMessage | null>>>;
}

export function useMessageGeneration(): UseMessageGenerationResult {
  const [messages, setMessages] = useState<Record<string, GeneratedMessage | null>>({});
  const [isGenerating, setIsGenerating] = useState<Record<string, boolean>>({});
  const [selectedAngle, setSelectedAngle] = useState<OutreachAngle['angle']>('service');
  const [voiceProfile, setVoiceProfile] = useState<VoiceProfile | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const apiKey = useStore((state) => state.apiKey);

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
            try {
              const jsonStr = extractJsonFromResponse(fullResponse);
              const parsed = JSON.parse(jsonStr) as GeneratedMessage;
              if (parsed.message) {
                setMessages((prev) => ({ ...prev, [angle]: parsed }));
              }
            } catch {
              // Partial JSON, not parseable yet
            }
          },
          onComplete: (finalText) => {
            try {
              const jsonStr = extractJsonFromResponse(finalText);
              const parsed = JSON.parse(jsonStr) as GeneratedMessage;
              setMessages((prev) => ({ ...prev, [angle]: parsed }));
              setIsGenerating((prev) => ({ ...prev, [angle]: false }));
              setRetryCount(0);
            } catch {
              setIsGenerating((prev) => ({ ...prev, [angle]: false }));
            }
            abortControllerRef.current = null;
          },
          onError: (err) => {
            if (err instanceof DOMException && err.name === 'AbortError') {
              setIsGenerating((prev) => ({ ...prev, [angle]: false }));
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
              setRetryCount(0);
            }
            abortControllerRef.current = null;
          }
        }
      );
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        setIsGenerating((prev) => ({ ...prev, [angle]: false }));
        return;
      }
      setIsGenerating((prev) => ({ ...prev, [angle]: false }));
      abortControllerRef.current = null;
    }
  }, [apiKey, voiceProfile, retryCount, cancelGeneration]);

  const regenerateMessage = useCallback(async (
    pageData: PageData,
    analysis: AnalysisResult,
    angle: OutreachAngle['angle']
  ) => {
    setMessages((prev) => ({ ...prev, [angle]: null }));
    await generateMessage(pageData, analysis, angle);
  }, [generateMessage]);

  return {
    messages,
    isGenerating,
    selectedAngle,
    setSelectedAngle,
    generateMessage,
    regenerateMessage,
    cancelGeneration,
    setMessages,
  };
}
