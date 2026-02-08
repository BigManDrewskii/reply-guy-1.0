# Reply Guy — PRD v5.0
## AI-Powered Outreach Chrome Sidebar Extension

---

## What This Is

A Chrome Side Panel extension that reads whatever page you're browsing, analyzes the person or company on it, and generates personalized outreach messages in your voice. Works on any website. You copy, you paste, you send.

**Why Side Panel (not DOM injection):** Only 3 of 48+ competitor extensions use Chrome's native Side Panel API. Everyone else injects overlays onto LinkedIn — which breaks every time LinkedIn updates their DOM. The Side Panel persists across navigations, doesn't require host permissions, and feels like a native Chrome feature.

### The Loop

```
Browse ANY page → Click extension icon → Side panel opens →
Content script reads page → LLM analyzes → Generates 4 messages →
You copy → You paste → Log it
```

### Competitive Positioning

| Competitor | Approach | Weakness |
|-----------|----------|----------|
| Humanlinker (4.9★) | DOM overlay on LinkedIn, DISC personality | Requires setup, LinkedIn-only |
| Lavender (4.7★) | Email sidebar with A-F scoring | Email-only, $29-49/mo |
| Crystal Knows (4.1★) | DISC profiling on LinkedIn | Expensive, unreliable for inactive profiles |
| Engage AI (4.6★) | Comment generator on LinkedIn | Features constantly stripped |
| Outboundly | Analyzes any webpage | Small, basic output quality |
| **Reply Guy** | **Side Panel, any website, voice-matched** | **Us — ship it** |

Our edge: works everywhere (not just LinkedIn), uses Side Panel API (reliable), voice training (sounds like you), BYOK via OpenRouter (cheap, private).

---

## Design: 320px Sidebar

Chrome's default Side Panel width is **~320px** (user can resize, but design for this). All content stacks vertically. No side-by-side columns ever.

### Three-Zone Layout (Sider Pattern)

Research shows the most successful sidebar extensions (Sider AI — 6M+ weekly users) use a three-zone architecture:

```
┌─────────────────────────┐
│ ⚡ Reply Guy    [🌐 site]│ ← HEADER: 44px, sticky
├─────────────────────────┤
│                         │
│    OPERATION ZONE       │ ← Scrollable content area
│    (profile + analysis  │    Everything happens here
│     + messages)         │
│                         │
├─────────────────────────┤
│ 💬 Outreach  📋  ⚙     │ ← NAVIGATION: 48px, sticky bottom
└─────────────────────────┘    3 tabs: Outreach / History / Settings
```

### Visual Language

Dark mode only. Inspired by Vercel's design system.

```css
/* Core Palette */
--bg-base: #000;           /* App background */
--bg-card: #111;           /* Cards, inputs */
--bg-hover: #1a1a1a;       /* Hover states */
--border: #262626;         /* All borders — 1px solid only */
--text-1: #ededed;         /* Primary text */
--text-2: #a1a1a1;         /* Secondary text */
--text-3: #666;            /* Tertiary text */
--accent: #0070f3;         /* Links, active states — sparingly */
--success: #00c853;        /* Confidence bars, success states */
--danger: #ee0000;         /* Errors, warnings */

/* Typography */
--font-sans: 'Geist', system-ui, sans-serif;
--font-mono: 'Geist Mono', monospace;
/* Sizes: 11px labels, 13px body, 14px section headers, 16px panel title */
/* Geist Mono for ALL data: scores, counts, timestamps */

/* Rules */
/* No shadows. No gradients. No glows. */
/* 1px #262626 borders only */
/* 8px border-radius on interactive elements */
/* 150ms ease transitions */
/* Skeleton shimmer for loading (never spinners) */
/* Inverted CTA: white bg (#ededed), black text */
```

### Fonts

Bundle Geist Sans + Geist Mono as WOFF2 in `assets/fonts/`. Never CDN.

---

## Screens

### 1. Onboarding (No API Key)

```
┌─────────────────────────┐
│                         │
│      [🔑 icon, xl]      │
│                         │
│   Set up your API key   │ ← 16px semibold
│                         │
│   Reply Guy uses         │ ← 13px, --text-2
│   OpenRouter to analyze  │
│   pages and generate     │
│   outreach messages.     │
│                         │
│ ┌─────────────────────┐ │
│ │ sk-or-...           │ │ ← Input, --bg-card
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │   Get Started →     │ │ ← Inverted CTA (white bg, black text)
│ └─────────────────────┘ │
│                         │
│ Get a key at            │
│ openrouter.ai ↗        │ ← 11px link
└─────────────────────────┘
```

Validates key with test API call before proceeding.

### 2. Idle (Panel Open, No Useful Page)

```
│      [🎯 icon, xl]      │
│                         │
│   Navigate to any page  │
│                         │
│   Browse a profile,     │
│   portfolio, or company │
│   page — Reply Guy will │
│   read it and help you  │
│   craft a message.      │
│                         │
│   Enhanced on:          │
│   [𝕏] [in] [GH]       │ ← Platform badges
│   Works on any site.    │
```

### 3. Loading (Analyzing Page)

Progressive reveal — never hold back content:

```
│ ┌─────────────────────┐ │
│ │ ░░ ░░░░░░░░░░░      │ │ ← Profile skeleton
│ │    ░░░░░░░░░        │ │
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │ Reading page...      │ │ ← Analysis streaming
│ │ ░░░░░░░░░░░░░░░░░░  │ │
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │ ░░░░░░░░░░░░░░░░░░  │ │ ← Message skeletons
│ └─────────────────────┘ │
```

Profile card fills first (~200ms) → Analysis streams (1-3s) → Messages appear one by one (2-5s).

### 4. Ready (Messages Generated)

This is the core screen. Most time spent here.

```
│ ┌─────────────────────┐ │
│ │ [img] Sarah Chen  ✓ │ │ ← Profile card
│ │  36px  @sarahchen    │ │    Name (bold), handle
│ │  Design Lead · Figma │ │    Role + company (--text-2)
│ │  SF · 14.2K          │ │    Location + followers (mono)
│ └─────────────────────┘ │
│                         │
│ ┌─────────────────────┐ │
│ │ Score ██████░░  72%  │ │ ← Confidence bar (4px height)
│ │ Good match — active  │ │    Color: green>60, yellow>30, red<30
│ └─────────────────────┘ │
│                         │
│ [Service][Partner]      │ ← Angle tabs (horizontal scroll)
│ [Community][Value]      │    Active = bottom accent border
│ ─────────────────────── │
│                         │
│ ┌─────────────────────┐ │
│ │ Hey Sarah — saw your│ │ ← Message card (--bg-card)
│ │ thread on multi-    │ │    13px, --text-1
│ │ brand token systems.│ │
│ │ We've been solving   │ │
│ │ the same problem... │ │
│ │ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ │ │
│ │ Voice: 94% · 38w    │ │ ← Mono, --text-3
│ │ ┌─────────────────┐ │ │
│ │ │  📋 Copy Message │ │ │ ← Inverted CTA, full width
│ │ └─────────────────┘ │ │    → "✓ Copied" for 2s
│ │ Hook: Posted about   │ │ ← Why this works (11px, --text-3)
│ │ design tokens 2d ago │ │
│ └─────────────────────┘ │
│                         │
│ [↻ Regenerate] [✎ Edit]│ ← Ghost buttons
```

### 5. Generic Page (Not a Profile)

When scraping a random website (no structured profile data):

```
│ ┌─────────────────────┐ │
│ │ 🌐 acme.co           │ │ ← Globe icon + hostname
│ │ "Acme — Next-Gen..."│ │    Page title or OG title
│ │ Social: x.com/acme ↗│ │    Detected social links
│ └─────────────────────┘ │
│                         │
│ ┌─────────────────────┐ │
│ │ Score ███░░░░░  38%  │ │ ← Lower score (less data)
│ │ Limited context      │ │
│ └─────────────────────┘ │
│                         │
│ [Messages still generate]│ ← LLM works with what it has
```

The LLM prompt explicitly handles sparse context: "Work with whatever you have. Never refuse. If context is thin, focus the outreach on what IS visible."

### 6. Post-Copy Flow

After clicking Copy → button shows "✓ Copied" (green) for 2s → bottom sheet slides up:

```
│ Did you send this?      │
│ ┌──────────┐ ┌────────┐ │
│ │ ✓ Sent   │ │ ✕ Nah  │ │
│ └──────────┘ └────────┘ │
```

Yes → saves to IndexedDB (Dexie) → "Logged ✓" toast.
Not yet / tap outside / 15s timeout → dismiss without saving.

### 7. History Screen

```
│ ┌─────────────────────┐ │
│ │ 🔍 Search...         │ │
│ └─────────────────────┘ │
│ [All] [𝕏] [in] [🌐]    │ ← Filter chips
│                         │
│ Today                   │ ← Date groups
│ ┌─────────────────────┐ │
│ │ [av] Sarah    𝕏  3m │ │ ← Row: avatar, name, platform, time
│ │ "Hey Sarah—saw..."  │ │    Message preview (truncated)
│ │ ● Sent               │ │    Status dot
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │ [🌐] acme.co  🌐 1h │ │ ← Generic: globe as avatar
│ │ "Loved the brand..." │ │
│ │ ✓ Responded          │ │
│ └─────────────────────┘ │
│                         │
│ Empty state:            │
│ [📋 icon xl]            │
│ "No conversations yet"  │
```

Tap row → expands inline with full message + details. Swipe/hover → delete.

### 8. Settings Screen

```
│ API Key                 │
│ ┌─────────────────────┐ │
│ │ sk-or-••••••7f3a 👁 │ │ ← Masked, eye toggle
│ └─────────────────────┘ │
│ Connected ✓             │
│ ─────────────────────── │
│ Voice Training          │
│ ┌─────────────────────┐ │
│ │ 🎤 Train Your Voice →│ │ ← Opens 3-step wizard
│ │ 12 examples · 94%   │ │    Or "No examples yet"
│ └─────────────────────┘ │
│ ─────────────────────── │
│ Data                    │
│ Clear cache             │
│ Delete conversations    │
│ Reset everything        │ ← Confirm dialog
│ ─────────────────────── │
│ v0.1.0 · Studio Drewskii│
```

### 9. Voice Training Wizard (3 Steps)

**Step 1:** Paste 10-20 example DMs (textarea, separate with `---`). Live counter: "12 messages detected" (mono). CTA: "Analyze My Voice →" (disabled until 5+).

**Step 2:** LLM extracts voice traits. Each trait fades in as it streams: tone, opening patterns, personality markers, vocabulary, avoidances.

**Step 3:** Review fingerprint. Edit any trait. "Save Voice Profile" CTA.

---

## Technical Architecture

### Stack (Locked)

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | **WXT** (from `evanlong-me/sidepanel-extension-template` as reference) | 171★, proven WXT+React+Tailwind+shadcn side panel setup |
| UI | **React 19 + TypeScript 5** | Standard |
| Styling | **Tailwind CSS v4** + custom tokens | Utility-first, design system via CSS vars |
| Components | **shadcn/ui** (dark theme, customized) | Battle-tested, accessible, tree-shakeable |
| Icons | **Lucide React** via centralized `lib/icons.ts` | Consistent, small bundle |
| Fonts | **Geist Sans + Mono** (bundled WOFF2) | Vercel aesthetic, no CDN dependency |
| Database | **Dexie.js 4.x** + `useLiveQuery()` | IndexedDB wrapper, reactive queries |
| LLM | **OpenRouter SDK** (`@openrouter/sdk`) | Multi-model, BYOK, streaming, `data_collection: 'deny'` |
| State | **Zustand 5.x** + `chrome.storage.local` persist | Lightweight, persists across sessions |
| Manifest | **V3** (auto-generated by WXT) | Required for Chrome Web Store |

### WXT Side Panel Setup (Critical — Must Be Exact)

**`wxt.config.ts`:**

```typescript
import { defineConfig } from 'wxt';

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'Reply Guy',
    description: 'AI-powered outreach for any page',
    version: '0.1.0',
    action: {},  // REQUIRED: empty action enables openPanelOnActionClick
    permissions: [
      'activeTab',
      'storage',
    ],
  },
});
```

**Critical WXT gotchas (from research):**
1. WXT auto-adds `sidePanel` permission when it detects `entrypoints/sidepanel/`. Do NOT add it manually.
2. `manifest.action` must be `{}` (empty). This enables `openPanelOnActionClick`.
3. You CANNOT have both a popup AND sidepanel on icon click. No popup entrypoint.
4. TypeScript types for `browser.sidePanel` don't exist in WXT. Use `chrome.sidePanel` directly.
5. Background entrypoint must be `entrypoints/background.ts` or `entrypoints/background/index.ts`. NOT nested deeper.

**`entrypoints/background.ts`:**

```typescript
export default defineBackground(() => {
  // Open side panel when extension icon is clicked
  chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch(console.error);

  // Relay page data from content script → side panel via chrome.storage.session
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'PAGE_DATA') {
      chrome.storage.session.set({ currentPageData: message.data });
    }
    return true;
  });

  // Re-scrape when tab completes loading
  chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
    if (changeInfo.status === 'complete') {
      chrome.tabs.sendMessage(tabId, { type: 'SCRAPE_PAGE' }).catch(() => {});
    }
  });

  // Re-scrape when user switches tabs
  chrome.tabs.onActivated.addListener((activeInfo) => {
    chrome.tabs.sendMessage(activeInfo.tabId, { type: 'SCRAPE_PAGE' }).catch(() => {});
  });
});
```

**`entrypoints/content.ts`:**

```typescript
export default defineContentScript({
  matches: ['<all_urls>'],
  runAt: 'document_idle',

  main() {
    scrapeAndSend();

    // Background asks us to re-scrape (tab change, navigation)
    chrome.runtime.onMessage.addListener((message) => {
      if (message.type === 'SCRAPE_PAGE') scrapeAndSend();
    });

    // SPA navigation detection
    let lastUrl = location.href;
    new MutationObserver(() => {
      if (location.href !== lastUrl) {
        lastUrl = location.href;
        setTimeout(scrapeAndSend, 500);
      }
    }).observe(document.body, { childList: true, subtree: true });
  },
});

function scrapeAndSend() {
  const data = scrapePage();
  chrome.runtime.sendMessage({ type: 'PAGE_DATA', data }).catch(() => {});
}

function scrapePage() {
  const url = location.href;
  const hostname = location.hostname;
  const platform = detectPlatform(hostname);

  const base = {
    url, hostname, platform,
    title: document.title,
    metaDescription: getMeta('description'),
    ogTitle: getMeta('og:title'),
    ogDescription: getMeta('og:description'),
    ogImage: getMeta('og:image'),
    scrapedAt: new Date().toISOString(),
  };

  if (platform === 'x') return { ...base, ...scrapeX() };
  if (platform === 'linkedin') return { ...base, ...scrapeLinkedIn() };
  if (platform === 'github') return { ...base, ...scrapeGitHub() };
  return { ...base, ...scrapeGeneric() };
}

function detectPlatform(h: string) {
  if (h.includes('x.com') || h.includes('twitter.com')) return 'x';
  if (h.includes('linkedin.com')) return 'linkedin';
  if (h.includes('github.com')) return 'github';
  return 'generic';
}

function getMeta(name: string) {
  return (
    document.querySelector(`meta[name="${name}"]`) ||
    document.querySelector(`meta[property="${name}"]`)
  )?.getAttribute('content') || '';
}

function scrapeX() {
  try {
    return {
      name: document.querySelector('[data-testid="UserName"] span')?.textContent || '',
      bio: document.querySelector('[data-testid="UserDescription"]')?.textContent || '',
      location: document.querySelector('[data-testid="UserLocation"]')?.textContent || '',
      followers: document.querySelector('[href$="/followers"] span')?.textContent || '',
      recentPosts: Array.from(document.querySelectorAll('[data-testid="tweetText"]'))
        .slice(0, 6).map(el => el.textContent || ''),
      isProfile: true,
    };
  } catch { return {}; }
}

function scrapeLinkedIn() {
  try {
    return {
      name: document.querySelector('.text-heading-xlarge')?.textContent?.trim() || '',
      headline: document.querySelector('.text-body-medium.break-words')?.textContent?.trim() || '',
      about: document.querySelector('#about ~ div .visually-hidden + span')?.textContent?.trim() || '',
      isProfile: !!document.querySelector('.text-heading-xlarge'),
    };
  } catch { return {}; }
}

function scrapeGitHub() {
  try {
    return {
      name: document.querySelector('.p-name')?.textContent?.trim() || '',
      bio: document.querySelector('.p-note .js-user-profile-bio')?.textContent?.trim() || '',
      company: document.querySelector('[itemprop="worksFor"]')?.textContent?.trim() || '',
      isProfile: !!document.querySelector('.p-name'),
    };
  } catch { return {}; }
}

function scrapeGeneric() {
  const bodyText = document.body.innerText.substring(0, 2000);
  const h1 = document.querySelector('h1')?.textContent?.trim() || '';
  const socialLinks = Array.from(document.querySelectorAll('a[href]'))
    .map(a => a.getAttribute('href') || '')
    .filter(href =>
      /x\.com|twitter\.com|linkedin\.com|github\.com/.test(href)
    ).slice(0, 5);
  const emailMatch = bodyText.match(/[\w.-]+@[\w.-]+\.\w+/);

  return { h1, bodyText, socialLinks, email: emailMatch?.[0] || '' };
}
```

**`entrypoints/sidepanel/index.html`:**

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reply Guy</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="./main.tsx"></script>
</body>
</html>
```

**`entrypoints/sidepanel/main.tsx`:**

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import '@/styles/globals.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode><App /></React.StrictMode>
);
```

**`entrypoints/sidepanel/App.tsx`:**

```tsx
import { useEffect, useState } from 'react';

type Screen = 'outreach' | 'history' | 'settings';

export default function App() {
  const [screen, setScreen] = useState<Screen>('outreach');
  const [pageData, setPageData] = useState<any>(null);

  useEffect(() => {
    // Subscribe to page data from content script (via background → storage.session)
    const listener = (changes: Record<string, chrome.storage.StorageChange>) => {
      if (changes.currentPageData) {
        setPageData(changes.currentPageData.newValue);
      }
    };
    chrome.storage.session.onChanged.addListener(listener);

    // Load existing data on mount
    chrome.storage.session.get('currentPageData', (result) => {
      if (result.currentPageData) setPageData(result.currentPageData);
    });

    return () => chrome.storage.session.onChanged.removeListener(listener);
  }, []);

  return (
    <div className="h-screen flex flex-col bg-black text-[#ededed]">
      <header className="h-11 flex items-center px-4 border-b border-[#262626] bg-[#0a0a0a] shrink-0">
        <span className="text-sm font-semibold">⚡ Reply Guy</span>
      </header>

      <main className="flex-1 overflow-y-auto p-4">
        {/* Route based on screen + state */}
      </main>

      <nav className="h-12 flex items-center justify-around border-t border-[#262626] bg-[#0a0a0a] shrink-0">
        {(['outreach', 'history', 'settings'] as Screen[]).map((s) => (
          <button
            key={s}
            onClick={() => setScreen(s)}
            className={`text-xs capitalize ${screen === s ? 'text-[#ededed]' : 'text-[#666]'}`}
          >
            {s}
          </button>
        ))}
      </nav>
    </div>
  );
}
```

### Data Flow

```
Content Script (runs on <all_urls>)
    │ detectPlatform() → scrape tier 1/2/3
    │ chrome.runtime.sendMessage({ type: 'PAGE_DATA', data })
    ▼
Background Service Worker
    │ chrome.storage.session.set({ currentPageData: data })
    ▼
Side Panel React App
    │ chrome.storage.session.onChanged → setPageData()
    │ Check Dexie analysisCache (24hr TTL)
    │ if miss → stream LLM analysis via OpenRouter
    ▼
UI: Profile/Page card → Analysis → Messages
```

**Why `chrome.storage.session`:** Simpler than port connections, survives panel close/reopen, no race conditions on startup.

### Scraping Tiers

| Tier | Sites | Method | Data Quality |
|------|-------|--------|-------------|
| 1 — Enhanced | X, LinkedIn | `data-testid` / class selectors | Rich — name, bio, posts, followers |
| 2 — Known | GitHub, Dribbble, Behance | Platform-specific selectors | Good — name, bio, work |
| 3 — Generic | Everything else | Meta/OG tags + h1 + body text + social links | Usable — LLM fills gaps |

---

## Database (Dexie.js)

```typescript
import Dexie, { type EntityTable } from 'dexie';

interface Conversation {
  id: string;
  platform: string;
  pageUrl: string;
  pageName: string;
  sentMessage: string;
  angle: string;
  sentAt: Date;
  status: 'sent' | 'responded' | 'no_response';
}

interface VoiceProfile {
  id: string;
  tone: number;                  // 0-10
  openingPatterns: string[];
  closingPatterns: string[];
  personalityMarkers: string[];
  avoidPhrases: string[];
  vocabularySignature: string[];
  exampleMessages: string[];
  lastUpdated: Date;
}

interface AnalysisCache {
  pageUrl: string;
  analysis: any;
  timestamp: Date;
}

const db = new Dexie('ReplyGuyDB') as Dexie & {
  conversations: EntityTable<Conversation, 'id'>;
  voiceProfiles: EntityTable<VoiceProfile, 'id'>;
  analysisCache: EntityTable<AnalysisCache, 'pageUrl'>;
};

db.version(1).stores({
  conversations: 'id, platform, pageUrl, status, sentAt',
  voiceProfiles: 'id',
  analysisCache: 'pageUrl, timestamp',
});

export { db };
export type { Conversation, VoiceProfile, AnalysisCache };
```

---

## LLM Strategy

**Model:** Claude Sonnet 4.5 via OpenRouter.
**Cost:** ~$0.020 per page (analysis + 4 messages).
**Fallback chain:** claude-sonnet-4.5 → gpt-4o → llama-3.3-70b-instruct.
**Always:** `data_collection: 'deny'`, streaming on.

### Prompts (all in `lib/prompts.ts`)

**Analysis prompt** — adapts to available data:

```
You analyze webpages to help craft personalized outreach messages.

PAGE DATA:
{pageData}

Return JSON:
{
  "personName": "best guess — person name or page/company name",
  "summary": "2-3 sentences about who this is and what they do",
  "interests": ["3-5 topics based on available evidence"],
  "outreachAngles": [
    { "angle": "service", "hook": "specific reason", "relevance": "why now" },
    { "angle": "partner", "hook": "...", "relevance": "..." },
    { "angle": "community", "hook": "...", "relevance": "..." },
    { "angle": "value", "hook": "...", "relevance": "..." }
  ],
  "confidence": 0-100,
  "confidenceReason": "based on data quality"
}

If data is sparse, confidence should be lower but ALWAYS provide angles.
Work with whatever context you have. Never refuse.
```

**Message generation prompt** includes voice profile (if trained) + selected angle + analysis. Outputs: `{ message, wordCount, hook, voiceScore }`.

**Voice extraction prompt** takes 10-20 example messages and extracts: tone, opening patterns, closing patterns, personality markers, avoid phrases, vocabulary signature.

---

## File Structure

```
reply-guy/
├── assets/fonts/
│   ├── GeistVF.woff2
│   └── GeistMonoVF.woff2
├── entrypoints/
│   ├── background.ts
│   ├── content.ts
│   └── sidepanel/
│       ├── index.html
│       ├── main.tsx
│       └── App.tsx
├── components/
│   ├── screens/
│   │   ├── OnboardingScreen.tsx
│   │   ├── IdleScreen.tsx
│   │   ├── OutreachScreen.tsx
│   │   ├── HistoryScreen.tsx
│   │   ├── SettingsScreen.tsx
│   │   └── VoiceTrainingScreen.tsx
│   ├── profile/
│   │   ├── ProfileCard.tsx
│   │   ├── PageCard.tsx
│   │   └── ConfidenceBar.tsx
│   ├── messages/
│   │   ├── AngleTabs.tsx
│   │   ├── MessageCard.tsx
│   │   ├── CopyButton.tsx
│   │   └── PostCopySheet.tsx
│   ├── history/
│   │   ├── ConversationRow.tsx
│   │   └── FilterChips.tsx
│   ├── settings/
│   │   ├── ApiKeyInput.tsx
│   │   └── VoiceProfileCard.tsx
│   └── ui/                    ← shadcn/ui components (dark themed)
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       ├── badge.tsx
│       ├── skeleton.tsx
│       ├── tabs.tsx
│       └── sheet.tsx
├── lib/
│   ├── icons.ts               ← Centralized Lucide re-exports
│   ├── db.ts                  ← Dexie schema (code above)
│   ├── openrouter.ts          ← Streaming client
│   ├── prompts.ts             ← All LLM prompts
│   ├── store.ts               ← Zustand stores
│   └── utils.ts               ← cn(), helpers
├── hooks/
│   ├── use-page-data.ts       ← Subscribe to storage.session
│   ├── use-analysis.ts        ← Streaming analysis
│   ├── use-conversation.ts    ← Dexie live query
│   └── use-voice-profile.ts
├── types/
│   └── index.ts
├── styles/
│   └── globals.css            ← @font-face, CSS vars, Tailwind
├── wxt.config.ts              ← EXACT config above
├── tsconfig.json
└── package.json
```

---

## Implementation Phases

### Phase 1: Extension Loads (Day 1)
The extension installs in Chrome and the side panel opens on icon click. App shell renders: header, empty content, bottom nav with 3 tabs. Dark theme. Fonts working. This is the gate — nothing else matters until this works.

### Phase 2: Page Scraping (Days 2-3)
Content script runs on all URLs. Scrapes and sends PAGE_DATA. Side panel receives data via storage.session. ProfileCard renders for X/LinkedIn/GitHub. PageCard renders for generic sites. Loading skeletons.

### Phase 3: Onboarding + Settings (Day 3)
API key input with validation. Zustand store persisted to chrome.storage.local. Settings screen. OnboardingScreen gates the app.

### Phase 4: LLM Analysis (Days 4-5)
OpenRouter streaming connected. Analysis prompt runs on page data. ConfidenceBar renders. 24hr Dexie cache. Error states.

### Phase 5: Message Generation (Days 5-7)
4 angle tabs. Messages stream in real-time. MessageCard with CopyButton (clipboard API). PostCopySheet for logging. ActionBar (regenerate, edit).

### Phase 6: Voice Training (Days 8-9)
3-step wizard. LLM extraction of voice traits. Voice scoring on generated messages. VoiceProfile stored in Dexie.

### Phase 7: History + Polish (Days 10-12)
History screen with search, filter chips, date groups. Conversation logging. Duplicate contact warning. Error handling. Test on 50+ pages across platforms.

---

## Privacy

1. All scraping happens locally in the browser.
2. API calls to OpenRouter only — with `data_collection: 'deny'`.
3. No telemetry, tracking, or analytics.
4. No auto-sending — always manual copy/paste.
5. User controls all data via Settings.

---

## Reference Links

- [WXT Framework](https://wxt.dev)
- [WXT Side Panel Entrypoint](https://wxt.dev/guide/essentials/entrypoints.html)
- [evanlong-me/sidepanel-extension-template](https://github.com/evanlong-me/sidepanel-extension-template) (171★, reference implementation)
- [Chrome Side Panel API](https://developer.chrome.com/docs/extensions/reference/api/sidePanel)
- [WXT Discussion #1002](https://github.com/wxt-dev/wxt/discussions/1002) (side panel setup gotchas)
- [Dexie.js](https://dexie.org)
- [OpenRouter SDK](https://github.com/openrouter-ai/sdk)
- [Geist Font](https://vercel.com/font)
- [Lucide React](https://lucide.dev)
