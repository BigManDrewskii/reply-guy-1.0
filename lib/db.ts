import Dexie, { type EntityTable } from 'dexie';
import type { VoiceProfile } from '@/types';

interface AnalysisCache {
  pageUrl: string;
  analysis: {
    personName: string;
    summary: string;
    interests: string[];
    outreachAngles: Array<{
      angle: string;
      hook: string;
      relevance: string;
    }>;
    confidence: number;
    confidenceReason: string;
  };
  timestamp: number;
}

interface Conversation {
  id: string;
  platform: string;
  pageUrl: string;
  pageName: string;
  sentMessage: string;
  angle: string;
  sentAt: number;
  status: 'sent' | 'responded' | 'no_response';
}

// ============================================
// Contact Relationship Manager (Mini-CRM)
// ============================================

interface Contact {
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

interface Touchpoint {
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

interface MessageVariant {
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

const db = new Dexie('ReplyGuyDB') as Dexie & {
  analysisCache: EntityTable<AnalysisCache, 'pageUrl'>;
  conversations: EntityTable<Conversation, 'id'>;
  voiceProfiles: EntityTable<VoiceProfile, 'id'>;
  contacts: EntityTable<Contact, 'id'>;
  touchpoints: EntityTable<Touchpoint, 'id'>;
  messageVariants: EntityTable<MessageVariant, 'id'>;
};

// Version 1: Original schema
db.version(1).stores({
  analysisCache: 'pageUrl, timestamp',
  conversations: 'id, platform, pageUrl, status, sentAt',
  voiceProfiles: 'id',
});

// Version 2: Add CRM tables
db.version(2).stores({
  analysisCache: 'pageUrl, timestamp',
  conversations: 'id, platform, pageUrl, status, sentAt',
  voiceProfiles: 'id',
  contacts: '++id, name, platform, profileUrl, status, lastContactedAt, &profileUrl',
  touchpoints: '++id, contactId, type, platform, timestamp',
  messageVariants: '++id, contactId, angle, variant, platform, createdAt',
});

// Version 3: Structured voice profiles with register dimensions, exemplars, and metrics
// The voiceProfiles table schema key stays the same ('id'), but the data shape changes.
// Dexie handles this gracefully — existing records will be overwritten on next training.
db.version(3).stores({
  analysisCache: 'pageUrl, timestamp',
  conversations: 'id, platform, pageUrl, status, sentAt',
  voiceProfiles: 'id, updatedAt',
  contacts: '++id, name, platform, profileUrl, status, lastContactedAt, &profileUrl',
  touchpoints: '++id, contactId, type, platform, timestamp',
  messageVariants: '++id, contactId, angle, variant, platform, createdAt',
});

export { db };
export type { AnalysisCache, Conversation, Contact, Touchpoint, MessageVariant };
