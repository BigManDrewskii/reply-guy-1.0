# CLAUDE.md — Reply Guy

## What This Is
Chrome Side Panel extension for AI-powered outreach. Works on ANY website. See `docs/prd.md` for the full spec.

## Phase 1 Priority: THE EXTENSION MUST LOAD
Previous attempts failed because the extension wouldn't install in Chrome. The PRD contains exact working code for every bootstrap file. Use that code verbatim. Do not improvise wxt.config.ts, background.ts, or sidepanel entry points.

## Tech Stack (Locked)
- **WXT** framework with `@wxt-dev/module-react`
- React 19 + TypeScript 5
- Tailwind CSS v4 with custom CSS variables (dark mode only)
- shadcn/ui components (customized dark theme)
- Lucide React icons via centralized `lib/icons.ts`
- Geist Sans + Mono fonts bundled as WOFF2
- Dexie.js 4.x for IndexedDB (NOT idb, NOT localStorage)
- @openrouter/sdk — always stream, always `data_collection: 'deny'`
- Zustand 5.x persisted to chrome.storage.local

## WXT Critical Rules
1. `manifest.action` must be `{}` (empty object) — enables side panel on icon click
2. WXT auto-adds `sidePanel` permission — do NOT add it manually
3. NO popup entrypoint — you can't have popup + sidepanel on icon click
4. Use `chrome.sidePanel` (not `browser.sidePanel`) — WXT types don't cover it
5. Background file must be `entrypoints/background.ts` — not nested in subdirectory
6. Side panel entrypoint: `entrypoints/sidepanel/index.html` — folder name matters

## Design Rules
- Design for **320px width** (Chrome's default side panel width)
- All content stacks **vertically** — never side-by-side columns
- Dark mode only: #000 base, #111 cards, #262626 borders
- No shadows, no gradients, no glows
- 1px borders only
- Geist Mono for ALL numerical data (scores, counts, timestamps)
- Inverted CTA pattern: white bg (#ededed), black text (#000)
- Skeleton shimmer for loading — never spinners
- 8px border-radius on interactive elements
- 150ms ease transitions

## Architecture
- Content script runs on `<all_urls>` — scrapes every page
- Platform detection: X, LinkedIn, GitHub get enhanced scrapers; everything else gets generic scraping (meta tags + OG data + body text)
- Data flow: content script → chrome.runtime.sendMessage → background → chrome.storage.session → side panel subscribes
- LLM analysis cached in Dexie with 24hr TTL
- All LLM prompts centralized in `lib/prompts.ts`

## Commands
```bash
npm run dev          # WXT dev mode with HMR
npm run build        # Production build
npm run zip          # Package for Chrome Web Store
```

## Phase Sequence
1. Extension loads + side panel opens on click
2. Content script scrapes pages + data flows to side panel
3. Onboarding (API key) + Settings screen
4. LLM analysis with streaming
5. Message generation with 4 angle tabs
6. Voice training wizard
7. History + search + polish