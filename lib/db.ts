import Dexie, { type EntityTable } from 'dexie';

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

interface VoiceProfile {
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

const db = new Dexie('ReplyGuyDB') as Dexie & {
  analysisCache: EntityTable<AnalysisCache, 'pageUrl'>;
  conversations: EntityTable<Conversation, 'id'>;
  voiceProfiles: EntityTable<VoiceProfile, 'id'>;
};

db.version(1).stores({
  analysisCache: 'pageUrl, timestamp',
  conversations: 'id, platform, pageUrl, status, sentAt',
  voiceProfiles: 'id',
});

export { db };
export type { AnalysisCache, Conversation, VoiceProfile };
