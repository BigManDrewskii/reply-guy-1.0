# Data Flow & State Management Architecture

## State Management Strategy

**Primary**: Zustand (global UI state)
**Secondary**: chrome.storage.local (persistent config)
**Tertiary**: chrome.storage.session (ephemeral page data)
**Database**: Dexie.js (IndexedDB - conversations, voice profiles, cache)

---

## Data Sources & Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                         Content Script                           │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────────────┐   │
│  │ detectPlatform│ → │ scrapePage()│ → │ chrome.runtime.send │   │
│  └─────────────┘   └─────────────┘   └─────────────────────┘   │
└─────────────────────────────┬──────────────────────────────────┘
                              │ PAGE_DATA message
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│                      Background Service Worker                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ chrome.storage.session.set({ currentPageData })        │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────┬──────────────────────────────────┘
                              │ storage event
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│                         Side Panel (React)                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ chrome.storage.session.onChanged → setPageData()       │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                  │
│                              ▼                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ usePageData() hook → triggers LLM analysis             │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                  │
│                              ▼                                  │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────────────┐   │
│  │ Dexie Cache │ → │ OpenRouter  │ → │ Zustand Store       │   │
│  │ (24hr TTL)  │   │   (LLM)     │   │  (UI State)         │   │
│  └─────────────┘   └─────────────┘   └─────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

---

## Zustand Store Structure

### `lib/store.ts`

```typescript
interface AppState {
  // UI State
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;

  // Onboarding
  hasApiKey: boolean;
  setHasApiKey: (has: boolean) => void;

  // Page Data
  pageData: ScrapedData | null;
  setPageData: (data: ScrapedData | null) => void;

  // Analysis
  analysis: Analysis | null;
  setAnalysis: (analysis: Analysis | null) => void;
  isAnalyzing: boolean;
  setIsAnalyzing: (is: boolean) => void;

  // Messages
  messages: GeneratedMessage[];
  setMessages: (messages: GeneratedMessage[]) => void;
  activeAngle: OutreachAngle['angle'] | null;
  setActiveAngle: (angle: OutreachAngle['angle'] | null) => void;

  // Toasts
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;

  // Voice Profile
  voiceProfile: VoiceProfile | null;
  setVoiceProfile: (profile: VoiceProfile | null) => void;
}
```

---

## Chrome Storage Layers

### `chrome.storage.local` (Persistent)
```typescript
interface LocalStorage {
  apiKey: string;              // OpenRouter API key
  voiceProfileId: string;      // Reference to Dexie voice profile
  onboardingComplete: boolean; // Skip onboarding screen
}
```

**Usage**:
```typescript
// Save API key
await chrome.storage.local.set({ apiKey: 'sk-or-...' });

// Load on mount
const { apiKey } = await chrome.storage.local.get('apiKey');
```

---

### `chrome.storage.session` (Ephemeral)
```typescript
interface SessionStorage {
  currentPageData: ScrapedData; // Latest scraped page
}
```

**Usage**:
```typescript
// Background writes
chrome.storage.session.set({ currentPageData: scrapedData });

// Side panel listens
chrome.storage.session.onChanged.addListener((changes) => {
  if (changes.currentPageData) {
    store.setPageData(changes.currentPageData.newValue);
  }
});
```

---

## Dexie.js Database

### Schema
```typescript
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
```

### Cache Strategy
```typescript
// Check cache before LLM call
const cached = await db.analysisCache.get(pageUrl);
const isRecent = cached && Date.now() - cached.timestamp.getTime() < 24 * 60 * 60 * 1000;

if (isRecent) {
  return cached.analysis;
}

// Cache LLM results
await db.analysisCache.put({
  pageUrl,
  analysis: result,
  timestamp: new Date(),
});
```

---

## Hook Layer

### `hooks/usePageData.ts`
Subscribes to `chrome.storage.session` changes
```typescript
export function usePageData() {
  const [pageData, setPageData] = useState<ScrapedData | null>(null);

  useEffect(() => {
    const listener = (changes: any) => {
      if (changes.currentPageData) {
        setPageData(changes.currentPageData.newValue);
      }
    };
    chrome.storage.session.onChanged.addListener(listener);

    // Load initial
    chrome.storage.session.get('currentPageData', (result) => {
      if (result.currentPageData) setPageData(result.currentPageData);
    });

    return () => chrome.storage.session.onChanged.removeListener(listener);
  }, []);

  return pageData;
}
```

### `hooks/useAnalysis.ts`
Streams LLM analysis with caching
```typescript
export function useAnalysis(pageData: ScrapedData | null) {
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!pageData) return;

    (async () => {
      setIsLoading(true);

      // Check cache
      const cached = await db.analysisCache.get(pageData.url);
      if (cached && Date.now() - cached.timestamp.getTime() < 24 * 60 * 60 * 1000) {
        setAnalysis(cached.analysis);
        setIsLoading(false);
        return;
      }

      // Stream from LLM
      const result = await streamAnalysis(pageData);
      setAnalysis(result);

      // Cache result
      await db.analysisCache.put({
        pageUrl: pageData.url,
        analysis: result,
        timestamp: new Date(),
      });

      setIsLoading(false);
    })();
  }, [pageData]);

  return { analysis, isLoading };
}
```

### `hooks/useVoiceProfile.ts`
Loads voice profile from Dexie
```typescript
export function useVoiceProfile() {
  const [profile, setProfile] = useState<VoiceProfile | null>(null);

  useEffect(() => {
    (async () => {
      const profiles = await db.voiceProfiles.toArray();
      if (profiles.length > 0) {
        setProfile(profiles[0]); // Single profile for now
      }
    })();
  }, []);

  return profile;
}
```

---

## Message Flow (Copy → Log)

```typescript
// User clicks "Copy Message"
async function handleCopy(message: GeneratedMessage) {
  await navigator.clipboard.writeText(message.content);

  // Show toast
  store.addToast({ message: 'Copied!', type: 'success' });

  // Show post-copy sheet after 2s
  setTimeout(() => {
    setShowPostCopySheet(true);
  }, 2000);
}

// User confirms "Yes, sent"
async function handleConfirmSent(message: GeneratedMessage, pageData: ScrapedData) {
  // Save to Dexie
  await db.conversations.add({
    id: crypto.randomUUID(),
    platform: pageData.platform,
    pageUrl: pageData.url,
    pageName: pageData.name || pageData.h1,
    pageHandle: pageData.handle || '',
    pageSnapshot: pageData,
    sentMessage: message.content,
    angle: message.angle,
    firstContact: new Date(),
    lastContact: new Date(),
    status: 'sent',
  });

  // Update UI
  store.addToast({ message: 'Logged ✓', type: 'success' });
  setShowPostCopySheet(false);
}
```

---

## State Synchronization Rules

1. **Page Data**: One-way (content → background → sidepanel)
2. **API Key**: Read on mount, write on change
3. **Analysis**: Memoized per URL (24hr cache)
4. **Voice Profile**: Single profile, loaded once
5. **Conversations**: Live queries via Dexie

---

## Error Handling Strategy

```typescript
// LLM errors
try {
  const analysis = await streamAnalysis(pageData);
} catch (error) {
  store.addToast({
    message: 'Analysis failed. Check your API key.',
    type: 'error',
  });
  store.setAnalysis(null);
}

// Storage errors (non-critical)
try {
  await db.conversations.add(conversation);
} catch (error) {
  console.error('Failed to log conversation:', error);
  // Don't block UI, just log error
}
```
