# Reply Guy — PRD v4.0
## AI-Powered Cold Outreach Chrome Extension

**Version:** 4.0 — The One That Actually Works
**Author:** Studio Drewskii

---

## What This Is

A Chrome sidebar extension that helps you craft personalized outreach messages for anyone you're looking at online. Works on **any website** — X, LinkedIn, personal sites, company pages, GitHub profiles, portfolios, Dribbble, Behance, whatever. You browse, it reads the page, and generates messages that sound like you wrote them.

### How It Works

```
You're on ANY webpage → Click extension icon → Side panel opens →
Extension reads the page context → LLM analyzes the person/page →
Generates 4 voice-matched messages → You copy → You paste → Done
```

**Not limited to X and LinkedIn.** Those get special treatment (smarter scraping), but the extension works everywhere by reading whatever's on the page.

---

## Critical: Making the Extension Actually Load

The #1 reason WXT extensions fail to load is misconfigured entry points. Here is the exact configuration that MUST be used:

### package.json

```json
{
  "name": "reply-guy",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "wxt",
    "dev:firefox": "wxt -b firefox",
    "build": "wxt build",
    "build:firefox": "wxt build -b firefox",
    "zip": "wxt zip",
    "zip:firefox": "wxt zip -b firefox",
    "postinstall": "wxt prepare"
  },
  "dependencies": {
    "@openrouter/sdk": "latest",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "dexie": "^4.0.11",
    "dexie-react-hooks": "^1.1.7",
    "lucide-react": "^0.460.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "tailwind-merge": "^2.6.0",
    "zustand": "^5.0.3"
  },
  "devDependencies": {
    "@tailwindcss/vite": "^4.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@wxt-dev/module-react": "^1.1.2",
    "tailwindcss": "^4.0.0",
    "typescript": "^5.7.0",
    "wxt": "^0.19.0"
  }
}
```

### wxt.config.ts — THIS MUST BE EXACT

```typescript
import { defineConfig } from 'wxt';

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'Reply Guy',
    description: 'AI-powered outreach messages for any profile or page',
    version: '0.1.0',
    permissions: [
      'sidePanel',
      'activeTab',
      'storage',
      'clipboardWrite',
    ],
    side_panel: {
      default_path: 'sidepanel.html',
    },
    action: {
      default_title: 'Open Reply Guy',
    },
  },
});
```

**Key points that prevent loading failures:**
- The `side_panel.default_path` must match the entrypoint name exactly: `sidepanel.html` (WXT generates this from `entrypoints/sidepanel/`)
- Use `sidePanel` permission (camelCase), NOT `side_panel`
- Use `action` (not `browser_action` — that's MV2)
- The `activeTab` permission lets us read the current page without broad host permissions

### Entry Points — WXT Naming Convention

WXT auto-discovers entry points by folder/file name. These names are NOT optional:

```
entrypoints/
├── background.ts          → Service worker (MUST be this exact name)
├── content.ts             → Content script (MUST be this exact name)
└── sidepanel/             → Side panel (folder name = "sidepanel", generates sidepanel.html)
    ├── index.html
    ├── main.tsx
    └── App.tsx
```

### entrypoints/background.ts — WORKING BOOTSTRAP

```typescript
export default defineBackground(() => {
  // Open side panel when extension icon is clicked
  chrome.action.onClicked.addListener(async (tab) => {
    if (tab.id) {
      await chrome.sidePanel.open({ tabId: tab.id });
    }
  });

  // Enable side panel on ALL pages
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })
    .catch(console.error);

  // Listen for messages from content script
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'PAGE_DATA') {
      // Relay to side panel — side panel listens via port or storage
      chrome.storage.session.set({ currentPageData: message.data });
    }
    return true;
  });

  // When tab updates, tell content script to re-scrape
  chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
    if (changeInfo.status === 'complete') {
      chrome.tabs.sendMessage(tabId, { type: 'SCRAPE_PAGE' }).catch(() => {});
    }
  });

  // When active tab changes, tell new tab to scrape
  chrome.tabs.onActivated.addListener(async (activeInfo) => {
    chrome.tabs.sendMessage(activeInfo.tabId, { type: 'SCRAPE_PAGE' }).catch(() => {});
  });
});
```

### entrypoints/content.ts — WORKING BOOTSTRAP

```typescript
export default defineContentScript({
  matches: ['<all_urls>'],  // Run on EVERY page
  runAt: 'document_idle',

  main() {
    // Scrape on load
    scrapeAndSend();

    // Re-scrape when background asks (tab change, navigation)
    chrome.runtime.onMessage.addListener((message) => {
      if (message.type === 'SCRAPE_PAGE') {
        scrapeAndSend();
      }
    });

    // Watch for SPA navigation
    let lastUrl = location.href;
    const observer = new MutationObserver(() => {
      if (location.href !== lastUrl) {
        lastUrl = location.href;
        setTimeout(scrapeAndSend, 500); // Wait for SPA content to render
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  },
});

function scrapeAndSend() {
  const data = scrapePage();
  chrome.runtime.sendMessage({ type: 'PAGE_DATA', data }).catch(() => {});
}

function scrapePage() {
  const url = location.href;
  const hostname = location.hostname;

  // Detect platform for enhanced scraping
  const platform = detectPlatform(hostname);

  // Base data available on ALL pages
  const base = {
    url,
    hostname,
    platform,
    title: document.title,
    metaDescription: getMeta('description'),
    ogTitle: getMeta('og:title'),
    ogDescription: getMeta('og:description'),
    ogImage: getMeta('og:image'),
    author: getMeta('author') || getMeta('article:author'),
    scrapedAt: new Date().toISOString(),
  };

  // Platform-specific enhanced scraping
  if (platform === 'x') return { ...base, ...scrapeX() };
  if (platform === 'linkedin') return { ...base, ...scrapeLinkedIn() };
  if (platform === 'github') return { ...base, ...scrapeGitHub() };

  // Generic: grab visible text content for context
  return { ...base, ...scrapeGeneric() };
}

function detectPlatform(hostname: string) {
  if (hostname.includes('x.com') || hostname.includes('twitter.com')) return 'x';
  if (hostname.includes('linkedin.com')) return 'linkedin';
  if (hostname.includes('github.com')) return 'github';
  if (hostname.includes('dribbble.com')) return 'dribbble';
  if (hostname.includes('behance.net')) return 'behance';
  return 'generic';
}

function getMeta(name: string): string {
  const el =
    document.querySelector(`meta[name="${name}"]`) ||
    document.querySelector(`meta[property="${name}"]`);
  return el?.getAttribute('content') || '';
}

function scrapeX() {
  // Enhanced X profile scraping using data-testid selectors
  try {
    return {
      name: document.querySelector('[data-testid="UserName"] span')?.textContent || '',
      handle: document.querySelector('[data-testid="UserName"] + div span')?.textContent || '',
      bio: document.querySelector('[data-testid="UserDescription"]')?.textContent || '',
      location: document.querySelector('[data-testid="UserLocation"]')?.textContent || '',
      website: document.querySelector('[data-testid="UserUrl"] a')?.getAttribute('href') || '',
      followers: document.querySelector('[href$="/followers"] span')?.textContent || '',
      following: document.querySelector('[href$="/following"] span')?.textContent || '',
      verified: !!document.querySelector('[data-testid="icon-verified"]'),
      recentPosts: Array.from(document.querySelectorAll('[data-testid="tweetText"]'))
        .slice(0, 8)
        .map(el => el.textContent || ''),
      isProfile: true,
    };
  } catch {
    return { isProfile: false };
  }
}

function scrapeLinkedIn() {
  try {
    return {
      name: document.querySelector('.text-heading-xlarge')?.textContent?.trim() || '',
      headline: document.querySelector('.text-body-medium.break-words')?.textContent?.trim() || '',
      location: document.querySelector('.text-body-small.inline.t-black--light.break-words')?.textContent?.trim() || '',
      about: document.querySelector('#about ~ div .visually-hidden + span')?.textContent?.trim() || '',
      company: document.querySelector('.experience-item .t-bold span')?.textContent?.trim() || '',
      connections: document.querySelector('.t-bold + .t-black--light')?.textContent?.trim() || '',
      isProfile: !!document.querySelector('.text-heading-xlarge'),
    };
  } catch {
    return { isProfile: false };
  }
}

function scrapeGitHub() {
  try {
    return {
      name: document.querySelector('.p-name')?.textContent?.trim() || '',
      handle: document.querySelector('.p-nickname')?.textContent?.trim() || '',
      bio: document.querySelector('.p-note .js-user-profile-bio')?.textContent?.trim() || '',
      location: document.querySelector('[itemprop="homeLocation"]')?.textContent?.trim() || '',
      company: document.querySelector('[itemprop="worksFor"]')?.textContent?.trim() || '',
      website: document.querySelector('[itemprop="url"] a')?.getAttribute('href') || '',
      repos: document.querySelector('.Counter')?.textContent?.trim() || '',
      followers: document.querySelector('a[href$="followers"] span')?.textContent?.trim() || '',
      isProfile: !!document.querySelector('.p-name'),
    };
  } catch {
    return { isProfile: false };
  }
}

function scrapeGeneric() {
  // Get readable text content from the page (first ~2000 chars)
  const bodyText = document.body.innerText.substring(0, 3000);

  // Try to find any profile-like info
  const h1 = document.querySelector('h1')?.textContent?.trim() || '';
  const h2 = document.querySelector('h2')?.textContent?.trim() || '';

  // Look for social links
  const socialLinks = Array.from(document.querySelectorAll('a[href]'))
    .map(a => a.getAttribute('href') || '')
    .filter(href =>
      href.includes('twitter.com') || href.includes('x.com') ||
      href.includes('linkedin.com') || href.includes('github.com')
    )
    .slice(0, 5);

  // Look for email
  const emailMatch = bodyText.match(/[\w.-]+@[\w.-]+\.\w+/);

  return {
    h1,
    h2,
    bodyText: bodyText.substring(0, 2000), // Trim for token budget
    socialLinks,
    email: emailMatch?.[0] || '',
    isProfile: false,
  };
}
```

### entrypoints/sidepanel/index.html

```html
<!DOCTYPE html>
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

### entrypoints/sidepanel/main.tsx

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import '../../styles/globals.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

### entrypoints/sidepanel/App.tsx — WORKING BOOTSTRAP

```tsx
import React, { useEffect, useState } from 'react';

type Tab = 'outreach' | 'history' | 'settings';

export default function App() {
  const [tab, setTab] = useState<Tab>('outreach');
  const [pageData, setPageData] = useState<any>(null);

  useEffect(() => {
    // Listen for page data updates from background
    const listener = (changes: any) => {
      if (changes.currentPageData) {
        setPageData(changes.currentPageData.newValue);
      }
    };
    chrome.storage.session.onChanged.addListener(listener);

    // Load existing data
    chrome.storage.session.get('currentPageData', (result) => {
      if (result.currentPageData) setPageData(result.currentPageData);
    });

    return () => chrome.storage.session.onChanged.removeListener(listener);
  }, []);

  return (
    <div className="h-screen flex flex-col bg-[#000] text-[#ededed] font-sans">
      {/* Header */}
      <header className="h-12 flex items-center px-4 border-b border-[#262626] bg-[#0a0a0a] shrink-0">
        <span className="text-base font-semibold">⚡ Reply Guy</span>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Render active screen here based on tab + state */}
      </main>

      {/* Bottom Nav */}
      <nav className="h-14 flex items-center justify-around border-t border-[#262626] bg-[#0a0a0a] shrink-0">
        {(['outreach', 'history', 'settings'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex flex-col items-center gap-1 text-[11px] ${
              tab === t ? 'text-[#ededed]' : 'text-[#666]'
            }`}
          >
            <span className="text-sm">{t === 'outreach' ? '💬' : t === 'history' ? '📋' : '⚙️'}</span>
            <span className="capitalize">{t}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
```

---

## Architecture: Works on Any Website

### Platform Detection Tiers

| Tier | Sites | Scraping Method | Quality |
|------|-------|----------------|---------|
| **Tier 1: Enhanced** | X, LinkedIn | data-testid / class selectors → structured profile data | Excellent — name, bio, posts, followers |
| **Tier 2: Known** | GitHub, Dribbble, Behance, Product Hunt | Platform-specific selectors | Good — name, bio, work samples |
| **Tier 3: Generic** | Any other website | Meta tags + OG data + h1/h2 + body text + social links | Usable — enough context for LLM to work with |

**The LLM handles the gaps.** Even on a random portfolio site, the generic scraper grabs enough context (page title, headings, body text, social links) for Claude to understand who this person is and what they do. The message quality scales with how much context is available, but it always works.

### Data Flow

```
ANY WEBPAGE
    │
    ▼
Content Script (runs on <all_urls>)
    │ detectPlatform() → tier 1, 2, or 3 scraper
    │ scrapeAndSend()
    ▼
Background Service Worker
    │ receives PAGE_DATA
    │ stores in chrome.storage.session
    ▼
Side Panel React App
    │ listens to storage.session changes
    │ receives pageData automatically
    │ checks Dexie cache (24hr TTL)
    │ if miss → streams LLM analysis
    ▼
UI renders: page context → analysis → messages
```

**Why chrome.storage.session instead of ports:**
- Simpler than managing port connections
- Survives side panel close/reopen
- No race conditions on startup
- Side panel can read last state immediately on open

---

## Design System

### Color Tokens

```css
:root {
  --bg-000: #000000;    /* App base */
  --bg-050: #0a0a0a;    /* Header, footer, nav */
  --bg-100: #111111;    /* Cards, inputs, interactive surfaces */
  --bg-150: #171717;    /* Hover on cards */
  --bg-200: #1a1a1a;    /* Active/pressed */

  --border: #262626;
  --border-hover: #333333;
  --border-focus: #ededed;

  --text-primary: #ededed;
  --text-secondary: #a1a1a1;
  --text-tertiary: #666666;
  --text-inverted: #000000;

  --accent: #0070f3;
  --success: #00c853;
  --warning: #f5a623;
  --danger: #ee0000;

  --font-sans: 'Geist', system-ui, -apple-system, sans-serif;
  --font-mono: 'Geist Mono', 'SF Mono', monospace;

  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --transition: 150ms ease;
}
```

### Typography

```
Geist Sans — All UI text
  11px medium  → labels, badges, metadata
  13px normal  → body text, descriptions, messages
  14px medium  → section headers, tab labels
  16px semibold → panel headers
  20px bold    → profile name hero

Geist Mono — Data
  12px normal → confidence %, follower counts, timestamps, word counts
```

### Visual Rules

1. Full-width sidebar (100%). No hardcoded pixel widths.
2. Pure black base (#000). Cards are #111. Max surface brightness: #1a1a1a.
3. 1px #262626 borders only. No shadows. No gradients. No glows.
4. White text only: #ededed / #a1a1a1 / #666666. No colored text except links (blue) and errors (red).
5. Vercel blue (#0070f3) sparingly — primary CTA active state, active tab indicator, links.
6. Inverted CTA: white bg (#ededed), black text (#000), 8px radius. Hover: #d4d4d4.
7. Geist Mono for all numerical data.
8. 150ms ease transitions on all interactive states.
9. Skeleton shimmer loading (dark pulse on #111). Never full-page spinners.
10. No emojis in UI chrome (icons from Lucide only).
11. 8px radius on interactive elements. 12px on outer containers.
12. Fonts bundled as WOFF2. No CDN.

### Spacing

```
4px  → badge/chip inner padding
8px  → icon-to-label gaps
12px → card/input inner padding
16px → section spacing
20px → between major sections
24px → page-level horizontal padding
```

---

## Icon System (lib/icons.ts)

Every icon in the app is imported from this centralized registry. Components import from `@/lib/icons`, never from `lucide-react` directly.

```typescript
export {
  // Navigation
  Zap as LogoIcon,
  MessageSquare as OutreachIcon,
  History as HistoryIcon,
  Settings as SettingsIcon,

  // Profile
  User as UserIcon,
  MapPin as LocationIcon,
  Link as WebsiteIcon,
  Users as FollowersIcon,
  BadgeCheck as VerifiedIcon,
  Building2 as CompanyIcon,
  Briefcase as RoleIcon,

  // Platform
  Twitter as XIcon,
  Linkedin as LinkedInIcon,
  Github as GitHubIcon,
  Globe as GenericSiteIcon,

  // Analysis
  Brain as AnalyzeIcon,
  Target as ConfidenceIcon,
  TrendingUp as HighConfIcon,
  TrendingDown as LowConfIcon,
  Sparkles as InsightIcon,

  // Messages
  Copy as CopyIcon,
  Check as CopiedIcon,
  RefreshCw as RegenerateIcon,
  Pencil as EditIcon,
  Send as SendIcon,
  MessageCircle as ReplyIcon,
  Layers as AnglesIcon,

  // Angle tabs
  Handshake as ServiceIcon,
  HeartHandshake as PartnerIcon,
  UsersRound as CommunityIcon,
  Gift as ValueIcon,
  Lightbulb as IdeaIcon,

  // Voice
  AudioWaveform as VoiceIcon,
  Upload as UploadIcon,
  FileText as ExamplesIcon,
  Fingerprint as FingerprintIcon,
  BarChart3 as ScoreIcon,

  // History
  Clock as RecentIcon,
  Search as SearchIcon,
  Filter as FilterIcon,
  ArrowUpRight as OpenProfileIcon,
  Trash2 as DeleteIcon,

  // Status
  CircleDot as SentIcon,
  CircleCheck as RespondedIcon,
  CircleX as NoResponseIcon,
  Star as ConvertedIcon,

  // Settings
  Key as ApiKeyIcon,
  Eye as ShowIcon,
  EyeOff as HideIcon,
  Database as StorageIcon,
  Trash as ClearDataIcon,
  Info as AboutIcon,
  ExternalLink as ExternalIcon,

  // Feedback
  AlertTriangle as WarningIcon,
  AlertCircle as ErrorIcon,
  CheckCircle2 as SuccessIcon,
  Loader2 as LoaderIcon,
  ChevronDown as ExpandIcon,
  ChevronUp as CollapseIcon,
  ChevronRight as ChevronIcon,
  X as CloseIcon,
  MoreHorizontal as MoreIcon,
  ArrowLeft as BackIcon,
} from 'lucide-react';

export const ICON_SIZE = {
  xs: 12, sm: 14, md: 16, lg: 20, xl: 24, xxl: 32,
} as const;

export const ICON_DEFAULTS = {
  strokeWidth: 1.5,
  className: 'shrink-0',
} as const;
```

---

## UX Screens

### App Shell (Always Visible)

```
┌───────────────────────────────────────────┐
│  ⚡ Reply Guy                  [site] ··· │  ← 48px header, bg-050, border-bottom
├───────────────────────────────────────────┤  ← [site] = platform badge (X/LI/GH/🌐)
│                                           │
│           [ SCROLLABLE CONTENT ]          │  ← bg-000, flex-1, overflow-y-auto
│                                           │
├───────────────────────────────────────────┤
│  💬 Outreach    📋 History    ⚙ Settings  │  ← 56px bottom nav, bg-050, border-top
└───────────────────────────────────────────┘
```

### Onboarding (No API Key)

```
│         [ApiKeyIcon xxl #666]             │
│                                           │
│       Set up your API key                 │
│                                           │
│  Reply Guy uses OpenRouter to analyze     │
│  pages and generate outreach messages.    │
│                                           │
│  ┌─────────────────────────────────────┐  │
│  │  Enter your OpenRouter key          │  │  ← bg-100, border
│  └─────────────────────────────────────┘  │
│  ┌─────────────────────────────────────┐  │
│  │        Get Started →                │  │  ← inverted CTA
│  └─────────────────────────────────────┘  │
│  Get a key at openrouter.ai ↗            │
```

### Idle (API Key Set, Side Panel Open)

```
│         [ConfidenceIcon xxl #666]         │
│                                           │
│       Browse any page                     │
│                                           │
│  Navigate to any profile or page and      │
│  Reply Guy will read it and help you      │
│  craft the perfect outreach message.      │
│                                           │
│  Works best on:                           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │  𝕏  X    │ │ in  LI   │ │  GH      │  │  ← platform pills
│  └──────────┘ └──────────┘ └──────────┘  │
│  ...and any website with profile info.    │
```

### Loading (Scraping + Analyzing)

```
│  ┌─────────────────────────────────────┐  │
│  │ ░░░░░  ░░░░░░░░░░░░░░             │  │  ← skeleton profile card
│  │ ○      ░░░░░░░░░░                  │  │
│  │        ░░░░░░░░░░░░░░░░            │  │
│  └─────────────────────────────────────┘  │
│  ┌─────────────────────────────────────┐  │
│  │  Reading page...                    │  │  ← analysis skeleton
│  │  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │  │
│  └─────────────────────────────────────┘  │
│  ┌─────────────────────────────────────┐  │
│  │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░       │  │  ← message skeletons
│  │ ░░░░░░░░░░░░░░░░░░                │  │
│  └─────────────────────────────────────┘  │
```

Progressive reveal: profile card fills first → analysis streams → messages appear one by one.

### Ready (Messages Generated)

```
│  ┌─────────────────────────────────────┐  │
│  │ [IMG]  Sarah Chen          ✓       │  │  ← profile card: bg-100
│  │  48px  @sarahchen_design           │  │     avatar, name (xl bold), verified
│  │        Design Lead · Figma         │  │     handle, role+company (sm, secondary)
│  │        SF · 14.2K followers        │  │     location + followers (mono, tertiary)
│  │  "Building design systems..."      │  │     bio (sm, secondary, italic)
│  └─────────────────────────────────────┘  │
│                                           │
│  ┌─────────────────────────────────────┐  │
│  │ Outreach Score  ████████████░░  82% │  │  ← confidence bar: bg-100
│  │ Strong match — recent activity      │  │     bar color by score, mono for %
│  └─────────────────────────────────────┘  │
│                                           │
│  ┌─────────────────────────────────────┐  │  ← warning (only if prior contact)
│  │ ⚠ Contacted 3d ago — view thread → │  │     bg-100, left 2px warning border
│  └─────────────────────────────────────┘  │
│                                           │
│  [Service] [Partner] [Community] [Value]  │  ← angle tabs
│  ─────────────────────────────────────    │     active: text-primary, 2px accent bottom
│                                           │
│  ┌─────────────────────────────────────┐  │
│  │ Hey Sarah — saw your thread on      │  │  ← message card: bg-100
│  │ multi-brand token systems. We've    │  │     sm text, primary color
│  │ been solving the same problem for   │  │
│  │ startup clients and would love      │  │
│  │ to compare approaches.              │  │
│  │ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌  │  │
│  │ Voice: 94%  ·  38 words             │  │  ← mono, tertiary
│  │ ┌───────────────────────────────┐   │  │
│  │ │     📋  Copy Message          │   │  │  ← inverted CTA
│  │ └───────────────────────────────┘   │  │     click → "✓ Copied" 2s
│  │ Hook: Posted about design tokens    │  │  ← why this works (xs, tertiary)
│  │ 2 days ago — directly relevant.     │  │
│  └─────────────────────────────────────┘  │
│  ┌─────────────────────────────────────┐  │
│  │  ↻ Regenerate          ✎ Edit      │  │  ← action bar: ghost buttons
│  └─────────────────────────────────────┘  │
```

### Generic Page (Not a Profile — Still Works)

When the page isn't a recognized profile (Tier 3 scraping), show adapted UI:

```
│  ┌─────────────────────────────────────┐  │
│  │ 🌐  studio-drewskii.com            │  │  ← page card: GenericSiteIcon + hostname
│  │     "Studio Drewskii — Brand..."    │  │     og:title or document.title
│  │                                     │  │     og:description or meta desc
│  │     Social: x.com/drewskii ↗       │  │     any detected social links
│  └─────────────────────────────────────┘  │
│                                           │
│  ┌─────────────────────────────────────┐  │
│  │ Context Score  ██████░░░░░░░  52%   │  │  ← lower confidence (less data)
│  │ Limited context — generic page       │  │
│  └─────────────────────────────────────┘  │
│                                           │
│  [Messages generate as normal]            │  ← LLM adapts to available context
```

The LLM prompt explicitly handles low-context situations: "If profile data is sparse, focus the outreach on what IS available — the content on their site, their work, their company."

### Post-Copy Sheet

After copy → "✓ Copied" for 2s → bottom sheet slides up:

```
│  Did you send this message?              │
│  Logging helps avoid duplicate outreach.  │
│  ┌──────────────┐ ┌──────────────────┐   │
│  │  ✓ Yes, sent │ │   ✕ Not yet      │   │
│  └──────────────┘ └──────────────────┘   │
```

Yes → save to Dexie → "Logged ✓" toast. Not yet → dismiss. Auto-dismiss 15s.

### History Screen

```
│  ┌─────────────────────────────────────┐  │
│  │ 🔍  Search conversations...         │  │
│  └─────────────────────────────────────┘  │
│  [All] [𝕏 X] [in LI] [🌐 Other]        │  ← filter chips (now includes "Other")
│                                           │
│  Today                                    │
│  ┌─────────────────────────────────────┐  │
│  │ [AV] Sarah Chen          𝕏    3m   │  │
│  │      "Hey Sarah — saw..."          │  │
│  │      ● Sent                         │  │
│  └─────────────────────────────────────┘  │
│  ┌─────────────────────────────────────┐  │
│  │ [🌐] studio-drewskii.com   🌐  1h  │  │  ← generic site: globe icon as avatar
│  │      "Loved the brand systems..."   │  │
│  │      ✓ Responded                    │  │
│  └─────────────────────────────────────┘  │
```

### Settings Screen

```
│  API Key                                  │
│  ┌─────────────────────────────────────┐  │
│  │ sk-or-••••••••••7f3a           👁   │  │
│  └─────────────────────────────────────┘  │
│  Connected ✓                              │
│  ─────────────────────────────────────    │
│  Voice Training                           │
│  ┌─────────────────────────────────────┐  │
│  │  🎤 Train Your Voice →              │  │
│  │     12 examples · 94% match         │  │
│  └─────────────────────────────────────┘  │
│  ─────────────────────────────────────    │
│  Data                                     │
│  ┌─────────────────────────────────────┐  │
│  │  Clear Cache · Delete All · Reset   │  │
│  └─────────────────────────────────────┘  │
│  ─────────────────────────────────────    │
│  Reply Guy v0.1.0 · Studio Drewskii     │
```

### Voice Training (3 Steps)

Step 1: Paste 10-20 example DMs + "Analyze My Voice →"
Step 2: LLM extracts voice traits (streamed, each trait fades in)
Step 3: Review fingerprint (tone, patterns, avoid phrases) + "Save" or "Retrain"

---

## Database Schema (Dexie.js)

```typescript
// lib/db.ts
import Dexie, { type EntityTable } from 'dexie';

interface Conversation {
  id: string;
  platform: string;           // 'x' | 'linkedin' | 'github' | 'generic'
  pageUrl: string;
  pageName: string;            // person name or page title
  pageHandle: string;          // handle if available, empty string if not
  pageSnapshot: any;           // full scraped data at time of outreach
  sentMessage: string;         // the message they actually copied/sent
  angle: string;
  firstContact: Date;
  lastContact: Date;
  status: 'sent' | 'responded' | 'no_response' | 'converted';
}

interface VoiceProfile {
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
  conversations: 'id, platform, pageUrl, status, lastContact',
  voiceProfiles: 'id',
  analysisCache: 'pageUrl, timestamp',
});

export { db };
```

---

## LLM Strategy

### Model: Claude Sonnet 4.5 via OpenRouter

Cost: ~$0.020 per page analyzed + 4 messages generated.
Fallback: GPT-4o → Llama 3.3 70B.
Always: `data_collection: 'deny'`, streaming enabled.

### Prompts (all in lib/prompts.ts)

**Analysis prompt adapts to available data:**

```
You are analyzing a webpage to help craft personalized outreach messages.

PAGE DATA:
{pageData}

Based on whatever information is available, return JSON:
{
  "personName": "best guess at the person's name, or the page/company name",
  "summary": "2-3 sentences about who this is and what they do",
  "interests": ["3-5 topics they care about based on available evidence"],
  "outreachAngles": [
    { "angle": "service", "hook": "specific reason to reach out", "relevance": "why now" },
    { "angle": "partner", "hook": "...", "relevance": "..." },
    { "angle": "community", "hook": "...", "relevance": "..." },
    { "angle": "value", "hook": "...", "relevance": "..." }
  ],
  "confidence": 0-100,
  "confidenceReason": "why this score — based on data quality and recency"
}

If the page has rich profile data (social profiles, bio, recent posts), confidence should be higher.
If the page only has generic text content, confidence should be lower but still provide useful angles.
Always try. Never refuse. Work with whatever context you have.
```

**Message generation prompt includes voice profile (if trained) and adapts to context quality.**

---

## File Structure

```
reply-guy/
├── assets/fonts/
│   ├── GeistVF.woff2
│   └── GeistMonoVF.woff2
├── entrypoints/
│   ├── background.ts                # Service worker (exact code above)
│   ├── content.ts                   # Content script (exact code above)
│   └── sidepanel/
│       ├── index.html               # HTML shell (exact code above)
│       ├── main.tsx                  # React mount (exact code above)
│       └── App.tsx                   # App shell with routing
├── components/
│   ├── app/
│   │   ├── Header.tsx
│   │   ├── BottomNav.tsx
│   │   └── Toast.tsx
│   ├── screens/
│   │   ├── OnboardingScreen.tsx
│   │   ├── IdleScreen.tsx
│   │   ├── OutreachScreen.tsx
│   │   ├── HistoryScreen.tsx
│   │   ├── SettingsScreen.tsx
│   │   └── VoiceTrainingScreen.tsx
│   ├── profile/
│   │   ├── ProfileCard.tsx          # Adapts to platform — rich for X/LI, basic for generic
│   │   ├── PageCard.tsx             # Generic page card (hostname + title + description)
│   │   ├── ConfidenceBar.tsx
│   │   └── ConversationWarning.tsx
│   ├── messages/
│   │   ├── AngleTabs.tsx
│   │   ├── MessageCard.tsx
│   │   ├── CopyButton.tsx
│   │   ├── PostCopySheet.tsx
│   │   └── ActionBar.tsx
│   ├── history/
│   │   ├── ConversationRow.tsx
│   │   ├── ConversationDetail.tsx
│   │   └── FilterChips.tsx
│   ├── settings/
│   │   ├── ApiKeyInput.tsx
│   │   ├── VoiceProfileCard.tsx
│   │   └── DataManagement.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Input.tsx
│       ├── Badge.tsx
│       ├── Skeleton.tsx
│       ├── Tabs.tsx
│       ├── Sheet.tsx
│       └── Divider.tsx
├── lib/
│   ├── icons.ts                     # Centralized icon registry
│   ├── db.ts                        # Dexie.js (schema above)
│   ├── openrouter.ts                # Streaming LLM client
│   ├── store.ts                     # Zustand stores
│   ├── prompts.ts                   # All LLM prompts
│   ├── messaging.ts                 # Extension message types
│   ├── voice/
│   │   ├── trainer.ts
│   │   └── scorer.ts
│   └── utils/
│       ├── cn.ts                    # clsx + tailwind-merge
│       ├── rate-limiter.ts
│       ├── cache.ts
│       └── platform.ts
├── hooks/
│   ├── usePageData.ts               # Subscribe to chrome.storage.session changes
│   ├── useConversation.ts           # Dexie live query
│   ├── useVoiceProfile.ts
│   └── useAnalysis.ts               # Streaming analysis hook
├── types/
│   └── index.ts
├── styles/
│   └── globals.css
├── wxt.config.ts                    # EXACT config from above
├── tailwind.config.ts
├── tsconfig.json
└── package.json                     # EXACT config from above
```

---

## Implementation Phases

### Phase 1: Working Extension (Days 1-2)
Build the app shell that actually loads in Chrome. Header, bottom nav, three empty screens, correct fonts and colors. The extension must install and open the side panel on icon click.

### Phase 2: Page Scraping (Days 2-3)
Content script runs on all URLs. Scrapes page data (generic + platform-enhanced). Data flows to side panel. ProfileCard and PageCard render real data.

### Phase 3: LLM Analysis (Days 3-5)
OpenRouter streaming connected. Analysis prompt adapts to data quality. ConfidenceBar renders. 24hr Dexie cache.

### Phase 4: Message Generation (Days 5-7)
4 angle tabs. Messages stream in. CopyButton works. PostCopySheet logs to Dexie.

### Phase 5: Voice Training (Days 7-9)
3-step wizard. LLM extraction + local stats. Voice score on messages.

### Phase 6: History + Polish (Days 9-12)
History screen with search/filter. Conversation warning on revisit. Error states. Rate limiting. Test on 50+ pages across platforms.

---

## Privacy

1. Local-first. All scraping in-browser. No server.
2. API calls to OpenRouter only. `data_collection: 'deny'`.
3. No telemetry. No tracking. No analytics.
4. User controls all data via Settings.
5. No auto-sending. Manual copy-paste only.

---

**End of PRD v4.0**
