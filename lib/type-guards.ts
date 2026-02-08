import type { AnalysisResult, VoiceProfile, GeneratedMessage } from '@/types';

/**
 * Type guard for AnalysisResult
 * Validates that unknown data conforms to the AnalysisResult interface
 */
export function isValidAnalysisResult(data: unknown): data is AnalysisResult {
  if (typeof data !== 'object' || data === null) return false;

  const result = data as Record<string, unknown>;

  return (
    typeof result.personName === 'string' &&
    typeof result.summary === 'string' &&
    Array.isArray(result.interests) &&
    result.interests.every((item: unknown) => typeof item === 'string') &&
    Array.isArray(result.outreachAngles) &&
    result.outreachAngles.length >= 1 &&
    result.outreachAngles.every((angle: unknown) => {
      if (typeof angle !== 'object' || angle === null) return false;
      const a = angle as Record<string, unknown>;
      return (
        typeof a.angle === 'string' &&
        ['service', 'partner', 'community', 'value'].includes(a.angle) &&
        typeof a.hook === 'string' &&
        typeof a.relevance === 'string'
      );
    }) &&
    typeof result.confidence === 'number' &&
    result.confidence >= 0 &&
    result.confidence <= 100 &&
    typeof result.confidenceReason === 'string'
  );
}

/**
 * Assertion function for AnalysisResult
 * Throws an error if data is not a valid AnalysisResult
 */
export function assertValidAnalysis(data: unknown): asserts data is AnalysisResult {
  if (!isValidAnalysisResult(data)) {
    throw new Error('Invalid analysis result structure');
  }
}

/**
 * Type guard for VoiceProfile
 */
export function isValidVoiceProfile(data: unknown): data is VoiceProfile {
  if (typeof data !== 'object' || data === null) return false;

  const result = data as Record<string, unknown>;

  return (
    typeof result.id === 'string' &&
    typeof result.tone === 'number' &&
    result.tone >= 0 &&
    result.tone <= 10 &&
    Array.isArray(result.openingPatterns) &&
    result.openingPatterns.every((item: unknown) => typeof item === 'string') &&
    Array.isArray(result.closingPatterns) &&
    result.closingPatterns.every((item: unknown) => typeof item === 'string') &&
    Array.isArray(result.personalityMarkers) &&
    result.personalityMarkers.every((item: unknown) => typeof item === 'string') &&
    Array.isArray(result.avoidPhrases) &&
    result.avoidPhrases.every((item: unknown) => typeof item === 'string') &&
    Array.isArray(result.vocabularySignature) &&
    result.vocabularySignature.every((item: unknown) => typeof item === 'string') &&
    Array.isArray(result.exampleMessages) &&
    result.exampleMessages.every((item: unknown) => typeof item === 'string') &&
    typeof result.lastUpdated === 'number'
  );
}

/**
 * Type guard for GeneratedMessage
 */
export function isValidGeneratedMessage(data: unknown): data is GeneratedMessage {
  if (typeof data !== 'object' || data === null) return false;

  const result = data as Record<string, unknown>;

  return (
    typeof result.message === 'string' &&
    typeof result.wordCount === 'number' &&
    typeof result.hook === 'string' &&
    typeof result.voiceScore === 'number' &&
    result.voiceScore >= 0 &&
    result.voiceScore <= 100
  );
}

/**
 * Safely parses JSON and validates it as AnalysisResult
 * Returns null if parsing or validation fails
 */
export function parseAnalysisResult(json: string): AnalysisResult | null {
  try {
    const data = JSON.parse(json);
    if (isValidAnalysisResult(data)) {
      return data;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Safely parses JSON and validates it as GeneratedMessage
 * Returns null if parsing or validation fails
 */
export function parseGeneratedMessage(json: string): GeneratedMessage | null {
  try {
    const data = JSON.parse(json);
    if (isValidGeneratedMessage(data)) {
      return data;
    }
    return null;
  } catch {
    return null;
  }
}
