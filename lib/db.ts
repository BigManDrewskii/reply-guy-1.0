// Reply Guy - Dexie.js Database Schema
import Dexie, { type EntityTable } from 'dexie';

// Conversation record (tracked outreach)
export interface Conversation {
  id: string;
  platform: 'x' | 'linkedin';
  profileUrl: string;
  profileName: string;
  profileHandle: string;
  profileSnapshot: ProfileData;
  messages: Message[];
  firstContact: Date;
  lastContact: Date;
  status: 'sent' | 'responded' | 'no_response' | 'converted';
  tags: string[];
}

// Voice profile (user's writing style)
export interface VoiceProfile {
  id: string;
  avgMessageLength: number;
  emojiFrequency: number;
  emojiTypes: string[];
  tone: number; // 0-10
  sentenceStructure: 'simple' | 'complex' | 'mixed';
  openingPatterns: string[];
  closingPatterns: string[];
  personalityMarkers: string[];
  avoidPhrases: string[];
  exampleMessages: string[];
  lastUpdated: Date;
}

// Analysis cache (24hr TTL)
export interface AnalysisCache {
  profileUrl: string;
  analysis: ProfileAnalysis;
  timestamp: Date;
}

// Profile data (from scraper)
export interface ProfileData {
  name: string;
  handle: string;
  bio: string;
  location?: string;
  followers?: number;
  verified: boolean;
  recentPosts?: Post[];
}

// Generated message
export interface Message {
  id: string;
  content: string;
  angle: 'service' | 'partner' | 'community' | 'value_first';
  voiceMatchScore: number;
  timestamp: Date;
  sent: boolean;
}

// Post data
export interface Post {
  text: string;
  likes: number;
  retweets: number;
  timestamp: Date;
}

// Profile analysis (from LLM)
export interface ProfileAnalysis {
  summary: string;
  painPoints: string[];
  outreachAngles: OutreachAngle[];
  confidence: number;
}

export interface OutreachAngle {
  type: 'service' | 'partner' | 'community' | 'value_first';
  reasoning: string;
  hook: string;
}

// Dexie database
class ReplyGuyDB extends Dexie {
  conversations!: EntityTable<Conversation, 'id'>;
  voiceProfiles!: EntityTable<VoiceProfile, 'id'>;
  analysisCache!: EntityTable<AnalysisCache, 'profileUrl'>;

  constructor() {
    super('ReplyGuyDB');

    this.version(1).stores({
      conversations: 'id, platform, profileUrl, status, lastContact, *tags',
      voiceProfiles: 'id, lastUpdated',
      analysisCache: 'profileUrl, timestamp',
    });
  }
}

export const db = new ReplyGuyDB();

// Reactive hooks
export const useConversation = (profileUrl: string) => {
  return db.useLiveQuery(() =>
    db.conversations.where('profileUrl').equals(profileUrl).first()
  )();
};
