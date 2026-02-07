## CLAUDE.md

```markdown
# CLAUDE.md — Reply Guy

## Identity
Chrome sidebar extension for AI outreach. Works on ANY website, not just X/LinkedIn. See docs/prd.md for full spec.

## Critical: Extension Must Load
The PRD contains EXACT working code for wxt.config.ts, background.ts, content.ts, sidepanel/index.html, sidepanel/main.tsx, and sidepanel/App.tsx. Use that code verbatim as your starting point. Do NOT improvise the extension config. The side panel MUST open when clicking the extension icon.

Key requirements:
- side_panel.default_path must be "sidepanel.html" (matches WXT entrypoint folder name)
- Permission is "sidePanel" (camelCase)
- manifest.action must be {} (empty, enables icon click → side panel)
- content script matches: ["<all_urls>"] — runs everywhere
- Use chrome.storage.session (not ports) for content→sidepanel data relay

## Hard Constraints
- WXT from scratch. NO starter templates. NO Plasmo.
- React 19 + TypeScript 5 + Tailwind CSS v4
- Custom components with CVA + clsx + tailwind-merge
- Icons ONLY via lib/icons.ts (centralized registry). No direct lucide-react imports.
- Dexie.js 4.x (NOT idb). useLiveQuery() for reactive UI.
- @openrouter/sdk (NOT OpenAI SDK). Always stream. Always data_collection: 'deny'.
- Zustand 5.x. Persist to chrome.storage.local.
- Geist fonts bundled WOFF2 in assets/fonts/. No CDN.
- Dark only. No light mode.
- No TensorFlow.js. No analytics. No auto-sending.
- Full-width sidebar (width: 100%).
- No shadows. No gradients. 1px #262626 borders only.
- Bundle: <250KB gzipped (ex fonts).

## Phase Priority
1. Working extension that loads and opens side panel (use exact bootstrap code from PRD)
2. Page scraping on all URLs (generic + enhanced for X/LI/GH)
3. LLM analysis with streaming
4. Message generation with 4 angles
5. Voice training
6. History + polish
```

---

## Intervention

| Action | Command |
|--------|---------|
| Pause | `touch .loki/PAUSE` |
| Resume | `rm .loki/PAUSE` |
| Status | `cat .loki/CONTINUITY.md` |
| Focus | `echo "Phase 1 only — make it load" > .loki/HUMAN_INPUT.md` |

---

## Pre-launch checklist

```
~/reply-guy/
├── CLAUDE.md
└── docs/
    └── prd.md     ← reply-guy-prd-v4.md
```