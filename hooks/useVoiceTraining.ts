import { useState, useCallback } from 'react';
import { useStore } from '@/lib/store';
import { getVoiceExtractionPrompt } from '@/lib/prompts';
import { streamCompletion } from '@/lib/openrouter';
import { db } from '@/lib/db';
import type { VoiceProfile } from '@/types';

interface UseVoiceTrainingResult {
  step: number;
  setStep: (step: number) => void;
  exampleMessages: string;
  setExampleMessages: (messages: string) => void;
  messageCount: number;
  voiceProfile: VoiceProfile | null;
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

    try {
      const prompt = getVoiceExtractionPrompt(
        exampleMessages
          .split('---')
          .map(m => m.trim())
          .filter(m => m.length > 0)
      );

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
              // Extract JSON from the response
              let jsonStr = fullResponse;
              const codeBlockMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
              if (codeBlockMatch) {
                jsonStr = codeBlockMatch[1];
              }

              // Try to parse partial JSON
              const parsed = JSON.parse(jsonStr);

              // Update progress as each field comes in
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
              // Extract JSON from the response
              let jsonStr = finalText;
              const codeBlockMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
              if (codeBlockMatch) {
                jsonStr = codeBlockMatch[1];
              }

              const parsed = JSON.parse(jsonStr);

              const profile: VoiceProfile = {
                id: 'default',
                tone: parsed.tone,
                openingPatterns: parsed.openingPatterns,
                closingPatterns: parsed.closingPatterns,
                personalityMarkers: parsed.personalityMarkers,
                avoidPhrases: parsed.avoidPhrases,
                vocabularySignature: parsed.vocabularySignature,
                exampleMessages: exampleMessages
                  .split('---')
                  .map(m => m.trim())
                  .filter(m => m.length > 0),
                lastUpdated: Date.now(),
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
  }, [apiKey, exampleMessages]);

  const saveVoiceProfile = useCallback(async () => {
    if (!voiceProfile) return;

    try {
      // Save to Dexie
      await db.voiceProfiles.put(voiceProfile);

      // Also save to chrome.storage.local for easy access
      chrome.storage.local.set({ voiceProfile: voiceProfile });

      setStep(1);
      setExampleMessages('');
      setVoiceProfile(null);
      setExtractionProgress({});
    } catch (err) {
      setError('Failed to save voice profile');
    }
  }, [voiceProfile]);

  const reset = useCallback(() => {
    setStep(1);
    setExampleMessages('');
    setVoiceProfile(null);
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
    isExtracting,
    extractionProgress,
    error,
    analyzeVoice,
    saveVoiceProfile,
    reset,
  };
}
