// Page Data Types
export interface PageData {
  url: string;
  hostname: string;
  platform: Platform;
  title: string;
  metaDescription: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  author: string;
  scrapedAt: string;
}

export interface XProfileData {
  name: string;
  handle: string;
  bio: string;
  location: string;
  website: string;
  followers: string;
  following: string;
  verified: boolean;
  recentPosts: string[];
  isProfile: true;
}

export interface LinkedInProfileData {
  name: string;
  headline: string;
  location: string;
  about: string;
  company: string;
  connections: string;
  isProfile: true;
}

export interface GitHubProfileData {
  name: string;
  handle: string;
  bio: string;
  location: string;
  company: string;
  website: string;
  repos: string;
  followers: string;
  isProfile: true;
}

export interface GenericPageData {
  h1: string;
  h2: string;
  bodyText: string;
  socialLinks: string[];
  email: string;
  isProfile: false;
}

export type ScrapedData = PageData & (XProfileData | LinkedInProfileData | GitHubProfileData | GenericPageData);

export type Platform = 'x' | 'linkedin' | 'github' | 'dribbble' | 'behance' | 'generic';

// LLM Types
export interface Analysis {
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

export interface GeneratedMessage {
  angle: OutreachAngle['angle'];
  content: string;
  voiceScore: number;
  wordCount: number;
  hook: string;
}

// Voice Profile Types
export interface VoiceProfile {
  id: string;
  avgMessageLength: number;
  emojiFrequency: number;
  emojiTypes: string[];
  tone: number;
  openingPatterns: string[];
  closingPatterns: string[];
  personalityMarkers: string[];
  avoidPhrases: string[];
  vocabularySignature: string[];
  exampleMessages: string[];
  lastUpdated: Date;
}

// Conversation Types
export interface Conversation {
  id: string;
  platform: Platform;
  pageUrl: string;
  pageName: string;
  pageHandle: string;
  pageSnapshot: ScrapedData;
  sentMessage: string;
  angle: string;
  firstContact: Date;
  lastContact: Date;
  status: ConversationStatus;
}

export type ConversationStatus = 'sent' | 'responded' | 'no_response' | 'converted';

// UI Types
export type Tab = 'outreach' | 'history' | 'settings';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
}
