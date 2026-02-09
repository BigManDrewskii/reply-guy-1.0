import { useState, useCallback, useEffect, useRef } from 'react';
import { useStore } from '@/lib/store';
import { getMessagePrompt, getSelfRefinementPrompt } from '@/lib/prompts';
import { streamCompletion, extractJsonFromResponse } from '@/lib/openrouter';
import { computeLocalVoiceMatchScore, type VoiceMatchBreakdown } from '@/lib/voice-analyzer';
import type { PageData, AnalysisResult, VoiceProfile, GeneratedMessage, OutreachAngle } from '@/types';

interface UseMessageGenerationResult {
  messages: Record<string, GeneratedMessage | null>;
  streamingText: Record<string, string>;
  isGenerating: Record<string, boolean>;
  isRefining: Record<string, boolean>;
  voiceMatchScores: Record<string, { score: number; breakdown: VoiceMatchBreakdown } | null>;
  selectedAngle: OutreachAngle['angle'];
  setSelectedAngle: (angle: OutreachAngle['angle']) => void;
  generateMessage: (pageData: PageData, analysis: AnalysisResult, angle: OutreachAngle['angle']) => Promise<void>;
  regenerateMessage: (pageData: PageData, analysis: AnalysisResult, angle: OutreachAngle['angle']) => Promise<void>;
  refineMessage: (pageData: PageData, analysis: AnalysisResult, angle: OutreachAngle['angle']) => Promise<void>;
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
    return messageMatch[1]
      .replace(/\\n/g, '\n')
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, '\\')
      .replace(/\\t/g, '\t');
  }

  return null;
}

// ============================================
// Voice Match Scoring Threshold
// If score < this, self-refinement is offered
// ============================================
const REFINEMENT_THRESHOLD = 70;

export function useMessageGeneration(): UseMessageGenerationResult {
  const [messages, setMessages] = useState<Record<string, GeneratedMessage | null>>({});
  const [streamingText, setStreamingText] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState<Record<string, boolean>>({});
  const [isRefining, setIsRefining] = useState<Record<string, boolean>>({});
  const [voiceMatchScores, setVoiceMatchScores] = useState<
    Record<string, { score: number; breakdown: VoiceMatchBreakdown } | null>
  >({});
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

  /**
   * Compute voice match score after a message is generated.
   * Uses the local NLP metrics from the voice profile as the target.
   */
  const scoreMessage = useCallback(
    (message: string, angle: string) => {
      if (!voiceProfile?.metrics) {
        setVoiceMatchScores((prev) => ({ ...prev, [angle]: null }));
        return;
      }

      try {
        const result = computeLocalVoiceMatchScore(message, voiceProfile.metrics);
        setVoiceMatchScores((prev) => ({ ...prev, [angle]: result }));
      } catch (err) {
        console.warn('[useMessageGeneration] Voice match scoring failed:', err);
        setVoiceMatchScores((prev) => ({ ...prev, [angle]: null }));
      }
    },
    [voiceProfile]
  );

  const generateMessage = useCallback(
    async (pageData: PageData, analysis: AnalysisResult, angle: OutreachAngle['angle']) => {
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
      setVoiceMatchScores((prev) => ({ ...prev, [angle]: null }));

      try {
        const messageLength = useStore.getState().messageLength;
        const prompt = getMessagePrompt(
          pageData,
          analysis,
          angle,
          voiceProfile || undefined,
          messageLength
        );
        let fullResponse = '';

        await streamCompletion(
          [
            {
              role: 'system',
              content:
                'You are an expert outreach copywriter. You write personalized messages that sound authentically human — never generic, never AI-sounding. You follow the Hook→Bridge→Value→CTA structure precisely.',
            },
            { role: 'user', content: prompt },
          ],
          apiKey,
          {
            signal: controller.signal,
            onChunk: (chunk) => {
              fullResponse += chunk;

              const partialMessage = extractPartialMessage(fullResponse);
              if (partialMessage) {
                setStreamingText((prev) => ({ ...prev, [angle]: partialMessage }));
              }

              // Try full JSON parse for early completion
              try {
                const jsonStr = extractJsonFromResponse(fullResponse);
                const parsed = JSON.parse(jsonStr) as GeneratedMessage;
                if (parsed.message && parsed.wordCount) {
                  setMessages((prev) => ({ ...prev, [angle]: parsed }));
                  setStreamingText((prev) => ({ ...prev, [angle]: '' }));
                  // Score the message against voice profile
                  scoreMessage(parsed.message, angle);
                }
              } catch {
                // Partial JSON — streaming text handles display
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

                // Score the final message
                scoreMessage(parsed.message, angle);
              } catch {
                const partialMessage = extractPartialMessage(finalText);
                if (partialMessage) {
                  const fallback: GeneratedMessage = {
                    message: partialMessage,
                    wordCount: partialMessage.split(/\s+/).filter(Boolean).length,
                    hook: '',
                    voiceScore: 50,
                  };
                  setMessages((prev) => ({ ...prev, [angle]: fallback }));
                  scoreMessage(partialMessage, angle);
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
            },
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
    },
    [apiKey, voiceProfile, retryCount, cancelGeneration, scoreMessage, preferredModel]
  );

  /**
   * Self-refinement loop: Takes a generated message that scored below
   * the threshold and asks the LLM to rewrite it with specific
   * guidance on which voice dimensions to improve.
   */
  const refineMessage = useCallback(
    async (pageData: PageData, analysis: AnalysisResult, angle: OutreachAngle['angle']) => {
      if (!apiKey || !voiceProfile?.metrics) return;

      const currentMessage = messages[angle];
      const currentScore = voiceMatchScores[angle];
      if (!currentMessage || !currentScore) return;

      cancelGeneration();

      const controller = new AbortController();
      abortControllerRef.current = controller;

      setIsRefining((prev) => ({ ...prev, [angle]: true }));
      setStreamingText((prev) => ({ ...prev, [angle]: '' }));

      try {
        const refinementPrompt = getSelfRefinementPrompt(
          currentMessage.message,
          voiceProfile,
          currentScore.score,
          currentScore.breakdown
        );

        let fullResponse = '';

        await streamCompletion(
          [
            {
              role: 'system',
              content:
                'You are a voice-matching editor. You rewrite messages to better match a specific writing style while preserving the original intent and context.',
            },
            { role: 'user', content: refinementPrompt },
          ],
          apiKey,
          {
            signal: controller.signal,
            onChunk: (chunk) => {
              fullResponse += chunk;
              const partialMessage = extractPartialMessage(fullResponse);
              if (partialMessage) {
                setStreamingText((prev) => ({ ...prev, [angle]: partialMessage }));
              }
            },
            onComplete: (finalText) => {
              try {
                const jsonStr = extractJsonFromResponse(finalText);
                const parsed = JSON.parse(jsonStr) as GeneratedMessage & { changes?: string };
                setMessages((prev) => ({ ...prev, [angle]: parsed }));
                setStreamingText((prev) => ({ ...prev, [angle]: '' }));
                setIsRefining((prev) => ({ ...prev, [angle]: false }));

                // Re-score the refined message
                scoreMessage(parsed.message, angle);
              } catch {
                const partialMessage = extractPartialMessage(finalText);
                if (partialMessage) {
                  const fallback: GeneratedMessage = {
                    message: partialMessage,
                    wordCount: partialMessage.split(/\s+/).filter(Boolean).length,
                    hook: currentMessage.hook,
                    voiceScore: 70,
                  };
                  setMessages((prev) => ({ ...prev, [angle]: fallback }));
                  scoreMessage(partialMessage, angle);
                }
                setStreamingText((prev) => ({ ...prev, [angle]: '' }));
                setIsRefining((prev) => ({ ...prev, [angle]: false }));
              }
              abortControllerRef.current = null;
            },
            onError: (err) => {
              if (err instanceof DOMException && err.name === 'AbortError') {
                setIsRefining((prev) => ({ ...prev, [angle]: false }));
                setStreamingText((prev) => ({ ...prev, [angle]: '' }));
                return;
              }
              setIsRefining((prev) => ({ ...prev, [angle]: false }));
              setStreamingText((prev) => ({ ...prev, [angle]: '' }));
              abortControllerRef.current = null;
            },
          },
          preferredModel
        );
      } catch (err) {
        setIsRefining((prev) => ({ ...prev, [angle]: false }));
        setStreamingText((prev) => ({ ...prev, [angle]: '' }));
        abortControllerRef.current = null;
      }
    },
    [apiKey, voiceProfile, messages, voiceMatchScores, cancelGeneration, scoreMessage, preferredModel]
  );

  const regenerateMessage = useCallback(
    async (pageData: PageData, analysis: AnalysisResult, angle: OutreachAngle['angle']) => {
      setMessages((prev) => ({ ...prev, [angle]: null }));
      setStreamingText((prev) => ({ ...prev, [angle]: '' }));
      setVoiceMatchScores((prev) => ({ ...prev, [angle]: null }));
      await generateMessage(pageData, analysis, angle);
    },
    [generateMessage]
  );

  return {
    messages,
    streamingText,
    isGenerating,
    isRefining,
    voiceMatchScores,
    selectedAngle,
    setSelectedAngle,
    generateMessage,
    regenerateMessage,
    refineMessage,
    cancelGeneration,
    setMessages,
  };
}
