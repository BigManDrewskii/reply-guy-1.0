import { useState, useCallback } from 'react';
import { useStore } from '@/lib/store';
import { getVoiceExtractionPrompt } from '@/lib/prompts';
import { streamCompletion } from '@/lib/openrouter';
import { db } from '@/lib/db';
import { analyzeVoiceMetrics, summarizeVoiceMetrics, type VoiceMetrics } from '@/lib/voice-analyzer';
import type { VoiceProfile } from '@/types';

interface UseVoiceTrainingResult {
  step: number;
  setStep: (step: number) => void;
  exampleMessages: string;
  setExampleMessages: (messages: string) => void;
  messageCount: number;
  voiceProfile: VoiceProfile | null;
  voiceMetrics: VoiceMetrics | null;
  voiceMetricsSummary: string | null;
  isExtracting: boolean;
  extractionProgress: {
    tone?: number;
    openingPatterns?: string[];
    closingPatterns?: string[];
    personalityMarkers?: string[];
    avoidPhrases?: string[];
    vocabularySignature?: string[];
  };
  error: string | null;
  analyzeVoice: () => Promise<void>;
  saveVoiceProfile: () => Promise<void>;
  reset: () => void;
}

export function useVoiceTraining(): UseVoiceTrainingResult {
  const [step, setStep] = useState(1);
  const [exampleMessages, setExampleMessages] = useState('');
  const [voiceProfile, setVoiceProfile] = useState<VoiceProfile | null>(null);
  const [voiceMetrics, setVoiceMetrics] = useState<VoiceMetrics | null>(null);
  const [voiceMetricsSummary, setVoiceMetricsSummary] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionProgress, setExtractionProgress] = useState<{
    tone?: number;
    openingPatterns?: string[];
    closingPatterns?: string[];
    personalityMarkers?: string[];
    avoidPhrases?: string[];
    vocabularySignature?: string[];
  }>({});
  const [error, setError] = useState<string | null>(null);
  const apiKey = useStore((state) => state.apiKey);

  const messageCount = exampleMessages
    .split('---')
    .map(m => m.trim())
    .filter(m => m.length > 0).length;

  const analyzeVoice = useCallback(async () => {
    if (!apiKey) {
      setError('No API key configured');
      return;
    }

    if (messageCount < 5) {
      setError('Please provide at least 5 example messages');
      return;
    }

    setIsExtracting(true);
    setError(null);
    setExtractionProgress({});
    setVoiceMetrics(null);
    setVoiceMetricsSummary(null);

    const messages = exampleMessages
      .split('---')
      .map(m => m.trim())
      .filter(m => m.length > 0);

    // Step 1: Run local NLP analysis with compromise.js (instant, no API call)
    try {
      const metrics = analyzeVoiceMetrics(messages);
      setVoiceMetrics(metrics);
      setVoiceMetricsSummary(summarizeVoiceMetrics(metrics));
    } catch (err) {
      console.warn('[useVoiceTraining] Local NLP analysis failed:', err);
    }

    // Step 2: Run LLM-based voice extraction (streaming)
    try {
      const prompt = getVoiceExtractionPrompt(messages);

      let fullResponse = '';

      await streamCompletion(
        [
          { role: 'system', content: 'You are an expert at analyzing writing styles and voice patterns.' },
          { role: 'user', content: prompt }
        ],
        apiKey,
        {
          onChunk: (chunk) => {
            fullResponse += chunk;
            try {
              let jsonStr = fullResponse;
              const codeBlockMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
              if (codeBlockMatch) {
                jsonStr = codeBlockMatch[1];
              }

              const parsed = JSON.parse(jsonStr);

              setExtractionProgress({
                tone: parsed.tone,
                openingPatterns: parsed.openingPatterns,
                closingPatterns: parsed.closingPatterns,
                personalityMarkers: parsed.personalityMarkers,
                avoidPhrases: parsed.avoidPhrases,
                vocabularySignature: parsed.vocabularySignature,
              });
            } catch {
              // Partial JSON, not parseable yet
            }
          },
          onComplete: async (finalText) => {
            try {
              let jsonStr = finalText;
              const codeBlockMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
              if (codeBlockMatch) {
                jsonStr = codeBlockMatch[1];
              }

              const parsed = JSON.parse(jsonStr);

              // Merge local NLP metrics into the voice profile
              const localMetrics = voiceMetrics || analyzeVoiceMetrics(messages);

              const profile: VoiceProfile = {
                id: 'default',
                tone: parsed.tone,
                openingPatterns: parsed.openingPatterns,
                closingPatterns: parsed.closingPatterns,
                personalityMarkers: parsed.personalityMarkers,
                avoidPhrases: parsed.avoidPhrases,
                vocabularySignature: parsed.vocabularySignature,
                exampleMessages: messages,
                lastUpdated: Date.now(),
                // Enhanced metrics from compromise.js
                avgSentenceLength: localMetrics.avgSentenceLength,
                readabilityScore: localMetrics.readabilityScore,
                formalityScore: localMetrics.formalityScore,
                questionFrequency: localMetrics.questionFrequency,
                exclamationFrequency: localMetrics.exclamationFrequency,
              };

              setVoiceProfile(profile);
              setIsExtracting(false);
              setStep(3);
            } catch (parseError) {
              setError('Failed to parse voice analysis');
              setIsExtracting(false);
            }
          },
          onError: (err) => {
            console.error('[useVoiceTraining] Voice extraction error:', {
              error: err,
              messageCount,
              timestamp: new Date().toISOString(),
            });
            setError(err.message);
            setIsExtracting(false);
          }
        }
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Voice analysis failed');
      setIsExtracting(false);
    }
  }, [apiKey, exampleMessages, messageCount]);

  const saveVoiceProfile = useCallback(async () => {
    if (!voiceProfile) return;

    try {
      // Save to Dexie
      await db.voiceProfiles.put(voiceProfile);

      // Also save to chrome.storage.local for easy access
      chrome.storage.local.set({ voiceProfile: voiceProfile });

      // Update store
      useStore.getState().setVoiceProfileLoaded(true);

      setStep(1);
      setExampleMessages('');
      setVoiceProfile(null);
      setVoiceMetrics(null);
      setVoiceMetricsSummary(null);
      setExtractionProgress({});
    } catch (err) {
      setError('Failed to save voice profile');
    }
  }, [voiceProfile]);

  const reset = useCallback(() => {
    setStep(1);
    setExampleMessages('');
    setVoiceProfile(null);
    setVoiceMetrics(null);
    setVoiceMetricsSummary(null);
    setExtractionProgress({});
    setError(null);
  }, []);

  return {
    step,
    setStep,
    exampleMessages,
    setExampleMessages,
    messageCount,
    voiceProfile,
    voiceMetrics,
    voiceMetricsSummary,
    isExtracting,
    extractionProgress,
    error,
    analyzeVoice,
    saveVoiceProfile,
    reset,
  };
}
