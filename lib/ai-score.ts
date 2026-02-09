/**
 * AI-ness Scoring Module
 * 
 * Uses multiple heuristics to estimate how "AI-generated" a text sounds.
 * Based on research from ZipPy (compression ratio) and common AI writing patterns.
 * 
 * Score: 0-100 where 0 = very human, 100 = very AI-sounding
 */

// Common AI filler phrases that indicate LLM-generated text
const AI_PHRASES = [
  'i hope this message finds you well',
  'i wanted to reach out',
  'i came across your',
  'i was impressed by',
  'i\'d love to connect',
  'i\'d love to chat',
  'i\'d love to learn more',
  'let me know if you\'d be open',
  'would you be open to',
  'looking forward to connecting',
  'looking forward to hearing',
  'i believe there could be',
  'i think there\'s a great opportunity',
  'synergy',
  'leverage',
  'circle back',
  'touch base',
  'deep dive',
  'game-changer',
  'cutting-edge',
  'innovative solution',
  'value proposition',
  'thought leader',
  'paradigm shift',
  'best-in-class',
  'at the end of the day',
  'in today\'s fast-paced',
  'in the ever-evolving',
  'it\'s worth noting',
  'it goes without saying',
  'needless to say',
  'that being said',
  'having said that',
  'delve into',
  'delve deeper',
  'navigate the complexities',
  'foster meaningful',
  'cultivate',
  'spearhead',
  'revolutionize',
  'streamline',
];

// Typical AI sentence starters
const AI_STARTERS = [
  'i noticed that',
  'i was particularly',
  'i\'m reaching out because',
  'i\'m writing to',
  'as someone who',
  'as a fellow',
  'given your expertise',
  'given your background',
  'with your experience',
  'based on your',
];

/**
 * Calculate compression ratio as a proxy for repetitiveness/predictability.
 * AI text tends to be more compressible (more predictable patterns).
 * Uses a simple run-length + dictionary approach since we can't use gzip in browser.
 */
function compressionScore(text: string): number {
  if (text.length < 50) return 50; // Not enough text to judge

  const words = text.toLowerCase().split(/\s+/);
  const uniqueWords = new Set(words);
  
  // Type-token ratio: unique words / total words
  // AI text tends to have lower diversity
  const ttr = uniqueWords.size / words.length;
  
  // Bigram repetition
  const bigrams = new Set<string>();
  let bigramTotal = 0;
  for (let i = 0; i < words.length - 1; i++) {
    bigrams.add(`${words[i]} ${words[i + 1]}`);
    bigramTotal++;
  }
  const bigramRatio = bigramTotal > 0 ? bigrams.size / bigramTotal : 1;

  // Lower TTR and bigram ratio = more AI-like
  // TTR: human ~0.6-0.8, AI ~0.4-0.6
  // Bigram: human ~0.85-0.95, AI ~0.7-0.85
  const ttrScore = Math.max(0, Math.min(100, (0.7 - ttr) * 200));
  const bigramScore = Math.max(0, Math.min(100, (0.9 - bigramRatio) * 300));

  return (ttrScore + bigramScore) / 2;
}

/**
 * Check for AI-typical phrase patterns
 */
function phraseScore(text: string): number {
  const lower = text.toLowerCase();
  let matches = 0;

  for (const phrase of AI_PHRASES) {
    if (lower.includes(phrase)) matches++;
  }

  for (const starter of AI_STARTERS) {
    if (lower.includes(starter)) matches++;
  }

  // 0 matches = 0 score, 3+ matches = high score
  return Math.min(100, matches * 25);
}

/**
 * Check sentence structure uniformity (AI tends to write uniform-length sentences)
 */
function structureScore(text: string): number {
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  if (sentences.length < 3) return 30; // Not enough to judge

  const lengths = sentences.map((s) => s.trim().split(/\s+/).length);
  const avg = lengths.reduce((a, b) => a + b, 0) / lengths.length;
  
  // Calculate coefficient of variation
  const variance = lengths.reduce((sum, l) => sum + Math.pow(l - avg, 2), 0) / lengths.length;
  const stdDev = Math.sqrt(variance);
  const cv = avg > 0 ? stdDev / avg : 0;

  // Low CV = uniform sentences = more AI-like
  // Human: CV ~0.4-0.8, AI: CV ~0.15-0.35
  return Math.max(0, Math.min(100, (0.5 - cv) * 200));
}

/**
 * Check for excessive hedging and qualifiers (AI loves these)
 */
function hedgingScore(text: string): number {
  const lower = text.toLowerCase();
  const hedges = [
    'perhaps', 'maybe', 'possibly', 'potentially', 'arguably',
    'it seems', 'it appears', 'it\'s possible', 'one might',
    'could potentially', 'might consider', 'worth exploring',
    'i think', 'i believe', 'in my opinion', 'from my perspective',
  ];

  const words = lower.split(/\s+/).length;
  let matches = 0;
  for (const hedge of hedges) {
    const regex = new RegExp(hedge, 'g');
    const found = lower.match(regex);
    if (found) matches += found.length;
  }

  // Hedge density: matches per 100 words
  const density = (matches / words) * 100;
  return Math.min(100, density * 30);
}

/**
 * Calculate overall AI-ness score
 * Returns 0-100 where lower = more human-sounding
 */
export function calculateAiScore(text: string): {
  score: number;
  label: string;
  breakdown: {
    compression: number;
    phrases: number;
    structure: number;
    hedging: number;
  };
  suggestions: string[];
} {
  if (!text || text.length < 20) {
    return {
      score: 0,
      label: 'Too short to analyze',
      breakdown: { compression: 0, phrases: 0, structure: 0, hedging: 0 },
      suggestions: [],
    };
  }

  const compression = compressionScore(text);
  const phrases = phraseScore(text);
  const structure = structureScore(text);
  const hedging = hedgingScore(text);

  // Weighted average (phrases matter most for outreach)
  const score = Math.round(
    compression * 0.2 +
    phrases * 0.4 +
    structure * 0.2 +
    hedging * 0.2
  );

  const clampedScore = Math.max(0, Math.min(100, score));

  // Generate label
  let label: string;
  if (clampedScore <= 20) label = 'Very human';
  else if (clampedScore <= 40) label = 'Mostly human';
  else if (clampedScore <= 60) label = 'Mixed';
  else if (clampedScore <= 80) label = 'Somewhat AI';
  else label = 'Very AI';

  // Generate suggestions
  const suggestions: string[] = [];
  if (phrases > 40) {
    suggestions.push('Remove generic AI phrases like "I hope this finds you well" or "I\'d love to connect"');
  }
  if (structure > 50) {
    suggestions.push('Vary your sentence lengths — mix short punchy sentences with longer ones');
  }
  if (hedging > 40) {
    suggestions.push('Reduce hedging words like "perhaps", "potentially", "might consider"');
  }
  if (compression > 50) {
    suggestions.push('Use more specific, unique vocabulary instead of common generic terms');
  }

  return {
    score: clampedScore,
    label,
    breakdown: { compression, phrases, structure, hedging },
    suggestions,
  };
}

/**
 * Quick check — returns just the score number
 */
export function quickAiScore(text: string): number {
  return calculateAiScore(text).score;
}
