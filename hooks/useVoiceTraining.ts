import { useState, useCallback } from 'react';
import { useStore } from '@/lib/store';
import { streamCompletion, extractJsonFromResponse } from '@/lib/openrouter';
import { db } from '@/lib/db';
import {
  extractLocalStyleMetrics,
  summarizeLocalMetrics,
  formatMetricsForPrompt,
  type LocalStyleMetrics,
} from '@/lib/voice-analyzer';
import type {
  VoiceProfile,
  RegisterDimensions,
  ToneProfile,
  SignaturePatterns,
  VoiceExemplar,
} from '@/types';
import { computeProfileQuality } from '@/types';

// ============================================
// Stage 2: Register-Guided Voice Extraction
// 3-step LLM pipeline adapted from RG Prompting
// (Yang & Carpuat, UMD 2025)
// ============================================

function buildRGExtractionPrompt(
  messages: string[],
  metricsContext: string
): string {
  return `You are an expert linguist specializing in authorial style analysis and stylometry.

Analyze the following ${messages.length} writing samples from the SAME author. Your goal is to create a comprehensive, structured voice profile that would allow someone to perfectly replicate this person's writing style.

${metricsContext}

---

WRITING SAMPLES:
${messages.map((msg, i) => `--- Sample ${i + 1} ---\n${msg}`).join('\n\n')}

---

Perform a 3-step analysis:

STEP 1 — REGISTER ANALYSIS (Biber's 6 dimensions):
Rate the author on each dimension from 1-10:
- involvedVsInformational: 1=personal/emotional, 10=detached/factual
- narrativeVsNonNarrative: 1=story-like, 10=expository
- situationDependentVsExplicit: 1=assumes context, 10=spells everything out
- nonPersuasiveVsPersuasive: 1=neutral/informative, 10=actively persuading
- concreteVsAbstract: 1=specific/tangible, 10=theoretical/conceptual
- casualVsFormalElaboration: 1=casual/simple, 10=formal/elaborate

STEP 2 — VOICE DNA EXTRACTION:
Identify:
- Tone (primary mood, secondary undertone, humor style, confidence level)
- Style descriptors (5-8 adjectives that capture the voice)
- Signature patterns (how they open, transition, close, and any catchphrases)
- Anti-patterns (things this writer NEVER does — be specific)
- Voice rules (5-10 actionable instructions for replicating this voice)

STEP 3 — STRUCTURED OUTPUT:
Return a JSON object with this EXACT schema (no markdown, no code blocks, just raw JSON):
{
  "register": {
    "involvedVsInformational": <1-10>,
    "narrativeVsNonNarrative": <1-10>,
    "situationDependentVsExplicit": <1-10>,
    "nonPersuasiveVsPersuasive": <1-10>,
    "concreteVsAbstract": <1-10>,
    "casualVsFormalElaboration": <1-10>
  },
  "tone": {
    "primary": "<single word>",
    "secondary": "<single word>",
    "humor": "<none|dry|sarcastic|self-deprecating|playful|witty>",
    "confidence": "<tentative|balanced|assertive|commanding>"
  },
  "descriptors": ["<5-8 style adjectives>"],
  "signatures": {
    "openingPatterns": ["<3-5 patterns, e.g. 'Starts with a direct observation'>"],
    "transitionWords": ["<5-8 favorite connectors>"],
    "closingPatterns": ["<3-5 patterns, e.g. 'Ends with a question'>"],
    "catchphrases": ["<2-5 recurring expressions or idioms>"]
  },
  "antiPatterns": ["<5-8 things this writer NEVER does>"],
  "rules": ["<5-10 actionable voice replication rules>"]
}

CRITICAL RULES:
- Base your analysis on ACTUAL EVIDENCE from the samples, not assumptions
- Anti-patterns are as important as positive patterns — be specific
- Rules must be actionable ("Use contractions freely" not "Is casual")
- Cross-reference your analysis with the quantitative metrics provided
- If the metrics show high contraction rate, the rules MUST mention contractions
- If the metrics show short sentences, the rules MUST mention sentence length`;
}

// ============================================
// Voice Training Hook
// ============================================

export interface VoiceTrainingState {
  step: number;
  setStep: (step: number) => void;
  exampleMessages: string;
  setExampleMessages: (messages: string) => void;
  messageCount: number;
  voiceProfile: VoiceProfile | null;
  localMetrics: LocalStyleMetrics | null;
  localMetricsSummary: string | null;
  isExtracting: boolean;
  extractionStage: 'idle' | 'local-nlp' | 'llm-analysis' | 'building-profile' | 'complete';
  extractionProgress: string;
  error: string | null;
  analyzeVoice: () => Promise<void>;
  saveVoiceProfile: () => Promise<void>;
  reset: () => void;
}

export function useVoiceTraining(): VoiceTrainingState {
  const [step, setStep] = useState(1);
  const [exampleMessages, setExampleMessages] = useState('');
  const [voiceProfile, setVoiceProfile] = useState<VoiceProfile | null>(null);
  const [localMetrics, setLocalMetrics] = useState<LocalStyleMetrics | null>(null);
  const [localMetricsSummary, setLocalMetricsSummary] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionStage, setExtractionStage] = useState<VoiceTrainingState['extractionStage']>('idle');
  const [extractionProgress, setExtractionProgress] = useState('');
  const [error, setError] = useState<string | null>(null);
  const apiKey = useStore((state) => state.apiKey);

  const messageCount = exampleMessages
    .split('---')
    .map((m) => m.trim())
    .filter((m) => m.length > 0).length;

  const analyzeVoice = useCallback(async () => {
    if (!apiKey) {
      setError('No API key configured');
      return;
    }

    if (messageCount < 3) {
      setError('Please provide at least 3 example messages (5+ recommended)');
      return;
    }

    setIsExtracting(true);
    setError(null);
    setLocalMetrics(null);
    setLocalMetricsSummary(null);
    setVoiceProfile(null);

    const messages = exampleMessages
      .split('---')
      .map((m) => m.trim())
      .filter((m) => m.length > 0);

    // ── Stage 1: Local NLP Analysis (instant, no API call) ──
    setExtractionStage('local-nlp');
    setExtractionProgress('Extracting quantitative style metrics...');

    let metrics: LocalStyleMetrics;
    try {
      metrics = extractLocalStyleMetrics(messages);
      setLocalMetrics(metrics);
      setLocalMetricsSummary(summarizeLocalMetrics(metrics));
    } catch (err) {
      console.warn('[useVoiceTraining] Local NLP analysis failed:', err);
      setError('Failed to analyze writing samples locally');
      setIsExtracting(false);
      setExtractionStage('idle');
      return;
    }

    // ── Stage 2: LLM Register-Guided Analysis (streaming) ──
    setExtractionStage('llm-analysis');
    setExtractionProgress('Running AI voice analysis (register dimensions, tone, patterns)...');

    try {
      const metricsContext = formatMetricsForPrompt(metrics);
      const prompt = buildRGExtractionPrompt(messages, metricsContext);

      let fullResponse = '';

      await streamCompletion(
        [
          {
            role: 'system',
            content:
              'You are an expert linguist and stylometry analyst. You produce precise, structured JSON analyses of writing styles. Never include markdown formatting in your output.',
          },
          { role: 'user', content: prompt },
        ],
        apiKey,
        {
          onChunk: (chunk) => {
            fullResponse += chunk;
            // Update progress with character count
            setExtractionProgress(
              `Analyzing voice patterns... (${fullResponse.length} chars received)`
            );
          },
          onComplete: (finalText) => {
            try {
              setExtractionStage('building-profile');
              setExtractionProgress('Building structured voice profile...');

              const jsonStr = extractJsonFromResponse(finalText);
              const parsed = JSON.parse(jsonStr);

              // Validate required fields
              if (!parsed.register || !parsed.tone || !parsed.rules) {
                throw new Error('Missing required fields in LLM response');
              }

              // ── Stage 3: Build Structured Voice Profile ──
              const exemplars: VoiceExemplar[] = messages.slice(0, 5).map((text) => ({
                text,
                context: 'outreach message',
                wordCount: text.split(/\s+/).length,
              }));

              const quality = computeProfileQuality(messages.length);

              const profile: VoiceProfile = {
                id: 'default',
                createdAt: Date.now(),
                updatedAt: Date.now(),
                sampleCount: messages.length,

                register: {
                  involvedVsInformational: clamp(parsed.register.involvedVsInformational, 1, 10),
                  narrativeVsNonNarrative: clamp(parsed.register.narrativeVsNonNarrative, 1, 10),
                  situationDependentVsExplicit: clamp(parsed.register.situationDependentVsExplicit, 1, 10),
                  nonPersuasiveVsPersuasive: clamp(parsed.register.nonPersuasiveVsPersuasive, 1, 10),
                  concreteVsAbstract: clamp(parsed.register.concreteVsAbstract, 1, 10),
                  casualVsFormalElaboration: clamp(parsed.register.casualVsFormalElaboration, 1, 10),
                },

                tone: {
                  primary: parsed.tone.primary || 'direct',
                  secondary: parsed.tone.secondary || 'warm',
                  humor: parsed.tone.humor || 'none',
                  confidence: parsed.tone.confidence || 'balanced',
                },

                descriptors: Array.isArray(parsed.descriptors) ? parsed.descriptors.slice(0, 8) : [],

                signatures: {
                  openingPatterns: parsed.signatures?.openingPatterns || [],
                  transitionWords: parsed.signatures?.transitionWords || [],
                  closingPatterns: parsed.signatures?.closingPatterns || [],
                  catchphrases: parsed.signatures?.catchphrases || [],
                },

                antiPatterns: Array.isArray(parsed.antiPatterns) ? parsed.antiPatterns.slice(0, 8) : [],
                rules: Array.isArray(parsed.rules) ? parsed.rules.slice(0, 10) : [],

                metrics,
                exemplars,
                quality,
              };

              setVoiceProfile(profile);
              setExtractionStage('complete');
              setExtractionProgress('Voice profile complete!');
              setIsExtracting(false);
              setStep(3);
            } catch (parseError) {
              console.error('[useVoiceTraining] Parse error:', parseError, '\nRaw:', finalText);
              setError('Failed to parse voice analysis. Please try again.');
              setIsExtracting(false);
              setExtractionStage('idle');
            }
          },
          onError: (err) => {
            console.error('[useVoiceTraining] LLM error:', err);
            setError(err.message);
            setIsExtracting(false);
            setExtractionStage('idle');
          },
        }
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Voice analysis failed');
      setIsExtracting(false);
      setExtractionStage('idle');
    }
  }, [apiKey, exampleMessages, messageCount]);

  const saveVoiceProfile = useCallback(async () => {
    if (!voiceProfile) return;

    try {
      // Save to Dexie
      await db.voiceProfiles.put(voiceProfile);

      // Also save to chrome.storage.local for easy access by other hooks
      chrome.storage.local.set({ voiceProfile });

      // Update store
      useStore.getState().setVoiceProfileLoaded(true);

      setStep(1);
      setExampleMessages('');
      setVoiceProfile(null);
      setLocalMetrics(null);
      setLocalMetricsSummary(null);
      setExtractionStage('idle');
      setExtractionProgress('');
    } catch (err) {
      setError('Failed to save voice profile');
    }
  }, [voiceProfile]);

  const reset = useCallback(() => {
    setStep(1);
    setExampleMessages('');
    setVoiceProfile(null);
    setLocalMetrics(null);
    setLocalMetricsSummary(null);
    setExtractionStage('idle');
    setExtractionProgress('');
    setError(null);
  }, []);

  return {
    step,
    setStep,
    exampleMessages,
    setExampleMessages,
    messageCount,
    voiceProfile,
    localMetrics,
    localMetricsSummary,
    isExtracting,
    extractionStage,
    extractionProgress,
    error,
    analyzeVoice,
    saveVoiceProfile,
    reset,
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, Number(value) || min));
}
