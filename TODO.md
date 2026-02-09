# Reply Guy 1.0 — Master Implementation Plan

## Phase 1: P0 Critical Blockers — Assets & CSS

- [x] **1.1** Fix CSS color incompatibility: Remove `hsl()` wrappers from `tailwind.config.ts` so oklch tokens work
- [x] **1.2** Download and bundle Geist Sans + Mono WOFF2 fonts into `assets/fonts/`
- [x] **1.3** Add `@font-face` declarations to `styles/globals.css`
- [x] **1.4** Generate extension icons (16, 48, 128px) and add to `public/`
- [x] **1.5** Update `wxt.config.ts` to reference icons in manifest

## Phase 2: P0 Critical Blockers — Privacy, Voice Training, Spinner

- [x] **2.1** Add `data_collection: 'deny'` to all OpenRouter API requests in `lib/openrouter.ts`
- [x] **2.2** Fix voice training: Refactor to render inline in side panel (not new tab)
- [x] **2.3** Fix voice training: Replace `require()` with standard ESM import
- [x] **2.4** Fix voice training: Auto-start `analyzeVoice()` when step transitions to 2
- [x] **2.5** Replace ScreenLoader spinner with skeleton shimmer in `App.tsx`

## Phase 3: P1 Fixes — Fallback, Logging, Cache, Theme

- [x] **3.1** Implement LLM model fallback chain in `lib/openrouter.ts`
- [x] **3.2** Implement conversation logging in `handleLogged` (OutreachScreen → Dexie)
- [x] **3.3** Consolidate caching to Dexie only — remove chrome.storage.local cache from openrouter.ts
- [x] **3.4** Update `useAnalysis.ts` to use Dexie for cache reads/writes
- [x] **3.5** Resolve theme contradiction: Remove light mode (per PRD "dark mode only")

## Phase 4: P2 Code Quality — Performance, Types, Deduplication

- [x] **4.1** Throttle MutationObserver in `entrypoints/content.ts` (500ms debounce)
- [x] **4.2** Add AbortController support to `streamCompletion` and all hooks
- [x] **4.3** Add missing fields to `PageData` type in `types/index.ts`
- [x] **4.4** Extract shared `getMeta` utility (deduplicate content.ts / scrapers.ts)
- [x] **4.5** Extract shared `parseJsonResponse` utility for JSON extraction
- [x] **4.6** Replace manual useEffect in HistoryScreen with `useLiveQuery` from dexie-react-hooks
- [x] **4.7** Fix ErrorBoundary: Add retry mechanism
- [x] **4.8** Fix Toast type: Add `index` field to Toast interface
- [x] **4.9** Fix memo comparison in MessageCard to include relevant props

## Phase 5: P3 UX Improvements

- [x] **5.1** Replace all native `confirm()` dialogs with custom ConfirmDialog
- [x] **5.2** Add loading/success feedback for Settings actions (toasts)
- [x] **5.3** Add scroll position preservation across tab switches
- [x] **5.4** Implement keyboard shortcuts (Alt+1/2/3, Escape)
- [x] **5.5** Add duplicate contact warning before message generation
- [x] **5.6** Refine navigation bar active state (sliding indicator)

## Phase 6: Strategic Features

- [x] **6.1** Voice-first onboarding: Multi-step welcome flow
- [x] **6.2** Voice score badge indicator on messages
- [x] **6.3** Analytics dashboard: Stats overlay on History screen

## Phase 7: Build & Verify

- [x] **7.1** Run full build and fix any compilation errors
- [x] **7.2** Verify all TypeScript types compile cleanly
- [x] **7.3** Commit all changes with descriptive messages — pushed to main
