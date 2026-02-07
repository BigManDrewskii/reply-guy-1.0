import Dexie, { type EntityTable } from 'dexie';
import type { Conversation, VoiceProfile, AnalysisCache } from '../types';

const db = new Dexie('ReplyGuyDB') as Dexie & {
  conversations: EntityTable<Conversation, 'id'>;
  voiceProfiles: EntityTable<VoiceProfile, 'id'>;
  analysisCache: EntityTable<AnalysisCache, 'pageUrl'>;
};

db.version(1).stores({
  conversations: 'id, platform, pageUrl, status, lastContact',
  voiceProfiles: 'id',
  analysisCache: 'pageUrl, timestamp',
});

export { db };
