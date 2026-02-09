import type { LocalStyleMetrics } from '@/lib/voice-analyzer';

export interface PageData {
  url: string;
  hostname: string;
  platform: 'x' | 'linkedin' | 'github' | 'generic';
  title: string;
  metaDescription: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  scrapedAt: string;
  isReady: boolean;
  confidence?: number;
  // X (Twitter) specific
  name?: string;
  bio?: string;
  location?: string;
  followers?: string;
  recentPosts?: string[];
  isProfile?: boolean;
  username?: string;
  // LinkedIn specific
  headline?: string;
  about?: string;
  experience?: string[];
  education?: string[];
  skills?: string[];
  connectionDegree?: string;
  avatarUrl?: string;
  profileSections?: Record<string, string>;
  recentActivity?: string[];
  // GitHub specific
  company?: string;
  // Generic site specific
  h1?: string;
  bodyText?: string;
  socialLinks?: string[];
  email?: string;
  // Readability-extracted fields
  excerpt?: string;
  byline?: string;
  method?: 'readability' | 'meta-tags';
  // Thread context
  threadContext?: string[];
  isThread?: boolean;
}

export interface AnalysisResult {
  personName: string;
  summary: string;
  interests: string[];
  outreachAngles: OutreachAngle[];
  confidence: number;
  confidenceReason: string;
}

export interface OutreachAngle {
  angle: 'service' | 'partner' | 'community' | 'value';
  hook: string;
  relevance: string;
}

// ============================================
// Voice Profile — Structured 4-Stage Pipeline
// ============================================

/**
 * Biber's 6 register dimensions (1-10 scale).
 * Adapted from the Register-Guided (RG) Prompting technique.
 */
export interface RegisterDimensions {
  involvedVsInformational: number;     // 1=involved, 10=informational
  narrativeVsNonNarrative: number;     // 1=narrative, 10=non-narrative
  situationDependentVsExplicit: number; // 1=context-dependent, 10=explicit
  nonPersuasiveVsPersuasive: number;   // 1=neutral, 10=persuasive
  concreteVsAbstract: number;          // 1=concrete, 10=abstract
  casualVsFormalElaboration: number;   // 1=casual, 10=formal/elaborate
}

/**
 * Tone profile extracted from writing samples.
 */
export interface ToneProfile {
  primary: string;        // e.g., "direct", "warm", "analytical"
  secondary: string;      // e.g., "empathetic", "confident"
  humor: 'none' | 'dry' | 'sarcastic' | 'self-deprecating' | 'playful' | 'witty';
  confidence: 'tentative' | 'balanced' | 'assertive' | 'commanding';
}

/**
 * Signature patterns — recurring structural elements in the writer's style.
 */
export interface SignaturePatterns {
  openingPatterns: string[];     // How they typically start messages
  transitionWords: string[];     // Favorite connectors
  closingPatterns: string[];     // How they typically end
  catchphrases: string[];        // Recurring expressions or idioms
}

/**
 * A few-shot exemplar — an actual writing sample stored for prompt injection.
 * Research shows 2-5 exemplars improve style matching by 23.5x vs descriptions alone.
 */
export interface VoiceExemplar {
  text: string;
  context: string;               // "DM to a potential client" | "tweet reply" | "LinkedIn message"
  wordCount: number;
}

/**
 * The comprehensive structured voice profile.
 * Replaces the old freeform text description with a research-backed
 * multi-dimensional representation of the user's writing voice.
 */
export interface VoiceProfile {
  // Identity & Metadata
  id: string;
  createdAt: number;
  updatedAt: number;
  sampleCount: number;

  // Biber Register Dimensions (from LLM analysis)
  register: RegisterDimensions;

  // Tone Profile (from LLM analysis)
  tone: ToneProfile;

  // Style Descriptors (from LLM analysis)
  descriptors: string[];           // ["concise", "punchy", "conversational", ...]

  // Signature Patterns (from LLM analysis)
  signatures: SignaturePatterns;

  // Anti-Patterns — what NOT to do (from LLM analysis)
  antiPatterns: string[];          // ["Never uses emojis", "Avoids exclamation marks", ...]

  // Voice Rules — actionable instructions (from LLM analysis)
  rules: string[];                 // ["Open with the main point", "Keep paragraphs to 2-3 sentences", ...]

  // Quantitative Anchors (from Stage 1 local NLP)
  metrics: LocalStyleMetrics;

  // Few-Shot Exemplars (actual writing samples, stored for injection)
  exemplars: VoiceExemplar[];

  // Profile quality (based on sample count)
  quality: VoiceProfileQuality;
}

/**
 * Profile quality indicator based on research findings
 * about diminishing returns beyond 5 samples.
 */
export interface VoiceProfileQuality {
  score: number;                   // 0-100
  label: string;                   // "Basic", "Good", "Strong", "Excellent", "Optimal"
  suggestion?: string;             // "Add more samples for better matching"
}

// ============================================
// Legacy VoiceProfile compat
// (kept for migration from old schema)
// ============================================

export interface LegacyVoiceProfile {
  id: string;
  tone: number;
  openingPatterns: string[];
  closingPatterns: string[];
  personalityMarkers: string[];
  avoidPhrases: string[];
  vocabularySignature: string[];
  exampleMessages: string[];
  lastUpdated: number;
  avgSentenceLength?: number;
  readabilityScore?: number;
  formalityScore?: number;
  questionFrequency?: number;
  exclamationFrequency?: number;
}

// ============================================
// Generated Messages
// ============================================

export interface GeneratedMessage {
  message: string;
  wordCount: number;
  hook: string;
  voiceScore: number;
  suggestedDelay?: string;
}

export interface CachedAnalysis {
  analysis: AnalysisResult;
  timestamp: number;
}

// ============================================
// Contact Relationship Manager (Mini-CRM)
// ============================================

export interface Contact {
  id?: number;
  name: string;
  platform: 'x' | 'linkedin' | 'github' | 'generic';
  profileUrl: string;
  username?: string;
  bio?: string;
  location?: string;
  followers?: string;
  headline?: string;
  firstContactedAt: number;
  lastContactedAt: number;
  totalMessages: number;
  status: 'new' | 'contacted' | 'replied' | 'meeting' | 'converted' | 'archived';
  notes?: string;
  tags?: string[];
}

export interface Touchpoint {
  id?: number;
  contactId: number;
  type: 'generated' | 'copied' | 'sent' | 'follow-up' | 'reply-received';
  angle: string;
  message: string;
  platform: string;
  timestamp: number;
  messageLength?: 'short' | 'medium' | 'long';
  voiceScore?: number;
}

export interface FollowUpSequence {
  id?: number;
  contactId: number;
  originalMessage: string;
  followUps: {
    message: string;
    suggestedDelay: string;
    scheduledFor?: number;
    sentAt?: number;
  }[];
  status: 'active' | 'completed' | 'cancelled';
  createdAt: number;
}

export interface MessageVariant {
  id?: number;
  contactId: number;
  angle: string;
  variant: 'A' | 'B';
  message: string;
  wordCount: number;
  voiceScore: number;
  copied: boolean;
  copiedAt?: number;
  platform: string;
  createdAt: number;
}

// ============================================
// Utility: Profile quality calculator
// ============================================

export function computeProfileQuality(sampleCount: number): VoiceProfileQuality {
  if (sampleCount >= 5) return { score: 95, label: 'Optimal', suggestion: 'Diminishing returns from more samples' };
  if (sampleCount >= 4) return { score: 90, label: 'Excellent' };
  if (sampleCount >= 3) return { score: 75, label: 'Strong' };
  if (sampleCount >= 2) return { score: 50, label: 'Good', suggestion: 'Add more samples for better matching' };
  return { score: 25, label: 'Basic', suggestion: 'Add at least 4 more samples for reliable matching' };
}
