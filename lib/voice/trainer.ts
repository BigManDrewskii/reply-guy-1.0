// Voice Training - LLM-based voice extraction
import type { VoiceProfile } from '../db';
import { extractVoiceProfile } from '../openrouter';

// Extract voice fingerprint from example messages
export async function trainVoice(messages: string[]): Promise<VoiceProfile> {
  // LLM-based analysis
  const llmProfile = await extractVoiceProfile(messages);

  // Compute local metrics (no LLM needed)
  const localMetrics = {
    avgMessageLength: computeAvgLength(messages),
    emojiFrequency: computeEmojiFreq(messages),
    emojiTypes: extractTopEmojis(messages),
  };

  // Merge LLM analysis with local statistics
  return {
    id: crypto.randomUUID(),
    ...llmProfile,
    ...localMetrics,
    lastUpdated: new Date(),
  };
}

// Compute average message length
function computeAvgLength(messages: string[]): number {
  const wordCounts = messages.map((m) => m.split(/\s+/).length);
  const sum = wordCounts.reduce((a, b) => a + b, 0);
  return sum / wordCounts.length;
}

// Compute emoji frequency
function computeEmojiFreq(messages: string[]): number {
  const emojiCounts = messages.map((m) =>
    (m.match(/\p{Emoji}/gu) || []).length
  );
  const sum = emojiCounts.reduce((a, b) => a + b, 0);
  return sum / messages.length;
}

// Extract top 5 emojis
function extractTopEmojis(messages: string[]): string[] {
  const allEmojis = messages.flatMap((m) => m.match(/\p{Emoji}/gu) || []);
  const frequency: Record<string, number> = {};

  for (const emoji of allEmojis) {
    frequency[emoji] = (frequency[emoji] || 0) + 1;
  }

  return Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([emoji]) => emoji);
}
