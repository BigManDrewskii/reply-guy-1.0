import { useState, useCallback, useEffect, useRef } from 'react';
import { useStore } from '@/lib/store';
import { getMessagePrompt } from '@/lib/prompts';
import { streamCompletion } from '@/lib/openrouter';
import type { PageData, AnalysisResult, VoiceProfile, GeneratedMessage, OutreachAngle } from '@/types';

interface UseMessageGenerationResult {
  messages: Record<string, GeneratedMessage | null>;
  isGenerating: Record<string, boolean>;
  selectedAngle: OutreachAngle['angle'];
  setSelectedAngle: (angle: OutreachAngle['angle']) => void;
  generateMessage: (pageData: PageData, analysis: AnalysisResult, angle: OutreachAngle['angle']) => Promise<void>;
  regenerateMessage: (pageData: PageData, analysis: AnalysisResult, angle: OutreachAngle['angle']) => Promise<void>;
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

  const generateMessage = useCallback(async (
    pageData: PageData,
    analysis: AnalysisResult,
    angle: OutreachAngle['angle']
  ) => {
    if (!apiKey) {
      console.error('No API key configured');
      return;
    }

    pageDataRef.current = pageData;
    analysisRef.current = analysis;
    angleRef.current = angle;

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
          onChunk: (chunk) => {
            fullResponse += chunk;
            try {
              // Extract JSON from the response
              let jsonStr = fullResponse;
              const codeBlockMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
              if (codeBlockMatch) {
                jsonStr = codeBlockMatch[1];
              }

              // Try to parse partial JSON
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
              // Extract JSON from the response
              let jsonStr = finalText;
              const codeBlockMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
              if (codeBlockMatch) {
                jsonStr = codeBlockMatch[1];
              }

              const parsed = JSON.parse(jsonStr) as GeneratedMessage;
              setMessages((prev) => ({ ...prev, [angle]: parsed }));
              setIsGenerating((prev) => ({ ...prev, [angle]: false }));
              setRetryCount(0);
            } catch (parseError) {
              console.error('Failed to parse message response:', parseError);
              setIsGenerating((prev) => ({ ...prev, [angle]: false }));
            }
          },
          onError: (err) => {
            const errorMessage = err instanceof Error ? err.message : 'Generation failed';
            const isRetryable =
              errorMessage.includes('network') ||
              errorMessage.includes('timeout') ||
              errorMessage.includes('503') ||
              errorMessage.includes('502');

            if (isRetryable && retryCount < MAX_RETRIES) {
              console.log(`[useMessageGeneration] Retrying (${retryCount + 1}/${MAX_RETRIES})...`);
              setRetryCount((prev) => prev + 1);

              const backoffDelay = Math.pow(2, retryCount) * 1000;
              setTimeout(() => {
                if (pageDataRef.current && analysisRef.current && angleRef.current) {
                  generateMessage(pageDataRef.current, analysisRef.current, angleRef.current);
                }
              }, backoffDelay);
            } else {
              console.error('[useMessageGeneration] Generation error:', {
                error: err,
                angle,
                pageUrl: pageData.url,
                timestamp: new Date().toISOString(),
                retries: retryCount,
              });
              setIsGenerating((prev) => ({ ...prev, [angle]: false }));
              setRetryCount(0);
            }
          }
        }
      );
    } catch (err) {
      console.error('[useMessageGeneration] Unexpected error:', {
        error: err,
        angle,
        pageUrl: pageData.url,
        timestamp: new Date().toISOString(),
      });
      setIsGenerating((prev) => ({ ...prev, [angle]: false }));
    }
  }, [apiKey, voiceProfile, retryCount]);

  const regenerateMessage = useCallback(async (
    pageData: PageData,
    analysis: AnalysisResult,
    angle: OutreachAngle['angle']
  ) => {
    // Clear existing message and regenerate
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
    setMessages,
  };
}
