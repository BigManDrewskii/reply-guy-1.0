# Requirements Extracted from PRD

## Project Overview
**Name**: Reply Guy
**Type**: Chrome Extension (Side Panel)
**Purpose**: AI-powered cold outreach message generation for any webpage

## Tech Stack (from PRD)
- **Framework**: WXT (Chrome Extension framework)
- **Runtime**: React 19.0.0 + TypeScript 5.7
- **Styling**: Tailwind CSS 4.0
- **Storage**: Dexie.js 4.0.11 (IndexedDB wrapper)
- **State**: Zustand 5.0.3
- **LLM**: OpenRouter SDK (@openrouter/sdk)
- **Icons**: Lucide React 0.460.0
- **Utilities**: clsx, tailwind-merge, class-variance-authority

## Core Features

### 1. Universal Page Scraping
- Tier 1 (Enhanced): X, LinkedIn - structured profile data
- Tier 2 (Known): GitHub, Dribbble, Behance, Product Hunt
- Tier 3 (Generic): Any website - meta tags + body text
- Content script runs on `<all_urls>`
- SPA navigation detection via MutationObserver

### 2. LLM Analysis & Message Generation
- Model: Claude Sonnet 4.5 via OpenRouter
- Streaming responses
- Adapts to data quality (high/low confidence)
- 4 outreach angles: Service, Partner, Community, Value
- Voice profile integration for personalization

### 3. Voice Training System
- 3-step wizard
- LLM extracts voice traits from user examples
- Scoring system (voice match %)
- Stored in Dexie

### 4. Conversation History
- Dexie-based local storage
- Search/filter by platform
- Status tracking: sent/responded/no_response/converted
- Prior contact warnings

### 5. Side Panel UI
- 3 tabs: Outreach, History, Settings
- Header with platform badge
- Bottom navigation
- Dark theme (#000 base)
- Geist Sans/Mono fonts

## Data Flow
```
Webpage → Content Script → Background SW → chrome.storage.session → Side Panel
                                                              ↓
                                                         Dexie Cache (24hr)
                                                              ↓
                                                         OpenRouter API
                                                              ↓
                                                         UI Render
```

## Key Files Structure
```
entrypoints/
├── background.ts      # Service worker
├── content.ts         # Page scraper
└── sidepanel/         # React app
components/           # All UI components
lib/                  # Utilities, DB, prompts
hooks/                # React hooks
styles/               # globals.css with design tokens
assets/fonts/         # Geist fonts (WOFF2)
```

## Implementation Phases
1. **Working Extension**: App shell, fonts, colors
2. **Page Scraping**: Content script, data flow
3. **LLM Analysis**: OpenRouter integration, caching
4. **Message Generation**: 4 angles, copy, logging
5. **Voice Training**: 3-step wizard, extraction
6. **History + Polish**: Search, filter, testing

## Privacy Requirements
- Local-first (no server)
- `data_collection: 'deny'` for LLM
- No telemetry/analytics
- User-controlled data
- Manual copy-paste only

## Quality Gates
- Extension installs and loads
- Side panel opens on icon click
- Scraping works on all URL types
- Messages generate for all platforms
- 24hr cache respects TTL
- Voice training saves/loads correctly
