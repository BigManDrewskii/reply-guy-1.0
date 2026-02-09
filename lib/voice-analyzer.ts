import nlp from 'compromise';

export interface VoiceMetrics {
  avgSentenceLength: number;
  avgWordLength: number;
  readabilityScore: number;
  formalityScore: number;
  questionFrequency: number;
  exclamationFrequency: number;
  vocabularyRichness: number;
  topPhrases: string[];
  sentimentTone: 'positive' | 'neutral' | 'negative';
  personalPronounRate: number;
  activeVoiceRate: number;
}

/**
 * Analyze writing style metrics locally using compromise.js.
 * No API calls needed — runs entirely in the browser.
 */
export function analyzeVoiceMetrics(texts: string[]): VoiceMetrics {
  const allText = texts.join(' ');
  const doc = nlp(allText);

  // Sentence analysis
  const sentences = doc.sentences().out('array') as string[];
  const sentenceCount = Math.max(sentences.length, 1);

  // Word analysis
  const words = allText.split(/\s+/).filter(w => w.length > 0);
  const wordCount = Math.max(words.length, 1);

  // Average sentence length
  const avgSentenceLength = wordCount / sentenceCount;

  // Average word length
  const avgWordLength = words.reduce((sum, w) => sum + w.replace(/[^a-zA-Z]/g, '').length, 0) / wordCount;

  // Question frequency (% of sentences that are questions)
  const questions = doc.sentences().if('#QuestionMark').length;
  const questionFrequency = (questions / sentenceCount) * 100;

  // Exclamation frequency
  const exclamations = sentences.filter(s => s.trim().endsWith('!')).length;
  const exclamationFrequency = (exclamations / sentenceCount) * 100;

  // Vocabulary richness (type-token ratio)
  const uniqueWords = new Set(words.map(w => w.toLowerCase().replace(/[^a-z]/g, '')).filter(Boolean));
  const vocabularyRichness = (uniqueWords.size / wordCount) * 100;

  // Formality score (0-100)
  // Higher = more formal. Based on: longer sentences, longer words, fewer pronouns, fewer exclamations
  const pronouns = doc.match('#Pronoun').length;
  const personalPronounRate = (pronouns / wordCount) * 100;
  const formalityScore = Math.min(100, Math.max(0,
    50
    + (avgSentenceLength > 15 ? 10 : -10)
    + (avgWordLength > 5 ? 10 : -5)
    - (personalPronounRate > 8 ? 10 : 0)
    - (exclamationFrequency > 10 ? 10 : 0)
    + (questionFrequency < 5 ? 5 : -5)
  ));

  // Readability (Flesch-Kincaid approximation)
  const syllableCount = words.reduce((sum, w) => sum + estimateSyllables(w), 0);
  const readabilityScore = Math.max(0, Math.min(100,
    206.835 - 1.015 * (wordCount / sentenceCount) - 84.6 * (syllableCount / wordCount)
  ));

  // Top phrases (2-3 word phrases that appear more than once)
  const ngrams = extractNgrams(words, 2, 3);
  const topPhrases = Object.entries(ngrams)
    .filter(([, count]) => count > 1)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([phrase]) => phrase);

  // Sentiment tone
  const positiveWords = doc.match('(great|awesome|love|excellent|amazing|good|best|happy|excited|wonderful)').length;
  const negativeWords = doc.match('(bad|terrible|hate|worst|awful|poor|disappointing|frustrated|annoying)').length;
  const sentimentTone: VoiceMetrics['sentimentTone'] =
    positiveWords > negativeWords * 1.5 ? 'positive' :
    negativeWords > positiveWords * 1.5 ? 'negative' : 'neutral';

  // Active voice rate (approximation)
  const passiveCount = doc.match('#Noun+ (was|were|been|being|is|are) #PastTense').length;
  const activeVoiceRate = Math.max(0, 100 - (passiveCount / sentenceCount) * 100);

  return {
    avgSentenceLength: Math.round(avgSentenceLength * 10) / 10,
    avgWordLength: Math.round(avgWordLength * 10) / 10,
    readabilityScore: Math.round(readabilityScore),
    formalityScore: Math.round(formalityScore),
    questionFrequency: Math.round(questionFrequency),
    exclamationFrequency: Math.round(exclamationFrequency),
    vocabularyRichness: Math.round(vocabularyRichness),
    topPhrases,
    sentimentTone,
    personalPronounRate: Math.round(personalPronounRate * 10) / 10,
    activeVoiceRate: Math.round(activeVoiceRate),
  };
}

/**
 * Estimate syllable count for a word.
 */
function estimateSyllables(word: string): number {
  word = word.toLowerCase().replace(/[^a-z]/g, '');
  if (word.length <= 3) return 1;

  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
  word = word.replace(/^y/, '');

  const matches = word.match(/[aeiouy]{1,2}/g);
  return matches ? matches.length : 1;
}

/**
 * Extract n-grams from a word list.
 */
function extractNgrams(words: string[], minN: number, maxN: number): Record<string, number> {
  const ngrams: Record<string, number> = {};
  const cleanWords = words.map(w => w.toLowerCase().replace(/[^a-z']/g, '')).filter(w => w.length > 2);

  for (let n = minN; n <= maxN; n++) {
    for (let i = 0; i <= cleanWords.length - n; i++) {
      const gram = cleanWords.slice(i, i + n).join(' ');
      // Skip grams with stop words only
      const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'is', 'it']);
      const gramWords = gram.split(' ');
      if (gramWords.every(w => stopWords.has(w))) continue;

      ngrams[gram] = (ngrams[gram] || 0) + 1;
    }
  }

  return ngrams;
}

/**
 * Generate a human-readable voice profile summary from metrics.
 */
export function summarizeVoiceMetrics(metrics: VoiceMetrics): string {
  const parts: string[] = [];

  // Sentence style
  if (metrics.avgSentenceLength < 12) {
    parts.push('Short, punchy sentences');
  } else if (metrics.avgSentenceLength > 20) {
    parts.push('Long, detailed sentences');
  } else {
    parts.push('Medium-length sentences');
  }

  // Formality
  if (metrics.formalityScore > 65) {
    parts.push('formal tone');
  } else if (metrics.formalityScore < 35) {
    parts.push('casual/conversational tone');
  } else {
    parts.push('balanced formality');
  }

  // Questions
  if (metrics.questionFrequency > 15) {
    parts.push('frequently asks questions');
  }

  // Exclamations
  if (metrics.exclamationFrequency > 10) {
    parts.push('uses exclamations for emphasis');
  }

  // Sentiment
  if (metrics.sentimentTone === 'positive') {
    parts.push('generally positive/enthusiastic');
  } else if (metrics.sentimentTone === 'negative') {
    parts.push('direct/critical tone');
  }

  return parts.join(', ') + '.';
}
