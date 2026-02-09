import nlp from 'compromise';

// ============================================
// Stage 1: Local NLP Style Metrics Extraction
// Runs entirely client-side using compromise.js
// No API calls — computes quantitative anchors
// that prevent LLM drift during generation.
// ============================================

/**
 * Comprehensive local style metrics extracted from writing samples.
 * These become "hard anchors" in the generation prompt — the LLM
 * must match these numbers, not just vague descriptions.
 */
export interface LocalStyleMetrics {
  // Rhythm & Structure
  sentenceLength: {
    mean: number;
    median: number;
    stdDev: number;
    min: number;
    max: number;
  };
  paragraphLength: {
    meanSentences: number;
  };

  // Vocabulary
  vocabularyRichness: number;    // Type-Token Ratio (0-1)
  avgWordLength: number;
  rareWordRatio: number;         // % words not in top common words

  // Formality
  formalityScore: number;        // 0 (casual) to 100 (formal)
  contractionRate: number;       // % of sentences containing contractions
  firstPersonRate: number;       // I/me/my per 100 words
  secondPersonRate: number;      // you/your per 100 words

  // Punctuation Fingerprint
  punctuation: {
    exclamationRate: number;     // per 100 sentences
    questionRate: number;        // per 100 sentences
    emDashRate: number;          // per 1000 words
    semicolonRate: number;       // per 1000 words
    ellipsisRate: number;        // per 1000 words
    emojiRate: number;           // per 1000 words
  };

  // Sentence Starters
  sentenceStarters: {
    pronoun: number;             // % starting with pronouns
    conjunction: number;         // % starting with conjunctions
    adverb: number;              // % starting with adverbs
    noun: number;                // % starting with nouns
    question: number;            // % that are questions
  };

  // Readability
  fleschKincaid: number;         // grade level
  fleschReadingEase: number;     // 0-100
  readabilityLabel: 'conversational' | 'accessible' | 'moderate' | 'sophisticated' | 'academic';

  // Sentiment & Energy
  sentimentTone: 'positive' | 'neutral' | 'negative';
  energyLevel: 'low' | 'medium' | 'high';

  // Function Words (highest discrimination for authorship)
  functionWordProfile: {
    articles: number;            // the/a/an per 100 words
    prepositions: number;        // of/in/to/for per 100 words
    conjunctions: number;        // and/but/or/so per 100 words
    auxiliaries: number;         // is/was/have/will per 100 words
  };

  // Signature Phrases
  topBigrams: string[];          // top 2-word phrases
  topTrigrams: string[];         // top 3-word phrases

  // Active/Passive Voice
  activeVoiceRate: number;       // % of sentences in active voice
}

// ============================================
// Common words list (top ~200 English words)
// Used to compute rareWordRatio
// ============================================

const COMMON_WORDS = new Set([
  'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
  'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
  'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
  'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what',
  'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me',
  'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know', 'take',
  'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see',
  'other', 'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over',
  'think', 'also', 'back', 'after', 'use', 'two', 'how', 'our', 'work',
  'first', 'well', 'way', 'even', 'new', 'want', 'because', 'any', 'these',
  'give', 'day', 'most', 'us', 'is', 'are', 'was', 'were', 'been', 'being',
  'has', 'had', 'did', 'does', 'am', 'very', 'much', 'more', 'really',
  'still', 'here', 'thing', 'many', 'those', 'should', 'need', 'too',
  'right', 'through', 'where', 'own', 'same', 'down', 'long', 'great',
  'been', 'before', 'must', 'between', 'each', 'never', 'under', 'last',
  'let', 'thought', 'while', 'off', 'might', 'every', 'sure', 'why',
  'around', 'both', 'few', 'always', 'show', 'start', 'something', 'made',
  'keep', 'point', 'help', 'put', 'again', 'old', 'going', 'big', 'lot',
]);

// Contraction patterns for detection
const CONTRACTIONS = [
  /\b(i'm|i am)\b/gi, /\b(i've|i have)\b/gi, /\b(i'll|i will)\b/gi,
  /\b(i'd|i would|i had)\b/gi, /\b(you're|you are)\b/gi,
  /\b(you've|you have)\b/gi, /\b(you'll|you will)\b/gi,
  /\b(he's|he is|he has)\b/gi, /\b(she's|she is|she has)\b/gi,
  /\b(it's|it is|it has)\b/gi, /\b(we're|we are)\b/gi,
  /\b(we've|we have)\b/gi, /\b(they're|they are)\b/gi,
  /\b(they've|they have)\b/gi, /\b(that's|that is)\b/gi,
  /\b(there's|there is)\b/gi, /\b(here's|here is)\b/gi,
  /\b(what's|what is)\b/gi, /\b(who's|who is)\b/gi,
  /\b(can't|cannot)\b/gi, /\b(won't|will not)\b/gi,
  /\b(don't|do not)\b/gi, /\b(doesn't|does not)\b/gi,
  /\b(didn't|did not)\b/gi, /\b(isn't|is not)\b/gi,
  /\b(aren't|are not)\b/gi, /\b(wasn't|was not)\b/gi,
  /\b(weren't|were not)\b/gi, /\b(wouldn't|would not)\b/gi,
  /\b(couldn't|could not)\b/gi, /\b(shouldn't|should not)\b/gi,
  /\b(let's|let us)\b/gi, /\b(gonna|going to)\b/gi,
  /\b(wanna|want to)\b/gi, /\b(gotta|got to)\b/gi,
];

// Emoji regex pattern
const EMOJI_REGEX = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{200D}\u{20E3}]/gu;

/**
 * Compute comprehensive local style metrics from writing samples.
 * This is Stage 1 of the voice matching pipeline.
 * Runs entirely client-side — no API calls.
 * Typically completes in <100ms for 10-20 samples.
 */
export function extractLocalStyleMetrics(texts: string[]): LocalStyleMetrics {
  const allText = texts.join('\n\n');
  const doc = nlp(allText);

  // ── Sentence Analysis ──
  const sentenceTexts = doc.sentences().out('array') as string[];
  const sentenceCount = Math.max(sentenceTexts.length, 1);

  const sentenceLengths = sentenceTexts.map(
    (s) => s.split(/\s+/).filter((w) => w.length > 0).length
  );

  const slMean = sentenceLengths.reduce((a, b) => a + b, 0) / sentenceCount;
  const slSorted = [...sentenceLengths].sort((a, b) => a - b);
  const slMedian =
    sentenceCount % 2 === 0
      ? (slSorted[sentenceCount / 2 - 1] + slSorted[sentenceCount / 2]) / 2
      : slSorted[Math.floor(sentenceCount / 2)];
  const slVariance =
    sentenceLengths.reduce((sum, l) => sum + Math.pow(l - slMean, 2), 0) / sentenceCount;
  const slStdDev = Math.sqrt(slVariance);

  // ── Word Analysis ──
  const words = allText.split(/\s+/).filter((w) => w.length > 0);
  const wordCount = Math.max(words.length, 1);
  const cleanWords = words.map((w) => w.toLowerCase().replace(/[^a-z'-]/g, '')).filter(Boolean);

  // Average word length
  const avgWordLength =
    cleanWords.reduce((sum, w) => sum + w.length, 0) / Math.max(cleanWords.length, 1);

  // Vocabulary richness (Type-Token Ratio)
  const uniqueWords = new Set(cleanWords);
  const vocabularyRichness = uniqueWords.size / Math.max(cleanWords.length, 1);

  // Rare word ratio (words NOT in top common words)
  const rareWords = cleanWords.filter((w) => w.length > 2 && !COMMON_WORDS.has(w));
  const rareWordRatio = (rareWords.length / Math.max(cleanWords.length, 1)) * 100;

  // ── Paragraph Analysis ──
  const paragraphs = allText.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
  const paragraphSentenceCounts = paragraphs.map(
    (p) => (nlp(p).sentences().out('array') as string[]).length
  );
  const meanSentencesPerParagraph =
    paragraphSentenceCounts.reduce((a, b) => a + b, 0) /
    Math.max(paragraphSentenceCounts.length, 1);

  // ── Contraction Rate ──
  const contractedPattern = /\b\w+'\w+\b/g;
  const sentencesWithContractions = sentenceTexts.filter((s) => contractedPattern.test(s)).length;
  const contractionRate = (sentencesWithContractions / sentenceCount) * 100;

  // ── Pronoun Rates ──
  const firstPersonMatches = allText.match(/\b(i|me|my|mine|myself|i'm|i've|i'll|i'd)\b/gi) || [];
  const firstPersonRate = (firstPersonMatches.length / wordCount) * 100;

  const secondPersonMatches = allText.match(/\b(you|your|yours|yourself|you're|you've|you'll|you'd)\b/gi) || [];
  const secondPersonRate = (secondPersonMatches.length / wordCount) * 100;

  // ── Punctuation Fingerprint ──
  const exclamations = sentenceTexts.filter((s) => s.trim().endsWith('!')).length;
  const questions = sentenceTexts.filter((s) => s.trim().endsWith('?')).length;
  const emDashes = (allText.match(/—|--/g) || []).length;
  const semicolons = (allText.match(/;/g) || []).length;
  const ellipses = (allText.match(/\.{3}|…/g) || []).length;
  const emojis = (allText.match(EMOJI_REGEX) || []).length;

  // ── Sentence Starters ──
  const starterCounts = { pronoun: 0, conjunction: 0, adverb: 0, noun: 0, question: 0 };
  const pronounStarters = /^(i|you|we|they|he|she|it|my|your|our|their)\b/i;
  const conjunctionStarters = /^(and|but|so|because|or|yet|however|also|plus|still|though)\b/i;

  for (const sentence of sentenceTexts) {
    const trimmed = sentence.trim();
    const firstWord = trimmed.split(/\s+/)[0]?.toLowerCase() || '';

    if (trimmed.endsWith('?')) starterCounts.question++;
    if (pronounStarters.test(trimmed)) starterCounts.pronoun++;
    else if (conjunctionStarters.test(trimmed)) starterCounts.conjunction++;
    else {
      // Use compromise for POS tagging on the first word
      const firstDoc = nlp(firstWord);
      if (firstDoc.has('#Adverb')) starterCounts.adverb++;
      else if (firstDoc.has('#Noun')) starterCounts.noun++;
    }
  }

  // ── Readability (Flesch-Kincaid) ──
  const syllableCount = cleanWords.reduce((sum, w) => sum + estimateSyllables(w), 0);
  const avgSyllablesPerWord = syllableCount / Math.max(cleanWords.length, 1);

  const fleschReadingEase = Math.max(
    0,
    Math.min(100, 206.835 - 1.015 * slMean - 84.6 * avgSyllablesPerWord)
  );
  const fleschKincaid = Math.max(
    0,
    0.39 * slMean + 11.8 * avgSyllablesPerWord - 15.59
  );

  let readabilityLabel: LocalStyleMetrics['readabilityLabel'];
  if (fleschReadingEase >= 80) readabilityLabel = 'conversational';
  else if (fleschReadingEase >= 65) readabilityLabel = 'accessible';
  else if (fleschReadingEase >= 50) readabilityLabel = 'moderate';
  else if (fleschReadingEase >= 30) readabilityLabel = 'sophisticated';
  else readabilityLabel = 'academic';

  // ── Formality Score ──
  // Research-backed: formality correlates with longer sentences, fewer contractions,
  // fewer first-person pronouns, fewer exclamations, more passive voice
  const formalityScore = Math.min(
    100,
    Math.max(
      0,
      50 +
        (slMean > 18 ? 12 : slMean > 14 ? 5 : slMean < 10 ? -12 : -5) +
        (avgWordLength > 5.2 ? 8 : avgWordLength < 4.2 ? -8 : 0) +
        (contractionRate < 15 ? 10 : contractionRate > 50 ? -12 : -3) +
        (firstPersonRate < 3 ? 5 : firstPersonRate > 7 ? -8 : 0) +
        (exclamations / sentenceCount > 0.1 ? -8 : 0) +
        (emojis > 0 ? -5 : 3)
    )
  );

  // ── Sentiment & Energy ──
  const positiveWords = doc.match(
    '(great|awesome|love|excellent|amazing|good|best|happy|excited|wonderful|fantastic|incredible|brilliant|perfect|beautiful)'
  ).length;
  const negativeWords = doc.match(
    '(bad|terrible|hate|worst|awful|poor|disappointing|frustrated|annoying|horrible|ugly|boring|stupid)'
  ).length;
  const sentimentTone: LocalStyleMetrics['sentimentTone'] =
    positiveWords > negativeWords * 1.5
      ? 'positive'
      : negativeWords > positiveWords * 1.5
        ? 'negative'
        : 'neutral';

  const energyLevel: LocalStyleMetrics['energyLevel'] =
    exclamations / sentenceCount > 0.15 || emojis / wordCount > 0.01
      ? 'high'
      : exclamations / sentenceCount < 0.03 && avgWordLength > 5
        ? 'low'
        : 'medium';

  // ── Function Word Profile ──
  // Harvard research: function words are MORE identifying than vocabulary
  const articleMatches = allText.match(/\b(the|a|an)\b/gi) || [];
  const prepositionMatches = allText.match(/\b(of|in|to|for|with|on|at|from|by|about|into|through|between|after|before)\b/gi) || [];
  const conjunctionMatches = allText.match(/\b(and|but|or|so|yet|nor|because|although|while|if|when|since|unless)\b/gi) || [];
  const auxiliaryMatches = allText.match(/\b(is|are|was|were|be|been|being|have|has|had|do|does|did|will|would|shall|should|may|might|can|could|must)\b/gi) || [];

  // ── N-grams ──
  const bigrams = extractNgrams(cleanWords, 2);
  const trigrams = extractNgrams(cleanWords, 3);

  const topBigrams = Object.entries(bigrams)
    .filter(([, count]) => count > 1)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([phrase]) => phrase);

  const topTrigrams = Object.entries(trigrams)
    .filter(([, count]) => count > 1)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([phrase]) => phrase);

  // ── Active Voice Rate ──
  const passiveCount = doc.match('#Noun+ (was|were|been|being|is|are) #PastTense').length;
  const activeVoiceRate = Math.max(0, 100 - (passiveCount / sentenceCount) * 100);

  return {
    sentenceLength: {
      mean: round(slMean, 1),
      median: round(slMedian, 1),
      stdDev: round(slStdDev, 1),
      min: Math.min(...sentenceLengths, 0),
      max: Math.max(...sentenceLengths, 0),
    },
    paragraphLength: {
      meanSentences: round(meanSentencesPerParagraph, 1),
    },
    vocabularyRichness: round(vocabularyRichness, 3),
    avgWordLength: round(avgWordLength, 1),
    rareWordRatio: round(rareWordRatio, 1),
    formalityScore: Math.round(formalityScore),
    contractionRate: round(contractionRate, 1),
    firstPersonRate: round(firstPersonRate, 1),
    secondPersonRate: round(secondPersonRate, 1),
    punctuation: {
      exclamationRate: round((exclamations / sentenceCount) * 100, 1),
      questionRate: round((questions / sentenceCount) * 100, 1),
      emDashRate: round((emDashes / wordCount) * 1000, 1),
      semicolonRate: round((semicolons / wordCount) * 1000, 1),
      ellipsisRate: round((ellipses / wordCount) * 1000, 1),
      emojiRate: round((emojis / wordCount) * 1000, 1),
    },
    sentenceStarters: {
      pronoun: round((starterCounts.pronoun / sentenceCount) * 100, 1),
      conjunction: round((starterCounts.conjunction / sentenceCount) * 100, 1),
      adverb: round((starterCounts.adverb / sentenceCount) * 100, 1),
      noun: round((starterCounts.noun / sentenceCount) * 100, 1),
      question: round((starterCounts.question / sentenceCount) * 100, 1),
    },
    fleschKincaid: round(fleschKincaid, 1),
    fleschReadingEase: round(fleschReadingEase, 1),
    readabilityLabel,
    sentimentTone,
    energyLevel,
    functionWordProfile: {
      articles: round((articleMatches.length / wordCount) * 100, 1),
      prepositions: round((prepositionMatches.length / wordCount) * 100, 1),
      conjunctions: round((conjunctionMatches.length / wordCount) * 100, 1),
      auxiliaries: round((auxiliaryMatches.length / wordCount) * 100, 1),
    },
    topBigrams,
    topTrigrams,
    activeVoiceRate: round(activeVoiceRate, 1),
  };
}

/**
 * Generate a concise human-readable summary of the style metrics.
 * Used in the UI and as context for the LLM analysis.
 */
export function summarizeLocalMetrics(m: LocalStyleMetrics): string {
  const parts: string[] = [];

  // Sentence rhythm
  if (m.sentenceLength.mean < 10) parts.push('Very short, punchy sentences');
  else if (m.sentenceLength.mean < 14) parts.push('Short, direct sentences');
  else if (m.sentenceLength.mean < 20) parts.push('Medium-length sentences');
  else parts.push('Long, detailed sentences');

  // Variation
  if (m.sentenceLength.stdDev > 8) parts.push('with high length variation');
  else if (m.sentenceLength.stdDev < 4) parts.push('with very consistent length');

  // Formality
  if (m.formalityScore > 70) parts.push('formal tone');
  else if (m.formalityScore > 55) parts.push('moderately formal');
  else if (m.formalityScore > 35) parts.push('balanced formality');
  else if (m.formalityScore > 20) parts.push('casual/conversational');
  else parts.push('very casual/informal');

  // Contractions
  if (m.contractionRate > 50) parts.push('heavy contraction use');
  else if (m.contractionRate < 10) parts.push('avoids contractions');

  // Pronouns
  if (m.firstPersonRate > 6) parts.push('frequently uses "I/me/my"');
  if (m.secondPersonRate > 5) parts.push('addresses "you" directly');

  // Punctuation signature
  if (m.punctuation.exclamationRate > 15) parts.push('uses exclamations for emphasis');
  if (m.punctuation.questionRate > 20) parts.push('frequently asks questions');
  if (m.punctuation.emDashRate > 5) parts.push('uses em-dashes');
  if (m.punctuation.ellipsisRate > 3) parts.push('uses ellipses');
  if (m.punctuation.emojiRate > 2) parts.push('includes emojis');

  // Energy
  if (m.energyLevel === 'high') parts.push('high energy');
  else if (m.energyLevel === 'low') parts.push('measured/calm energy');

  // Readability
  parts.push(`${m.readabilityLabel} readability (grade ${m.fleschKincaid})`);

  return parts.join(', ') + '.';
}

/**
 * Format the local metrics as a structured string for the LLM prompt.
 * This gives the LLM precise quantitative context to anchor its analysis.
 */
export function formatMetricsForPrompt(m: LocalStyleMetrics): string {
  return `QUANTITATIVE STYLE METRICS (from local NLP analysis):
- Sentence length: mean=${m.sentenceLength.mean} words, median=${m.sentenceLength.median}, stdDev=${m.sentenceLength.stdDev}, range=[${m.sentenceLength.min}-${m.sentenceLength.max}]
- Paragraph length: ${m.paragraphLength.meanSentences} sentences per paragraph
- Vocabulary richness (TTR): ${m.vocabularyRichness} (${m.vocabularyRichness > 0.6 ? 'diverse' : m.vocabularyRichness > 0.4 ? 'moderate' : 'repetitive'})
- Average word length: ${m.avgWordLength} characters
- Rare word usage: ${m.rareWordRatio}% of words are uncommon
- Formality: ${m.formalityScore}/100 (${m.formalityScore > 65 ? 'formal' : m.formalityScore < 35 ? 'casual' : 'balanced'})
- Contraction rate: ${m.contractionRate}% of sentences use contractions
- First-person pronouns (I/me/my): ${m.firstPersonRate} per 100 words
- Second-person pronouns (you/your): ${m.secondPersonRate} per 100 words
- Exclamation marks: ${m.punctuation.exclamationRate}% of sentences
- Questions: ${m.punctuation.questionRate}% of sentences
- Em-dashes: ${m.punctuation.emDashRate} per 1000 words
- Ellipses: ${m.punctuation.ellipsisRate} per 1000 words
- Emojis: ${m.punctuation.emojiRate} per 1000 words
- Sentence starters: ${m.sentenceStarters.pronoun}% pronouns, ${m.sentenceStarters.conjunction}% conjunctions, ${m.sentenceStarters.noun}% nouns
- Readability: Flesch-Kincaid grade ${m.fleschKincaid}, reading ease ${m.fleschReadingEase}/100 (${m.readabilityLabel})
- Active voice: ${m.activeVoiceRate}%
- Sentiment: ${m.sentimentTone}, energy: ${m.energyLevel}
- Function words per 100: articles=${m.functionWordProfile.articles}, prepositions=${m.functionWordProfile.prepositions}, conjunctions=${m.functionWordProfile.conjunctions}
${m.topBigrams.length > 0 ? `- Signature bigrams: "${m.topBigrams.join('", "')}"` : ''}
${m.topTrigrams.length > 0 ? `- Signature trigrams: "${m.topTrigrams.join('", "')}"` : ''}`;
}

/**
 * Compute a local voice match score by comparing a generated message
 * against the voice profile metrics. Returns 0-100.
 */
export function computeLocalVoiceMatchScore(
  generatedText: string,
  targetMetrics: LocalStyleMetrics
): { score: number; breakdown: VoiceMatchBreakdown } {
  const genMetrics = extractLocalStyleMetrics([generatedText]);

  // Score each dimension (0-100) based on how close the generated text is to the target
  const slScore = 100 - Math.min(100, Math.abs(genMetrics.sentenceLength.mean - targetMetrics.sentenceLength.mean) * 5);
  const formalityDiff = Math.abs(genMetrics.formalityScore - targetMetrics.formalityScore);
  const formalityMatchScore = 100 - Math.min(100, formalityDiff * 2);
  const contractionDiff = Math.abs(genMetrics.contractionRate - targetMetrics.contractionRate);
  const contractionMatchScore = 100 - Math.min(100, contractionDiff * 2);
  const readabilityDiff = Math.abs(genMetrics.fleschReadingEase - targetMetrics.fleschReadingEase);
  const readabilityMatchScore = 100 - Math.min(100, readabilityDiff * 2);
  const firstPersonDiff = Math.abs(genMetrics.firstPersonRate - targetMetrics.firstPersonRate);
  const pronounMatchScore = 100 - Math.min(100, firstPersonDiff * 10);

  // Punctuation matching
  const exclamDiff = Math.abs(genMetrics.punctuation.exclamationRate - targetMetrics.punctuation.exclamationRate);
  const questionDiff = Math.abs(genMetrics.punctuation.questionRate - targetMetrics.punctuation.questionRate);
  const punctuationMatchScore = 100 - Math.min(100, (exclamDiff + questionDiff) * 2);

  // Weighted composite score
  // Sentence rhythm and formality are the highest-discrimination features
  const weights = {
    sentenceLength: 0.25,
    formality: 0.20,
    contractions: 0.15,
    readability: 0.15,
    pronouns: 0.10,
    punctuation: 0.15,
  };

  const score = Math.round(
    slScore * weights.sentenceLength +
    formalityMatchScore * weights.formality +
    contractionMatchScore * weights.contractions +
    readabilityMatchScore * weights.readability +
    pronounMatchScore * weights.pronouns +
    punctuationMatchScore * weights.punctuation
  );

  return {
    score: Math.max(0, Math.min(100, score)),
    breakdown: {
      sentenceLength: Math.round(slScore),
      formality: Math.round(formalityMatchScore),
      contractions: Math.round(contractionMatchScore),
      readability: Math.round(readabilityMatchScore),
      pronouns: Math.round(pronounMatchScore),
      punctuation: Math.round(punctuationMatchScore),
    },
  };
}

export interface VoiceMatchBreakdown {
  sentenceLength: number;
  formality: number;
  contractions: number;
  readability: number;
  pronouns: number;
  punctuation: number;
}

// ============================================
// Utility Functions
// ============================================

function round(n: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(n * factor) / factor;
}

function estimateSyllables(word: string): number {
  word = word.toLowerCase().replace(/[^a-z]/g, '');
  if (word.length <= 3) return 1;

  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
  word = word.replace(/^y/, '');

  const matches = word.match(/[aeiouy]{1,2}/g);
  return matches ? Math.max(matches.length, 1) : 1;
}

function extractNgrams(words: string[], n: number): Record<string, number> {
  const ngrams: Record<string, number> = {};
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to',
    'for', 'of', 'is', 'it', 'this', 'that', 'with', 'as', 'by',
  ]);

  for (let i = 0; i <= words.length - n; i++) {
    const gram = words.slice(i, i + n);
    // Skip grams that are ALL stop words
    if (gram.every((w) => stopWords.has(w))) continue;
    // Skip grams with very short words only
    if (gram.every((w) => w.length <= 2)) continue;

    const key = gram.join(' ');
    ngrams[key] = (ngrams[key] || 0) + 1;
  }

  return ngrams;
}
