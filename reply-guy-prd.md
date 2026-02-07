# Reply Guy — Refined PRD v2.0
## AI-Powered Cold Outreach Chrome Extension

**Version:** 2.0  
**Last Updated:** February 7, 2026  
**Author:** Studio Drewskii  
**Status:** Research Complete → Ready to Build

---

## What Changed From v1

This document is a research-backed refinement of the original Reply Guy PRD. Here's what changed and why:

| Area | v1 Decision | v2 Decision | Why |
|------|-------------|-------------|-----|
| **Extension Framework** | Jonghakseo boilerplate (5.3K ⭐) | **WXT Framework** (9K+ ⭐) | Superior HMR, auto-imports, built-in storage utils, active maintenance, better tree-shaking (5MB → 500KB reported), first-class side panel support |
| **UI Components** | shadcn/ui + Tailwind (generic) | **shadcn/ui + Tailwind + Vercel Theme + Geist Font** | Vercel-grade dark aesthetic per design requirement — pure black/white, high contrast, surgical minimalism |
| **LLM SDK** | OpenAI SDK (compatibility mode) | **@openrouter/sdk (official)** | Official OpenRouter TypeScript SDK launched — native streaming, typed responses, ESM-first, no compatibility shim needed |
| **Voice Training** | TensorFlow.js + embeddings | **LLM-only voice analysis** (drop TF.js) | TF.js adds ~2MB to extension, browser embeddings are fragile. LLM can extract voice fingerprints from examples equally well with zero overhead |
| **IndexedDB Wrapper** | `idb` (6.7K ⭐) | **Dexie.js** (11.6K ⭐) | Richer query API, built-in live queries for reactive UI, better TypeScript support, observable pattern fits React well |
| **LinkedIn Scraper Ref** | Yale3 (outdated selectors) | **Yale3 + selector resilience pattern** | LinkedIn DOM changes frequently — added accessibility tree fallback + vision model fallback as primary strategy |
| **Boilerplate Starter** | WXT from scratch | **imtiger/wxt-react-shadcn-tailwindcss** | Pre-wired WXT + React + shadcn + Tailwind + dark mode — eliminates ~2hrs of config work |

---

## Executive Summary

**Reply Guy** is a Chrome sidebar extension that transforms profile browsing on X (Twitter) and LinkedIn into instant, personalized cold outreach opportunities. The extension analyzes profiles in real-time and generates multiple cold DM variants that are indistinguishable from messages you would personally write.

### The Core Loop

```
Browse profile → Extension auto-detects → Scrapes context → LLM analyzes →
Generates 3-5 voice-matched messages → You copy → You paste → Log it
```

**Time per outreach:** 20 min → 2 min (90% reduction)

---

## Design Direction: Vercel Aesthetic

The entire UI follows Vercel's design language — near 1:1. This isn't just a preference, it's the product identity.

### Design Tokens

```css
/* Reply Guy — Vercel Dark Theme */
:root {
  /* Background layers */
  --bg-primary: #000000;          /* Pure black */
  --bg-secondary: #0a0a0a;       /* Elevated surfaces */
  --bg-tertiary: #111111;        /* Cards, panels */
  --bg-hover: #1a1a1a;           /* Interactive hover */
  
  /* Borders */
  --border-default: #262626;     /* Subtle dividers */
  --border-hover: #333333;       /* Interactive borders */
  --border-focus: #ffffff;       /* Focus ring — white */
  
  /* Text */
  --text-primary: #ededed;       /* High emphasis */
  --text-secondary: #a1a1a1;     /* Medium emphasis */
  --text-tertiary: #666666;      /* Low emphasis */
  
  /* Accents */
  --accent-blue: #0070f3;        /* Vercel blue — links, primary actions */
  --accent-green: #00c853;       /* Success states, high confidence */
  --accent-amber: #f5a623;       /* Warning states, medium confidence */
  --accent-red: #ee0000;         /* Error states, low confidence */
  
  /* Typography */
  --font-sans: 'Geist Sans', system-ui, sans-serif;
  --font-mono: 'Geist Mono', monospace;
  
  /* Spacing */
  --radius: 8px;                 /* Consistent border radius */
  --sidebar-width: 380px;        /* Side panel width */
}
```

### Typography System

```
Geist Sans — All UI text
  → 11px / Medium — Labels, metadata, badges
  → 13px / Regular — Body text, descriptions
  → 14px / Medium — Section headers
  → 16px / Semibold — Panel title
  → 20px / Bold — Profile name (hero)

Geist Mono — Code-like data
  → Confidence scores: "0.87"
  → Timestamps: "2d ago"
  → Counts: "14.2K followers"
```

### Visual Principles

1. **Pure black backgrounds** — `#000` base, no grays above `#1a1a1a`
2. **1px borders** — `#262626`, the Vercel signature divider
3. **No color fills on surfaces** — borders define hierarchy, not background color
4. **White text only** — `#ededed` primary, `#a1a1a1` secondary, `#666` tertiary
5. **Vercel blue sparingly** — only for primary CTA and active tab indicators
6. **Micro-animations** — 150ms ease transitions on hover/focus, skeleton loading with shimmer
7. **No shadows** — flat hierarchy, borders do all the work
8. **Geist font everywhere** — load from WOFF2 bundled in extension assets

### Sidebar Layout (380px wide)

```
┌─────────────────────────────────────┐
│  ⚡ Reply Guy              ⚙ ···    │  ← Header: 48px, border-bottom
├─────────────────────────────────────┤
│  ┌────┐                             │
│  │ AV │  @username                  │  ← Profile card: avatar + name
│  └────┘  Senior Product Designer    │     handle, headline
│          San Francisco · 14.2K      │     location, followers (Geist Mono)
│                                     │
│  "Building design systems that..."  │  ← Bio excerpt, #a1a1a1
├─────────────────────────────────────┤
│  Confidence ███████████░░░  82%     │  ← Progress bar, accent-green
├─────────────────────────────────────┤
│  ⚠ Contacted 3d ago — View thread  │  ← Warning banner (if applicable)
├─────────────────────────────────────┤
│  [Service] [Partner] [Community]    │  ← Tabs: pill-style, 1px borders
│─────────────────────────────────────│
│                                     │
│  "Hey — saw your recent post about  │  ← Message card: #111 bg
│   design tokens. We just shipped... │     14px Geist Sans
│   something similar at our studio.  │     White text
│   Would love to compare notes."     │
│                                     │
│  Voice: 94% match · 47 words       │  ← Metadata: Geist Mono, #666
│                                     │
│  ┌───────────────────────────────┐  │
│  │     ▶ Copy Message            │  │  ← CTA: white bg, black text
│  └───────────────────────────────┘  │     (inverted Vercel button)
│                                     │
│  Why this works:                    │
│  "They posted about design tokens   │  ← Hook explanation: #a1a1a1
│   2 days ago — high relevance"      │     
├─────────────────────────────────────┤
│  ⟳ Regenerate  ✎ Edit  ⓘ Details  │  ← Action bar: icon buttons
└─────────────────────────────────────┘
```

---

## Technical Architecture — Revised

### Technology Stack

```
Extension Framework:    WXT (wxt.dev)
                       ├─ React 19 via @wxt-dev/module-react
                       ├─ TypeScript 5.x
                       ├─ Vite 6 (under the hood)
                       ├─ Manifest V3 auto-generation
                       ├─ Superior HMR (even for service workers)
                       └─ Auto-imports for browser APIs

Starter Template:      imtiger/wxt-react-shadcn-tailwindcss-chrome-extension
                       ├─ WXT + React pre-configured
                       ├─ shadcn/ui components ready
                       ├─ Tailwind CSS v4
                       ├─ Dark mode support built-in
                       └─ Side panel entry point included

UI Layer:              shadcn/ui + Tailwind CSS
                       ├─ Vercel shadcn theme (shadcn.io/theme/vercel)
                       ├─ Geist Sans + Geist Mono (bundled WOFF2)
                       ├─ Lucide React icons
                       ├─ class-variance-authority (CVA) for variants
                       └─ Dark-only mode (no light theme)

State Management:      Zustand 5.x
                       ├─ Extension state (current profile, messages, UI)
                       └─ Persist middleware → chrome.storage.local

Database:              Dexie.js 4.x (IndexedDB wrapper)
                       ├─ Conversations table (full history)
                       ├─ VoiceProfiles table
                       ├─ AnalysisCache table (24hr TTL)
                       ├─ Live queries → reactive React hooks
                       └─ useLiveQuery() for auto-updating UI

LLM Integration:       @openrouter/sdk (official TypeScript SDK)
                       ├─ Claude Sonnet 4.5 — profile analysis + generation
                       ├─ Streaming responses for real-time UI
                       ├─ Structured JSON output (no parsing gymnastics)
                       └─ Fallback: GPT-4o → Llama 3.3 70B

Scraping Engine:       Custom DOM parsers + fallback chain
                       ├─ Primary: data-testid selectors (X) / class selectors (LinkedIn)
                       ├─ Fallback 1: Accessibility tree via chrome.debugger
                       ├─ Fallback 2: Screenshot + Claude Vision
                       └─ MutationObserver for dynamic content

Voice Training:        LLM-powered analysis (no TensorFlow.js)
                       ├─ User uploads 10-20 example DMs
                       ├─ Claude extracts voice fingerprint
                       ├─ Stored as structured JSON in Dexie
                       └─ Fed into generation prompts as context
```

### Architecture Diagram — Revised

```
┌─────────────────────────────────────────────────────────────────┐
│                     USER NAVIGATES TO PROFILE                    │
│                    (X.com/username or linkedin.com/in/name)      │
└────────────────────────┬────────────────────────────────────────┘
                         │ URL pattern match triggers WXT entrypoint
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    WXT CONTENT SCRIPT                            │
│  entrypoints/content.ts                                         │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 1. Detect platform (X vs LinkedIn) from hostname        │   │
│  │ 2. Run platform-specific scraper with fallback chain    │   │
│  │ 3. Send scraped ProfileData to background via messaging │   │
│  └─────────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────────┘
                         │ chrome.runtime.sendMessage
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                  WXT BACKGROUND ENTRYPOINT                       │
│  entrypoints/background.ts                                      │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 1. Receive ProfileData                                   │   │
│  │ 2. Check Dexie cache (skip if <24hrs old)               │   │
│  │ 3. Open side panel: browser.sidePanel.open()            │   │
│  │ 4. Relay data to side panel via port messaging          │   │
│  └─────────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────────┘
                         │
                    ┌────┴────┐
                    ▼         ▼
┌──────────────────────┐  ┌──────────────────────────────────────┐
│  DEXIE.JS (IndexedDB) │  │         OPENROUTER API               │
│  ┌────────────────┐  │  │  ┌──────────────────────────────┐   │
│  │ analysisCache  │  │  │  │ Step 1: Profile Analysis     │   │
│  │ conversations  │  │  │  │ Model: claude-sonnet-4.5     │   │
│  │ voiceProfiles  │  │  │  │ → Summary, pain points,      │   │
│  └────────────────┘  │  │  │   outreach angles, confidence │   │
│  24hr TTL on cache   │  │  │                               │   │
│  Live queries → UI   │  │  │ Step 2: Message Generation    │   │
└──────────────────────┘  │  │ Model: claude-sonnet-4.5     │   │
                          │  │ → 3-5 voice-matched variants  │   │
                          │  │ → Streamed to side panel      │   │
                          │  └──────────────────────────────┘   │
                          └──────────┬───────────────────────────┘
                                     │ streaming response
                                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                    WXT SIDE PANEL                                │
│  entrypoints/sidepanel/                                         │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ React App (Vercel Dark Theme)                           │   │
│  │                                                          │   │
│  │ ┌─ ProfileCard ──────────────────────────────────┐      │   │
│  │ │ Avatar · Name · Handle · Bio · Followers       │      │   │
│  │ └────────────────────────────────────────────────┘      │   │
│  │ ┌─ ConfidenceBar ───────────────────────────────┐      │   │
│  │ │ ████████████░░░  82%                           │      │   │
│  │ └────────────────────────────────────────────────┘      │   │
│  │ ┌─ ConversationWarning (if exists) ─────────────┐      │   │
│  │ │ ⚠ Last contacted 3 days ago                    │      │   │
│  │ └────────────────────────────────────────────────┘      │   │
│  │ ┌─ MessageTabs ─────────────────────────────────┐      │   │
│  │ │ [Service] [Partner] [Community] [Value-First]  │      │   │
│  │ │                                                │      │   │
│  │ │  Message preview (streaming in real-time)      │      │   │
│  │ │  Voice match: 94% · 47 words                   │      │   │
│  │ │  [████████ Copy Message ████████]               │      │   │
│  │ │  Why this works: "Posted about X 2d ago"       │      │   │
│  │ └────────────────────────────────────────────────┘      │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Open Source Toolkit — Gems Found

Based on research using the GitHub Gem Seeker methodology, here are the repos that directly accelerate this build:

### Tier 1: Core Infrastructure (Use These)

**[WXT](https://github.com/wxt-dev/wxt)** — ⭐ 9,077 | 🔤 TypeScript
> Next-gen web extension framework. Vite-powered, auto-imports browser APIs, superior HMR even for service workers, auto-generates manifest from code.

**Why it's a gem:** The 2025 consensus pick over Plasmo (maintenance concerns) and Jonghakseo boilerplate (manual config). Tree-shaking alone reduces bundle from ~5MB to ~500KB. Has built-in `wxt/utils/storage` for type-safe Chrome Storage API access.

**Best for:** Our exact use case — React + TypeScript + Side Panel + Content Scripts.

---

**[imtiger/wxt-react-shadcn-tailwindcss-chrome-extension](https://github.com/imtiger/wxt-react-shadcn-tailwindcss-chrome-extension)** — ⭐ ~200 | 🔤 TypeScript
> Pre-wired starter: WXT + React + shadcn/ui + Tailwind CSS + dark mode + i18n. Side panel entry point already configured.

**Why it's a gem:** Eliminates ~2 hours of boilerplate config. We clone this, swap in the Vercel theme tokens, and we're coding features immediately.

**Best for:** Our starter template. Fork → customize → build.

---

**[Dexie.js](https://github.com/dexie/Dexie.js)** — ⭐ 11,600+ | 🔤 TypeScript
> A minimalistic wrapper for IndexedDB with reactive live queries, excellent TypeScript support, and an intuitive API.

**Why it's a gem:** The `useLiveQuery()` hook is perfect for React — conversation history updates in real-time without manual state management. Query API is far richer than `idb`. Example: `db.conversations.where('platform').equals('x').sortBy('lastContact')` — clean and readable.

**Best for:** Conversations table, voice profiles, analysis cache. Replaces `idb` from v1.

---

**[@openrouter/sdk](https://github.com/OpenRouterTeam/typescript-sdk)** — ⭐ Official | 🔤 TypeScript
> Official OpenRouter TypeScript SDK. ESM-first, native streaming, typed responses, provider config for model fallbacks.

**Why it's a gem:** Replaces the OpenAI SDK compatibility shim from v1. Native streaming support means we can render messages token-by-token in the side panel. The `provider.zdr` (zero data retention) flag is critical for privacy.

**Best for:** All LLM calls — profile analysis and message generation.

---

### Tier 2: Scraping Reference (Learn From These)

**[OgnjenAdzic28/x-post-scraper-extension](https://github.com/OgnjenAdzic28/x-post-scraper-extension)** — ⭐ ~50 | 🔤 JavaScript
> Chrome extension that scrapes X posts with auto-scroll, deduplication, engagement metrics, and ad blocking. Manifest V3.

**Why it's a gem:** Working `data-testid` selectors for X's current DOM structure (tested 2025). Smart deduplication strategies. Their `selectors.js` utility file is a great reference for our X scraper — extract, don't reinvent.

**Best for:** Reference for X content script selectors. Copy the selector patterns, adapt to profile scraping.

---

**[KartikayKaul/Yale3](https://github.com/DrakenWan/Yale3)** — ⭐ 95 | 🔤 JavaScript
> LinkedIn profile scraper as Chrome extension. Extracts profile data, experience, education. MIT licensed. Uses a selectors object pattern for easy DOM updates.

**Why it's a gem:** The `selectors.js` pattern is smart — all DOM selectors in one object, making it trivial to update when LinkedIn changes their markup. Recently updated with 2025 selectors.

**Best for:** Reference for LinkedIn content script. The selector object pattern should be adopted for both platforms.

---

### Tier 3: Voice & Style Analysis (Inspiration)

**[houtini-ai/voice-analyser-mcp](https://github.com/houtini-ai)** — ⭐ ~50 | 🔤 TypeScript
> Extracts writing voice from published content via sitemap. Generates statistical fingerprints: sentence rhythm, vocabulary patterns, argument flow, micro-rhythms. Outputs .md style guide.

**Why it's a gem:** Their approach of "extracting statistical fingerprints" rather than using embeddings is exactly what we need for voice training — but adapted for DMs instead of articles. The concept of generating a "voice guide" document that teaches LLMs to replicate style through examples is proven and lightweight.

**Best for:** Inspiration for voice training architecture. We adapt their fingerprint extraction concept to work on uploaded DM samples instead of sitemaps.

---

### Tier 4: Design Reference

**[Vercel Geist Design System](https://vercel.com/geist/introduction)** — Official
> Vercel's design system documentation. Color system, typography, components, spacing, materials.

**[Vercel shadcn Theme](https://www.shadcn.io/theme/vercel)** — Community
> Drop-in CSS variables that transform shadcn/ui into Vercel's aesthetic. Pure black/white, Geist typography, surgical minimalism.

**[vercel/geist-font](https://github.com/vercel/geist-font)** — ⭐ 2K+ | Official
> Geist Sans + Geist Mono. WOFF2 files for bundling. OFL licensed (free for all use).

**How to use:** Download WOFF2 from geist-font releases → bundle in extension `/assets/fonts/` → reference via `@font-face` in global CSS. This avoids CDN dependency and works offline.

---

## Revised Model Strategy

### Why Claude Sonnet 4.5 for Everything (Drop Opus)

The v1 PRD specified Opus for analysis and Sonnet for generation. After cost analysis:

| Model | Analysis Cost | Generation Cost (×5) | Total/Profile |
|-------|--------------|----------------------|---------------|
| Opus + Sonnet (v1) | ~$0.04 | ~$0.015 | ~$0.055 |
| **Sonnet only (v2)** | ~$0.008 | ~$0.015 | **~$0.023** |

Sonnet 4.5 is more than capable of profile analysis — Opus is overkill for structured JSON extraction. At 20 profiles/day, this saves ~$0.64/day ($19/month).

**Fallback chain:** Claude Sonnet 4.5 → GPT-4o → Llama 3.3 70B

### Streaming Architecture

```typescript
// lib/openrouter.ts — using official SDK
import { OpenRouter } from '@openrouter/sdk';

const client = new OpenRouter({
  apiKey: await getApiKey(), // from chrome.storage.local
});

export async function* analyzeProfile(profileData: ProfileData) {
  const stream = await client.chat.send({
    model: 'anthropic/claude-sonnet-4.5',
    messages: [
      { role: 'system', content: PROFILE_ANALYSIS_PROMPT },
      { role: 'user', content: JSON.stringify(profileData) }
    ],
    stream: true,
    provider: { 
      data_collection: 'deny', // Zero data retention
      sort: 'throughput'
    }
  });

  for await (const chunk of stream) {
    yield chunk.choices[0]?.delta?.content ?? '';
  }
}
```

---

## Revised Scraping Strategy

### The Selector Resilience Pattern

Both X and LinkedIn change their DOM constantly. Instead of brittle selectors, we use a **three-tier fallback chain**:

```typescript
// lib/scraper/strategy.ts
export async function scrapeProfile(platform: Platform): Promise<ProfileData> {
  // Tier 1: DOM selectors (fast, ~50ms)
  try {
    return platform === 'x' 
      ? await scrapeXProfile() 
      : await scrapeLinkedInProfile();
  } catch (e) {
    console.warn('DOM selectors failed, trying a11y tree...');
  }

  // Tier 2: Accessibility tree (reliable, ~200ms)
  try {
    return await scrapeViaAccessibilityTree(platform);
  } catch (e) {
    console.warn('A11y tree failed, trying screenshot...');
  }

  // Tier 3: Screenshot + Claude Vision (expensive, ~2s)
  return await scrapeViaScreenshot(platform);
}
```

### Selector Object Pattern (from Yale3)

```typescript
// lib/scraper/selectors/x.ts
export const X_SELECTORS = {
  name: '[data-testid="UserName"] > div > div > span',
  handle: '[data-testid="UserName"] + div span',
  bio: '[data-testid="UserDescription"]',
  location: '[data-testid="UserLocation"]',
  website: '[data-testid="UserUrl"] a',
  followers: '[href$="/followers"] span',
  following: '[href$="/following"] span',
  verified: '[data-testid="icon-verified"]',
  tweets: '[data-testid="tweet"]',
  tweetText: '[data-testid="tweetText"]',
  tweetTime: 'time[datetime]',
  tweetLikes: '[data-testid="like"] span',
  tweetRetweets: '[data-testid="retweet"] span',
} as const;

// When X changes their DOM, update THIS file only.
// Content script imports selectors — zero coupling.
```

---

## Revised Database Schema (Dexie.js)

```typescript
// lib/db.ts
import Dexie, { type EntityTable } from 'dexie';

interface Conversation {
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

interface VoiceProfile {
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

interface AnalysisCache {
  profileUrl: string;
  analysis: ProfileAnalysis;
  timestamp: Date;
}

const db = new Dexie('ReplyGuyDB') as Dexie & {
  conversations: EntityTable<Conversation, 'id'>;
  voiceProfiles: EntityTable<VoiceProfile, 'id'>;
  analysisCache: EntityTable<AnalysisCache, 'profileUrl'>;
};

db.version(1).stores({
  conversations: 'id, platform, profileUrl, status, lastContact, *tags',
  voiceProfiles: 'id, lastUpdated',
  analysisCache: 'profileUrl, timestamp',
});

export { db };
```

### Reactive Queries in React

```typescript
// hooks/useConversation.ts
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';

export function useConversation(profileUrl: string) {
  return useLiveQuery(
    () => db.conversations.where('profileUrl').equals(profileUrl).first(),
    [profileUrl]
  );
}

// Automatically re-renders when conversation is updated anywhere
```

---

## Voice Training — Simplified Architecture

### Drop TensorFlow.js

The v1 PRD proposed TensorFlow.js for browser-based embeddings and vector similarity matching. This is over-engineered for our use case:

- TF.js adds ~2MB to the extension bundle
- Browser-based embeddings are unreliable across devices
- Vector similarity requires maintaining an embedding model
- The LLM already understands writing style natively

### New Approach: LLM-Extracted Voice Fingerprint

```typescript
// lib/voice-trainer.ts
const VOICE_EXTRACTION_PROMPT = `
Analyze these message examples and extract a precise voice fingerprint.

MESSAGES:
{messages}

Return a JSON voice profile with:
1. avgMessageLength: average word count
2. emojiFrequency: average emojis per message (decimal)
3. emojiTypes: top 5 most-used emojis (array)
4. tone: 0 (extremely casual) to 10 (extremely formal)
5. sentenceStructure: "simple" | "complex" | "mixed"
6. openingPatterns: 3-5 typical message openers (e.g., "Hey", "Yo", "Saw your post about")
7. closingPatterns: 3-5 typical message closers
8. personalityMarkers: 3-5 distinctive traits (e.g., "uses analogies", "asks rhetorical questions")
9. avoidPhrases: phrases this person would NEVER use
10. vocabularySignature: 10-15 distinctive words/phrases they frequently use

Be extremely precise. This profile will be used to ghostwrite messages.
`;

export async function trainVoice(messages: string[]): Promise<VoiceProfile> {
  const response = await analyzeWithLLM(
    VOICE_EXTRACTION_PROMPT.replace('{messages}', messages.join('\n---\n'))
  );
  
  // Also compute statistical metrics locally (no LLM needed)
  const localMetrics = {
    avgMessageLength: computeAvgLength(messages),
    emojiFrequency: computeEmojiFreq(messages),
    emojiTypes: extractTopEmojis(messages),
  };
  
  // Merge LLM analysis with local statistics
  return { ...response, ...localMetrics };
}
```

### Voice Scoring — Keep It Simple

```typescript
export function scoreAuthenticity(message: string, profile: VoiceProfile): number {
  let score = 100;
  
  const wordCount = message.split(/\s+/).length;
  score -= Math.abs(wordCount - profile.avgMessageLength) * 2;
  
  const emojiCount = (message.match(/\p{Emoji}/gu) || []).length;
  score -= Math.abs(emojiCount - profile.emojiFrequency) * 10;
  
  for (const phrase of profile.avoidPhrases) {
    if (message.toLowerCase().includes(phrase.toLowerCase())) score -= 20;
  }
  
  return Math.max(0, Math.min(100, score));
}
```

---

## WXT Project Structure

```
reply-guy/
├── entrypoints/
│   ├── background.ts              # Service worker — message relay, side panel control
│   ├── content.ts                 # Content script — profile detection + scraping
│   ├── sidepanel/                 # Side panel React app
│   │   ├── index.html
│   │   ├── main.tsx
│   │   └── App.tsx
│   └── options/                   # Options page (voice training, API key)
│       ├── index.html
│       ├── main.tsx
│       └── App.tsx
├── components/
│   ├── ui/                        # shadcn/ui components (Vercel themed)
│   │   ├── button.tsx
│   │   ├── tabs.tsx
│   │   ├── card.tsx
│   │   ├── badge.tsx
│   │   ├── progress.tsx
│   │   ├── skeleton.tsx
│   │   └── toast.tsx
│   ├── ProfileCard.tsx
│   ├── ConfidenceBar.tsx
│   ├── MessageTab.tsx
│   ├── ConversationWarning.tsx
│   ├── VoiceTrainingWizard.tsx
│   └── CopyButton.tsx
├── lib/
│   ├── db.ts                      # Dexie.js setup + schemas
│   ├── openrouter.ts              # LLM client + prompts
│   ├── store.ts                   # Zustand store
│   ├── scraper/
│   │   ├── strategy.ts            # Fallback chain orchestrator
│   │   ├── x-scraper.ts           # X DOM scraper
│   │   ├── linkedin-scraper.ts    # LinkedIn DOM scraper
│   │   ├── a11y-scraper.ts        # Accessibility tree fallback
│   │   └── selectors/
│   │       ├── x.ts               # X selector map
│   │       └── linkedin.ts        # LinkedIn selector map
│   ├── voice/
│   │   ├── trainer.ts             # Voice profile extraction
│   │   └── scorer.ts              # Authenticity scoring
│   └── utils/
│       ├── rate-limiter.ts        # Request throttling
│       ├── cache.ts               # 24hr analysis cache
│       └── platform-detect.ts     # URL pattern matching
├── assets/
│   └── fonts/
│       ├── GeistVF.woff2          # Geist Sans variable
│       └── GeistMonoVF.woff2      # Geist Mono variable
├── styles/
│   └── globals.css                # Vercel theme tokens + @font-face
├── wxt.config.ts                  # WXT configuration
├── tailwind.config.ts             # Tailwind + Vercel theme
├── tsconfig.json
└── package.json
```

---

## Revised Implementation Roadmap

### Phase 1: Skeleton (Days 1-3)

**Goal:** Extension installs, side panel opens on profiles, shows loading state.

- [ ] Fork `imtiger/wxt-react-shadcn-tailwindcss-chrome-extension`
- [ ] Swap in Vercel dark theme tokens (CSS variables from shadcn.io/theme/vercel)
- [ ] Bundle Geist fonts in `/assets/fonts/`
- [ ] Configure side panel to open on X profile URLs
- [ ] Build ProfileCard component (hardcoded data)
- [ ] Build skeleton loading state (shimmer animation)

**Success:** Extension loads in Chrome, side panel opens on `x.com/*` profiles.

### Phase 2: Scraping + Analysis (Days 4-7)

**Goal:** Real profiles scraped, LLM analysis displayed.

- [ ] Implement X DOM scraper with selector map
- [ ] Wire content script → background → side panel messaging
- [ ] Set up @openrouter/sdk with streaming
- [ ] Implement profile analysis prompt
- [ ] Display real analysis in ProfileCard + ConfidenceBar
- [ ] Add 24hr analysis cache in Dexie

**Success:** Browse to any X profile → see real analysis in <5 seconds.

### Phase 3: Message Generation (Days 8-12)

**Goal:** 3-5 voice-matched messages generated per profile.

- [ ] Implement message generation prompt (multi-angle)
- [ ] Build MessageTabs component with streaming display
- [ ] Implement CopyButton with clipboard API
- [ ] Add "Did you send this?" confirmation toast
- [ ] Implement voice scoring (basic — no training yet)
- [ ] Add regenerate functionality

**Success:** Copy a generated message, paste into X DMs. Feels authentic.

### Phase 4: Voice Training (Days 13-17)

**Goal:** User trains voice profile, messages match their style.

- [ ] Build VoiceTrainingWizard in options page
- [ ] File upload for past DMs (text/JSON)
- [ ] Manual message input UI
- [ ] LLM voice extraction pipeline
- [ ] Store voice profile in Dexie
- [ ] Integrate voice profile into generation prompts
- [ ] Add voice match score to message cards
- [ ] A/B test: show user their real vs AI message (blind)

**Success:** User cannot tell which message is AI-generated in blind test.

### Phase 5: Conversation History (Days 18-22)

**Goal:** Track sent messages, prevent duplicate outreach, enable follow-ups.

- [ ] Implement Dexie conversations schema
- [ ] Log conversations on "Yes, I sent this" confirmation
- [ ] Build ConversationWarning banner
- [ ] Conversation history viewer (in options page)
- [ ] Follow-up message generation (with prior context)
- [ ] Analytics: response rates by angle type

**Success:** Extension warns you when you've already contacted someone.

### Phase 6: LinkedIn + Polish (Days 23-30)

**Goal:** Full LinkedIn support, production-ready quality.

- [ ] Implement LinkedIn DOM scraper with selector map
- [ ] Test on 50 LinkedIn profiles
- [ ] Add keyboard shortcut (Cmd+Shift+R to toggle panel)
- [ ] Error handling for all API failures
- [ ] Rate limiting (1 request per 5 seconds)
- [ ] Skeleton loading states for all async operations
- [ ] Empty states for first-time users
- [ ] Test on 100 real profiles across both platforms

**Success:** Zero crashes, <2 min from profile to sent message.

---

## Cost Analysis — Revised

### Per-Profile Breakdown (Claude Sonnet 4.5 only)

| Operation | Input Tokens | Output Tokens | Cost |
|-----------|-------------|---------------|------|
| Profile Analysis | ~2,000 | ~500 | ~$0.008 |
| Message Gen ×5 | ~1,500 ×5 | ~200 ×5 | ~$0.015 |
| **Total per profile** | | | **~$0.023** |

### Monthly Cost at Scale

| Daily Profiles | Monthly Cost | Notes |
|---------------|-------------|-------|
| 10 | $6.90 | Light usage |
| 20 | $13.80 | Target daily usage |
| 50 | $34.50 | Power user |

### NPM Dependencies (Extension Size Budget)

| Package | Size (gzipped) | Purpose |
|---------|---------------|---------|
| React + React DOM | ~42KB | UI framework |
| Zustand | ~1KB | State management |
| Dexie.js | ~28KB | IndexedDB wrapper |
| @openrouter/sdk | ~15KB | LLM client |
| shadcn/ui (tree-shaken) | ~20KB | UI components |
| Lucide React (tree-shaken) | ~5KB | Icons |
| Geist fonts (WOFF2) | ~80KB | Typography |
| **Total estimate** | **~191KB** | Well under Chrome's limits |

---

## Privacy & Compliance — Unchanged

All v1 privacy principles carry forward:

1. **Local-first:** All scraping in browser. Profile data never touches any server.
2. **API calls only to OpenRouter:** Encrypted HTTPS. `data_collection: 'deny'` flag set.
3. **No telemetry:** Zero analytics, zero tracking, zero server-side logging.
4. **User controls everything:** Clear all data via options page. Uninstall = full deletion.
5. **No auto-sending:** User always copies and pastes manually. Fully TOS-compliant.

---

## Open Questions — Resolved

| # | Question (v1) | Resolution (v2) |
|---|--------------|-----------------|
| 1 | Voice training bootstrap? | Hybrid: 10 manual examples + LLM extraction. No TF.js. |
| 2 | Model selection? | Sonnet 4.5 only. Opus dropped for cost. Fallback chain via OpenRouter SDK. |
| 3 | X or LinkedIn first? | X first (Phase 1-5). LinkedIn in Phase 6. |
| 4 | Auto-log or manual confirm? | Manual: "Did you send this?" toast after copy. |
| 5 | Sidebar persistence? | Tab-specific: opens on profile pages, closes on navigation. |
| 6 | Extension framework? | WXT (replaced Jonghakseo boilerplate). |
| 7 | IndexedDB library? | Dexie.js (replaced idb). Reactive hooks are essential for React. |
| 8 | How to handle DOM changes? | Three-tier fallback: selectors → a11y tree → screenshot + vision. |

---

## Quick Start — Updated

```bash
# 1. Clone the WXT + React + shadcn starter
git clone https://github.com/imtiger/wxt-react-shadcn-tailwindcss-chrome-extension.git reply-guy
cd reply-guy

# 2. Install dependencies
npm install

# 3. Add project-specific deps
npm install dexie dexie-react-hooks @openrouter/sdk zustand

# 4. Download Geist fonts
# → github.com/vercel/geist-font/releases → WOFF2 → /assets/fonts/

# 5. Apply Vercel theme
# → shadcn.io/theme/vercel → copy CSS variables → globals.css

# 6. Get OpenRouter API key
# → openrouter.ai → Add $10 credits → .env

# 7. Start development
npm run dev
# → Opens Chrome with extension loaded + HMR
```

---

## Resources — Updated

### Core Tools
- **WXT Framework:** [wxt.dev](https://wxt.dev) | [GitHub](https://github.com/wxt-dev/wxt)
- **WXT React Starter:** [imtiger/wxt-react-shadcn-tailwindcss](https://github.com/imtiger/wxt-react-shadcn-tailwindcss-chrome-extension)
- **shadcn/ui:** [ui.shadcn.com](https://ui.shadcn.com)
- **Vercel shadcn Theme:** [shadcn.io/theme/vercel](https://www.shadcn.io/theme/vercel)
- **Geist Font:** [vercel.com/font](https://vercel.com/font) | [GitHub](https://github.com/vercel/geist-font)
- **Dexie.js:** [dexie.org](https://dexie.org) | [GitHub](https://github.com/dexie/Dexie.js)
- **OpenRouter SDK:** [npm](https://www.npmjs.com/package/@openrouter/sdk) | [GitHub](https://github.com/OpenRouterTeam/typescript-sdk)
- **Zustand:** [GitHub](https://github.com/pmndrs/zustand)

### Scraping References
- **X Post Scraper:** [OgnjenAdzic28/x-post-scraper-extension](https://github.com/OgnjenAdzic28/x-post-scraper-extension)
- **Yale3 LinkedIn Scraper:** [KartikayKaul/Yale3](https://github.com/DrakenWan/Yale3)
- **Chrome Side Panel API:** [developer.chrome.com](https://developer.chrome.com/docs/extensions/reference/api/sidePanel)

### Design System
- **Geist Design System:** [vercel.com/geist](https://vercel.com/geist/introduction)
- **Vercel Color Tokens:** [vercel.com/geist/colors](https://vercel.com/geist/colors)
- **tweakcn (theme editor):** [tweakcn.com](https://tweakcn.com)

---

**End of Refined PRD v2.0**

**Ready to build. Let's go. ⚡**
