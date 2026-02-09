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
  skills?: string[];
  connectionDegree?: string;
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

export interface VoiceProfile {
  id: string;
  tone: number;
  openingPatterns: string[];
  closingPatterns: string[];
  personalityMarkers: string[];
  avoidPhrases: string[];
  vocabularySignature: string[];
  exampleMessages: string[];
  lastUpdated: number;
  // Enhanced voice metrics from compromise.js
  avgSentenceLength?: number;
  readabilityScore?: number;
  formalityScore?: number;
  questionFrequency?: number;
  exclamationFrequency?: number;
}

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
