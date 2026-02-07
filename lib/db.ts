// Reply Guy - Dexie.js Database Schema
import Dexie, { type EntityTable } from 'dexie';

// Usage metrics (analytics tracking)
export interface UsageMetrics {
  id: string; // Date in YYYY-MM-DD format
  date: string; // ISO date string
  messagesGenerated: number;
  messagesSent: number;
  conversions: number;
  platformBreakdown: {
    x: { generated: number; sent: number; converted: number };
    linkedin: { generated: number; sent: number; converted: number };
  };
  lastUpdated: Date;
}

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
  usageMetrics!: EntityTable<UsageMetrics, 'id'>;

  constructor() {
    super('ReplyGuyDB');

    this.version(2).stores({
      conversations: 'id, platform, profileUrl, status, lastContact, *tags',
      voiceProfiles: 'id, lastUpdated',
      analysisCache: 'profileUrl, timestamp',
      usageMetrics: 'id, date, lastUpdated',
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

// Usage metrics helper functions
export const getTodayMetrics = async (): Promise<UsageMetrics> => {
  const today = new Date().toISOString().split('T')[0];
  let metrics = await db.usageMetrics.get(today);

  if (!metrics) {
    metrics = {
      id: today,
      date: today,
      messagesGenerated: 0,
      messagesSent: 0,
      conversions: 0,
      platformBreakdown: {
        x: { generated: 0, sent: 0, converted: 0 },
        linkedin: { generated: 0, sent: 0, converted: 0 }
      },
      lastUpdated: new Date()
    };
    await db.usageMetrics.add(metrics);
  }

  return metrics;
};

export const trackMessageGenerated = async (platform: 'x' | 'linkedin') => {
  const metrics = await getTodayMetrics();
  metrics.messagesGenerated++;
  metrics.platformBreakdown[platform].generated++;
  metrics.lastUpdated = new Date();
  await db.usageMetrics.put(metrics);
};

export const trackMessageSent = async (platform: 'x' | 'linkedin') => {
  const metrics = await getTodayMetrics();
  metrics.messagesSent++;
  metrics.platformBreakdown[platform].sent++;
  metrics.lastUpdated = new Date();
  await db.usageMetrics.put(metrics);
};

export const trackConversion = async (platform: 'x' | 'linkedin') => {
  const metrics = await getTodayMetrics();
  metrics.conversions++;
  metrics.platformBreakdown[platform].converted++;
  metrics.lastUpdated = new Date();
  await db.usageMetrics.put(metrics);
};

export const getTotalMetrics = async (days: number = 30) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const metrics = await db.usageMetrics
    .where('date')
    .aboveOrEqual(startDate.toISOString().split('T')[0])
    .toArray();

  return {
    totalMessagesGenerated: metrics.reduce((sum, m) => sum + m.messagesGenerated, 0),
    totalMessagesSent: metrics.reduce((sum, m) => sum + m.messagesSent, 0),
    totalConversions: metrics.reduce((sum, m) => sum + m.conversions, 0),
    conversionRate: metrics.reduce((sum, m) => sum + m.messagesSent, 0) > 0
      ? (metrics.reduce((sum, m) => sum + m.conversions, 0) / metrics.reduce((sum, m) => sum + m.messagesSent, 0)) * 100
      : 0,
    platformBreakdown: {
      x: {
        generated: metrics.reduce((sum, m) => sum + m.platformBreakdown.x.generated, 0),
        sent: metrics.reduce((sum, m) => sum + m.platformBreakdown.x.sent, 0),
        converted: metrics.reduce((sum, m) => sum + m.platformBreakdown.x.converted, 0)
      },
      linkedin: {
        generated: metrics.reduce((sum, m) => sum + m.platformBreakdown.linkedin.generated, 0),
        sent: metrics.reduce((sum, m) => sum + m.platformBreakdown.linkedin.sent, 0),
        converted: metrics.reduce((sum, m) => sum + m.platformBreakdown.linkedin.converted, 0)
      }
    }
  };
};
