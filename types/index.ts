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
  // LinkedIn specific
  headline?: string;
  about?: string;
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
}

export interface GeneratedMessage {
  message: string;
  wordCount: number;
  hook: string;
  voiceScore: number;
}

export interface CachedAnalysis {
  analysis: AnalysisResult;
  timestamp: number;
}
