// Voice Scoring - Authenticity measurement
import type { VoiceProfile } from '../db';

// Score message authenticity against voice profile
export function scoreAuthenticity(
  message: string,
  profile: VoiceProfile
): number {
  let score = 100;

  // Length penalty
  const wordCount = message.split(/\s+/).length;
  score -= Math.abs(wordCount - profile.avgMessageLength) * 2;

  // Emoji frequency penalty
  const emojiCount = (message.match(/\p{Emoji}/gu) || []).length;
  score -= Math.abs(emojiCount - profile.emojiFrequency) * 10;

  // Avoid phrases penalty
  for (const phrase of profile.avoidPhrases) {
    if (message.toLowerCase().includes(phrase.toLowerCase())) {
      score -= 20;
    }
  }

  return Math.max(0, Math.min(100, score));
}
