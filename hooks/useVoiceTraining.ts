import { useState, useCallback, useRef } from 'react';
import { useStore } from '@/lib/store';
import { streamCompletion, extractJsonFromResponse } from '@/lib/openrouter';
import { db } from '@/lib/db';
import {
  extractLocalStyleMetrics,
  summarizeLocalMetrics,
  formatMetricsForPrompt,
  type LocalStyleMetrics,
} from '@/lib/voice-analyzer';
import {
  fetchUrlContent,
  segmentContentWithAI,
  segmentTextLocally,
  detectUrls,
  isUrl,
  urlToLabel,
  generateSourceId,
  type IngestedSource,
  type WritingSample,
} from '@/lib/content-ingestion';
import type {
  VoiceProfile,
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
// Voice Training Hook — with Multi-Source Ingestion
// ============================================

export interface VoiceTrainingState {
  // Step navigation
  step: number;
  setStep: (step: number) => void;

  // Multi-source content ingestion
  sources: IngestedSource[];
  addTextSource: (text: string) => void;
  addUrlSource: (url: string) => Promise<void>;
  removeSource: (id: string) => void;
  autoDetectAndAdd: (input: string) => Promise<void>;

  // Writing samples (extracted from sources)
  writingSamples: WritingSample[];
  isSegmenting: boolean;
  segmentSources: () => Promise<void>;

  // Legacy: raw text input for backward compat
  rawTextInput: string;
  setRawTextInput: (text: string) => void;

  // Analysis state
  sampleCount: number;
  voiceProfile: VoiceProfile | null;
  localMetrics: LocalStyleMetrics | null;
  localMetricsSummary: string | null;
  isExtracting: boolean;
  extractionStage: 'idle' | 'segmenting' | 'local-nlp' | 'llm-analysis' | 'building-profile' | 'complete';
  extractionProgress: string;
  error: string | null;

  // Actions
  analyzeVoice: () => Promise<void>;
  saveVoiceProfile: () => Promise<boolean>;
  reset: () => void;
}

export function useVoiceTraining(): VoiceTrainingState {
  const [step, setStep] = useState(1);
  const [sources, setSources] = useState<IngestedSource[]>([]);
  const [writingSamples, setWritingSamples] = useState<WritingSample[]>([]);
  const [isSegmenting, setIsSegmenting] = useState(false);
  const [rawTextInput, setRawTextInput] = useState('');
  const [voiceProfile, setVoiceProfile] = useState<VoiceProfile | null>(null);
  const [localMetrics, setLocalMetrics] = useState<LocalStyleMetrics | null>(null);
  const [localMetricsSummary, setLocalMetricsSummary] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionStage, setExtractionStage] = useState<VoiceTrainingState['extractionStage']>('idle');
  const [extractionProgress, setExtractionProgress] = useState('');
  const [error, setError] = useState<string | null>(null);
  const apiKey = useStore((state) => state.apiKey);

  // Ref to prevent double-analysis
  const analysisInProgress = useRef(false);

  const sampleCount = writingSamples.length;

  // ── Source Management ──

  const addTextSource = useCallback((text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const source: IngestedSource = {
      id: generateSourceId(),
      type: 'text',
      label: `Pasted text (${trimmed.split(/\s+/).length} words)`,
      rawContent: trimmed,
      status: 'ready',
    };

    setSources((prev) => [...prev, source]);
    setError(null);
  }, []);

  const addUrlSource = useCallback(async (url: string) => {
    const sourceId = generateSourceId();
    const source: IngestedSource = {
      id: sourceId,
      type: 'url',
      label: urlToLabel(url),
      rawContent: '',
      status: 'fetching',
    };

    setSources((prev) => [...prev, source]);
    setError(null);

    try {
      const content = await fetchUrlContent(url);

      setSources((prev) =>
        prev.map((s) =>
          s.id === sourceId
            ? { ...s, rawContent: content, status: 'ready' as const }
            : s
        )
      );
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch URL';
      setSources((prev) =>
        prev.map((s) =>
          s.id === sourceId
            ? { ...s, status: 'error' as const, error: errorMsg }
            : s
        )
      );
    }
  }, []);

  const removeSource = useCallback((id: string) => {
    setSources((prev) => prev.filter((s) => s.id !== id));
    setWritingSamples((prev) => prev.filter((ws) => ws.sourceId !== id));
  }, []);

  /**
   * Auto-detect input type and add appropriate source(s).
   * Handles: single URL, text with embedded URLs, plain text.
   */
  const autoDetectAndAdd = useCallback(async (input: string) => {
    const trimmed = input.trim();
    if (!trimmed) return;

    // Case 1: Single URL
    if (isUrl(trimmed)) {
      await addUrlSource(trimmed);
      return;
    }

    // Case 2: Text with embedded URLs — extract URLs and add remaining text
    const urls = detectUrls(trimmed);
    if (urls.length > 0) {
      // Add each URL as a source
      for (const url of urls) {
        await addUrlSource(url);
      }

      // Add remaining text (with URLs removed) if substantial
      let remainingText = trimmed;
      for (const url of urls) {
        remainingText = remainingText.replace(url, '').trim();
      }
      if (remainingText.split(/\s+/).length >= 10) {
        addTextSource(remainingText);
      }
      return;
    }

    // Case 3: Plain text
    addTextSource(trimmed);
  }, [addUrlSource, addTextSource]);

  // ── Segmentation ──

  /**
   * Segment all ready sources into discrete writing samples.
   * Uses AI for URL-extracted content, local segmentation for pasted text.
   */
  const segmentSources = useCallback(async () => {
    if (!apiKey) {
      setError('No API key configured');
      return;
    }

    const readySources = sources.filter((s) => s.status === 'ready' && s.rawContent.length > 0);
    if (readySources.length === 0) {
      setError('No content to analyze. Add some writing samples first.');
      return;
    }

    setIsSegmenting(true);
    setError(null);
    setExtractionStage('segmenting');
    setExtractionProgress('Extracting writing samples from your content...');

    const allSamples: WritingSample[] = [];

    for (const source of readySources) {
      try {
        let segments: string[];

        if (source.type === 'url') {
          // URL content needs AI segmentation — it's messy extracted HTML
          setExtractionProgress(`AI segmenting content from ${source.label}...`);
          segments = await segmentContentWithAI(
            source.rawContent,
            apiKey,
            (msg) => setExtractionProgress(msg),
          );
        } else {
          // Pasted text — try local segmentation first
          segments = segmentTextLocally(source.rawContent);

          // If local segmentation only found 1-2 segments and text is long,
          // use AI to find better boundaries
          if (segments.length < 3 && source.rawContent.split(/\s+/).length > 100) {
            setExtractionProgress(`AI segmenting pasted text...`);
            try {
              segments = await segmentContentWithAI(
                source.rawContent,
                apiKey,
                (msg) => setExtractionProgress(msg),
              );
            } catch {
              // Fall back to local segments if AI fails
            }
          }
        }

        for (const text of segments) {
          allSamples.push({
            text,
            sourceId: source.id,
            sourceLabel: source.label,
            wordCount: text.split(/\s+/).length,
          });
        }
      } catch (err) {
        console.warn(`[useVoiceTraining] Failed to segment source ${source.id}:`, err);
        // Still try to use the raw content as a single sample
        if (source.rawContent.split(/\s+/).length >= 10) {
          allSamples.push({
            text: source.rawContent,
            sourceId: source.id,
            sourceLabel: source.label,
            wordCount: source.rawContent.split(/\s+/).length,
          });
        }
      }
    }

    setWritingSamples(allSamples);
    setIsSegmenting(false);
    setExtractionStage('idle');
    setExtractionProgress('');

    if (allSamples.length < 3) {
      setError(`Only ${allSamples.length} sample(s) found. Need at least 3 for voice analysis. Try adding more content.`);
    }
  }, [apiKey, sources]);

  // ── Voice Analysis ──

  const analyzeVoice = useCallback(async () => {
    if (analysisInProgress.current) return;
    if (!apiKey) {
      setError('No API key configured');
      return;
    }

    if (writingSamples.length < 3) {
      setError('Please provide at least 3 writing samples (5+ recommended)');
      return;
    }

    analysisInProgress.current = true;
    setIsExtracting(true);
    setError(null);
    setLocalMetrics(null);
    setLocalMetricsSummary(null);
    setVoiceProfile(null);

    const messages = writingSamples.map((ws) => ws.text);

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
      analysisInProgress.current = false;
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

              if (!parsed.register || !parsed.tone || !parsed.rules) {
                throw new Error('Missing required fields in LLM response');
              }

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
              analysisInProgress.current = false;
              setStep(3);
            } catch (parseError) {
              console.error('[useVoiceTraining] Parse error:', parseError, '\nRaw:', finalText);
              setError('Failed to parse voice analysis. Please try again.');
              setIsExtracting(false);
              setExtractionStage('idle');
              analysisInProgress.current = false;
            }
          },
          onError: (err) => {
            console.error('[useVoiceTraining] LLM error:', err);
            setError(err.message);
            setIsExtracting(false);
            setExtractionStage('idle');
            analysisInProgress.current = false;
          },
        }
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Voice analysis failed');
      setIsExtracting(false);
      setExtractionStage('idle');
      analysisInProgress.current = false;
    }
  }, [apiKey, writingSamples]);

  // ── Save Profile (with proper serialization and error handling) ──

  const saveVoiceProfile = useCallback(async (): Promise<boolean> => {
    if (!voiceProfile) return false;

    try {
      // Serialize the profile to a plain JSON-safe object
      // This ensures no class instances or non-serializable data gets stored
      const serializedProfile = JSON.parse(JSON.stringify(voiceProfile));

      // Save to Dexie (IndexedDB)
      await db.voiceProfiles.put(serializedProfile);

      // Save to chrome.storage.local for easy access by other hooks
      await new Promise<void>((resolve, reject) => {
        chrome.storage.local.set({ voiceProfile: serializedProfile }, () => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve();
          }
        });
      });

      // Update store AFTER successful save
      useStore.getState().setVoiceProfileLoaded(true);

      return true;
    } catch (err) {
      console.error('[useVoiceTraining] Save failed:', err);
      setError(`Failed to save voice profile: ${err instanceof Error ? err.message : 'Unknown error'}`);
      return false;
    }
  }, [voiceProfile]);

  // ── Reset ──

  const reset = useCallback(() => {
    setStep(1);
    setSources([]);
    setWritingSamples([]);
    setRawTextInput('');
    setVoiceProfile(null);
    setLocalMetrics(null);
    setLocalMetricsSummary(null);
    setExtractionStage('idle');
    setExtractionProgress('');
    setError(null);
    setIsSegmenting(false);
    analysisInProgress.current = false;
  }, []);

  return {
    step,
    setStep,
    sources,
    addTextSource,
    addUrlSource,
    removeSource,
    autoDetectAndAdd,
    writingSamples,
    isSegmenting,
    segmentSources,
    rawTextInput,
    setRawTextInput,
    sampleCount,
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
