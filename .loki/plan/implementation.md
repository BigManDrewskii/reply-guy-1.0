# Reply Guy - Implementation Plan

**Version:** 1.0
**Date:** 2025-02-07
**Status:** Ready for Development
**Estimated Duration:** 30-36 days

---

## Executive Summary

Reply Guy is a Chrome extension that transforms profile browsing on X (Twitter) and LinkedIn into AI-powered cold outreach opportunities. This implementation plan provides the technical architecture, technology stack, component hierarchy, data flow, testing strategy, and deployment checklist required to build the product from PRD to production.

**Key Objectives:**
- Build extension using WXT framework with React 19 + shadcn/ui
- Implement Vercel dark aesthetic (pure black #000, Geist fonts)
- Integrate Claude Sonnet 4.5 via OpenRouter for profile analysis
- Generate voice-matched cold DMs in <2 minutes per profile
- Track conversation history to prevent duplicate outreach
- Support both X and LinkedIn platforms

---

## Architecture Overview

### System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     USER NAVIGATES TO PROFILE                    │
│                    (x.com/username or linkedin.com/in/name)      │
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

### Technology Layers

```
┌─────────────────────────────────────────────────────────────┐
│                        PRESENTATION                         │
│  React 19 + shadcn/ui + Vercel Dark Theme                  │
│  ├─ Side Panel App (380px wide, pure black background)      │
│  ├─ Options Page (settings, voice training)                 │
│  └─ Content Script (profile detection, scraping)           │
├─────────────────────────────────────────────────────────────┤
│                        APPLICATION                         │
│  Zustand Store (state management)                           │
│  ├─ currentProfile, profileAnalysis                         │
│  ├─ generatedMessages, voiceProfile                         │
│  └─ UI state (selectedTab, isGenerating, error)             │
├─────────────────────────────────────────────────────────────┤
│                        DOMAIN                              │
│  Business Logic                                             │
│  ├─ Scraper (DOM → a11y → screenshot fallback)             │
│  ├─ Voice Training (LLM-based extraction)                   │
│  ├─ Message Generation (multi-angle, voice-matched)         │
│  └─ Conversation History (Dexie persistence)                │
├─────────────────────────────────────────────────────────────┤
│                        DATA                                 │
│  Dexie.js (IndexedDB wrapper)                               │
│  ├─ conversations (tracked outreach)                        │
│  ├─ voiceProfiles (user writing style)                      │
│  └─ analysisCache (24hr TTL, API cost optimization)         │
├─────────────────────────────────────────────────────────────┤
│                        EXTERNAL                             │
│  ┌──────────────┐  ┌───────────────┐  ┌────────────────┐   │
│  │ OpenRouter   │  │ Chrome APIs    │  │ X/LinkedIn     │   │
│  │ (Claude API) │  │ Storage/messaging│  │ DOM scraping │   │
│  └──────────────┘  └───────────────┘  └────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## Technology Stack Rationale

### Framework: WXT (wxt.dev)

**Decision:** WXT over Plasmo and Jonghakseo boilerplate

**Rationale:**
| Feature | WXT | Plasmo | Jonghakseo |
|---------|-----|--------|------------|
| Stars | 9K+ | 7K+ | 5.3K |
| HMR | Superior (even SW) | Good | Basic |
| Auto-imports | ✓ browser APIs | ✗ | ✗ |
| Tree-shaking | 5MB→500KB | 1MB→800KB | 5MB→4MB |
| Maintenance | Active (2025) | Active (2025) | Stale (2024) |
| Side Panel | Built-in | Built-in | Manual |
| TypeScript | First-class | First-class | Good |

**Why WXT wins:**
- Superior tree-shaking reduces bundle by 90%
- Auto-imports for browser APIs reduces boilerplate
- Active maintenance with 2025 updates
- First-class side panel support

### UI: React 19 + shadcn/ui + Tailwind CSS v4

**Decision:** Modern React stack with shadcn/ui component library

**Rationale:**
- **React 19:** Latest stable, improved concurrent features
- **shadcn/ui:** Copy-paste components (no npm bloat), accessible, customizable
- **Tailwind v4:** Latest CSS framework, improved performance
- **Vercel Theme:** Drop-in CSS variables for consistent aesthetic

**Why not other UI frameworks:**
- **Material-UI:** Too opinionated, hard to customize to Vercel aesthetic
- **Chakra UI:** Good but larger bundle size
- **Mantine:** Powerful but complex API surface

### Database: Dexie.js 4.x

**Decision:** Dexie.js over idb and native IndexedDB

**Rationale:**
| Feature | Dexie.js | idb | Native IndexedDB |
|---------|----------|-----|-------------------|
| API | Rich, query-based | Promise-wrapper | Callback hell |
| Reactivity | useLiveQuery() | Manual | Manual |
| TypeScript | Excellent | Good | Poor |
| Bundle Size | 28KB | 6.7KB | 0KB |
| Query API | `db.table.where(x).equals(y)` | Manual | Complex |

**Why Dexie.js wins:**
- `useLiveQuery()` enables reactive UI without manual state management
- Rich query API reduces boilerplate
- Excellent TypeScript support
- Observable pattern fits React perfectly

### LLM: @openrouter/sdk → Claude Sonnet 4.5

**Decision:** Official OpenRouter SDK with Sonnet 4.5 (no Opus)

**Rationale:**
- **Official SDK:** Native streaming, typed responses, ESM-first
- **Sonnet only:** Cost optimization ($0.023/profile vs $0.055 with Opus)
- **OpenRouter:** Unified API for model fallbacks (Sonnet → GPT-4o → Llama 3.3 70B)
- **Zero data retention:** `provider.data_collection: 'deny'` for privacy

**Why not OpenAI SDK:**
- Requires compatibility shim for OpenRouter
- No native streaming support with shim
- OpenRouter official SDK launched (Dec 2024)

### State: Zustand 5.x + chrome.storage.local

**Decision:** Zustand over Redux and React Context

**Rationale:**
| Feature | Zustand | Redux | React Context |
|---------|---------|-------|---------------|
| Bundle Size | 1KB | 15KB+ | 0KB |
| Boilerplate | Minimal | High | Medium |
| DevTools | ✓ | ✓ | ✗ |
| Persistence | Built-in middleware | Need redux-persist | Manual |
| Learning Curve | Low | High | Low |

**Why Zustand wins:**
- Tiny bundle size (1KB)
- Minimal boilerplate
- Built-in persistence middleware for chrome.storage.local
- No providers needed

### Scraper: Three-tier fallback

**Decision:** DOM selectors → Accessibility tree → Screenshot + Vision

**Rationale:**
- **Tier 1 (DOM selectors):** Fast (~50ms), reliable when DOM stable
- **Tier 2 (A11y tree):** Slower (~200ms), more robust to DOM changes
- **Tier 3 (Screenshot + Vision):** Expensive (~2s), bulletproof

**Why fallback chain:**
- X and LinkedIn change DOM frequently
- Single scraper strategy breaks constantly
- Three-tier ensures resilience

---

## Component Hierarchy

### Side Panel App

```
App (entrypoints/sidepanel/App.tsx)
├─ ZustandStoreProvider
│  ├─ useReplyGuyStore()
│  └─ chrome.storage persistence
├─ ProfileCard
│  ├─ Avatar (fallback to first letter)
│  ├─ Name + Verified Badge
│  ├─ Handle (@username)
│  ├─ Location (if available)
│  ├─ Followers (formatted: 14.2K)
│  └─ Bio (truncated to 2 lines)
├─ ConfidenceBar
│  ├─ Progress Bar (color-coded: green/amber/red)
│  └─ Percentage (82%)
├─ ConversationWarning (conditional)
│  ├─ Warning Message
│  └─ Link to History
├─ MessageTabs
│  ├─ Tab Navigation (Service/Partner/Community/Value-First)
│  └─ MessageTab (per message)
│     ├─ Message Content (streaming display)
│     ├─ Metadata (voice match %, word count)
│     ├─ CopyButton
│     │  └─ Toast Confirmation
│     └─ WhyItWorks (explanation)
└─ Action Bar
   ├─ Regenerate Button
   ├─ Edit Button (future)
   └─ Details Button (future)
```

### Options Page

```
Options (entrypoints/options/App.tsx)
├─ APIKeySection
│  ├─ API Key Input (password type)
│  ├─ Save Button
│  └─ Link to openrouter.ai/keys
└─ VoiceTrainingWizard
   ├─ Step 1: Upload Examples
   │  ├─ File Input (.txt, .json, .csv)
   │  └─ Preview of uploaded messages
   ├─ Step 2: Manual Input
   │  ├─ Text Areas (10-20 examples)
   │  └─ Validation (minimum count)
   ├─ Step 3: Review Profile
   │  └─ Display extracted voice fingerprint
   └─ Step 4: Blind Test
      ├─ AI Message (with voice)
      ├─ Real Message (from examples)
      └─ Guess which is yours
```

### Component Props (Key Interfaces)

```typescript
// ProfileCard
interface ProfileCardProps {
  profile: ProfileData;
}

// ConfidenceBar
interface ConfidenceBarProps {
  confidence: number; // 0-100
}

// MessageTab
interface MessageTabProps {
  message: GeneratedMessage;
  onCopy: (message: GeneratedMessage) => void;
}

// GeneratedMessage
interface GeneratedMessage {
  id: string;
  angle: 'service' | 'partner' | 'community' | 'value_first';
  content: string;
  voiceMatchScore: number;
  whyItWorks: string;
}
```

---

## Data Flow Diagrams

### Flow 1: Profile Detection to Analysis

```
User navigates to x.com/username
       ↓
Content Script (entrypoints/content.ts)
   ├─ Detect URL pattern match
   ├─ Run scrapeXProfile()
   │  ├─ DOM selectors (data-testid)
   │  ├─ Extract: name, handle, bio, followers
   │  └─ Extract recent posts (last 10)
   └─ Send message: chrome.runtime.sendMessage({
        type: 'PROFILE_DETECTED',
        data: profileData
      })
       ↓
Background Script (entrypoints/background.ts)
   ├─ Receive PROFILE_DETECTED message
   ├─ Check Dexie analysisCache
   │  └─ Query: db.analysisCache.get(profileUrl)
   ├─ If cached && <24hrs old
   │  └─ Skip API call, use cached data
   └─ Open side panel: browser.sidePanel.open()
       ↓
Side Panel (entrypoints/sidepanel/App.tsx)
   ├─ Receive profileData via port messaging
   ├─ If no cached analysis
   │  └─ Call analyzeProfile(profileData)
   │     └─ OpenRouter API (streaming)
   │        └─ Claude Sonnet 4.5
   │           └─ Returns: ProfileAnalysis (JSON)
   │              ├─ summary
   │              ├─ painPoints[]
   │              ├─ outreachAngles[]
   │              └─ confidence
   └─ Store in analysisCache (24hr TTL)
```

### Flow 2: Message Generation

```
User clicks "Generate Messages" button
       ↓
Side Panel (App.tsx)
   ├─ Get profileData from store
   ├─ Get profileAnalysis from store
   ├─ Get voiceProfile from store (optional)
   └─ Call generateMessages(data, analysis, voice)
       ↓
OpenRouter API (lib/openrouter.ts)
   ├─ Construct prompt with:
   │  ├─ Profile data
   │  ├─ Profile analysis
   │  └─ Voice profile (if available)
   ├─ Send request: claude-sonnet-4.5
   └─ Stream response (token-by-token)
       ↓
Side Panel (display streaming)
   ├─ Update UI with each token chunk
   ├─ Parse JSON array when complete
   └─ Display 3-5 MessageTabs
       ├─ Angle (service/partner/community)
       ├─ Content (full message)
       ├─ Voice match score
       └─ Why it works (reasoning)
```

### Flow 3: Copy and Log

```
User clicks "Copy Message" button
       ↓
MessageTab component
   ├─ Write to clipboard: navigator.clipboard.writeText()
   ├─ Show toast: "Message copied! Did you send this?"
   │  └─ [Yes] [No]
   └─ Wait for user confirmation
       ↓
If [Yes] clicked
   └─ Create conversation record
      └─ Dexie: db.conversations.add({
           id: crypto.randomUUID(),
           platform: 'x',
           profileUrl: currentProfile.url,
           profileSnapshot: currentProfile,
           messages: [copiedMessage],
           firstContact: new Date(),
           lastContact: new Date(),
           status: 'sent'
         })
       ↓
Future: User revisits same profile
   └─ Duplicate detection
      ├─ Query: db.conversations.where('profileUrl').equals(url)
      └─ If exists → Show ConversationWarning
```

### Flow 4: Voice Training

```
User opens Options → Voice Training
       ↓
Step 1: Upload/Manual Input
   ├─ Upload file OR paste messages
   ├─ Validate: 10-20 messages required
   └─ Extract raw messages array
       ↓
Step 2: LLM Voice Extraction
   └─ Call extractVoiceProfile(messages)
      └─ OpenRouter API (claude-sonnet-4.5)
         ├─ Analyze patterns:
         │  ├─ avgMessageLength
         │  ├─ emojiFrequency
         │  ├─ emojiTypes (top 5)
         │  ├─ tone (0-10 scale)
         │  ├─ sentenceStructure
         │  ├─ opening/closingPatterns
         │  ├─ personalityMarkers
         │  ├─ avoidPhrases
         │  └─ vocabularySignature
         └─ Compute local metrics
            └─ Merge LLM + local
               └─ Return VoiceProfile
       ↓
Step 3: Store in Dexie
   └─ db.voiceProfiles.add(voiceProfile)
       ↓
Step 4: Blind Test
   ├─ Generate message with trained voice
   ├─ Display alongside real user message
   ├─ Ask: "Which is yours?"
   └─ Track accuracy (goal: >70%)
```

---

## Testing Strategy

### Unit Testing (Future)

**Tools:** Vitest (built-in with WXT)

**Coverage Targets:**
- Scraper functions: 80%+
- Voice scoring: 90%+ (deterministic)
- Utility functions: 95%+
- Components: 60%+ (visual testing preferred)

**Example Tests:**
```typescript
// lib/voice/scorer.test.ts
describe('scoreAuthenticity', () => {
  it('penalizes length deviation', () => {
    const profile = { avgMessageLength: 50, emojiFrequency: 2, avoidPhrases: [] };
    const score = scoreAuthenticity('short', profile);
    expect(score).toBeLessThan(100);
  });

  it('penalizes avoid phrases', () => {
    const profile = { avgMessageLength: 20, emojiFrequency: 0, avoidPhrases: ['literally'] };
    const score = scoreAuthenticity('I literally love this', profile);
    expect(score).toBeLessThan(80);
  });
});
```

### Integration Testing

**Tools:** Playwright (via MCP)

**Test Scenarios:**
1. **Side Panel Opens:** Navigate to X profile, verify side panel appears
2. **Scraping Works:** Verify profile data extracted accurately
3. **Message Generation:** Verify 3-5 messages generated
4. **Copy Button:** Verify clipboard writes correctly
5. **Cache Works:** Verify cached data loads <50ms

**Example Test:**
```typescript
test('side panel opens on X profile', async ({ page, context }) => {
  // Load extension
  await context.addInitScript({ path: '.output/chrome-mv3/background.js' });

  // Navigate to X profile
  await page.goto('https://x.com/drewskii');

  // Verify side panel opened
  const sidePanel = page.frame('sidepanel');
  expect(await sidePanel?.textContent()).toContain('Reply Guy');
});
```

### Manual Testing (Current)

**Real Profile Testing:**
- **Phase 1:** Test on 5 X profiles (visual verification)
- **Phase 2:** Test on 10 X profiles (verify analysis accuracy)
- **Phase 3:** Test on 10 X profiles (verify message quality)
- **Phase 4:** Test voice training with 1 user (verify blind test)
- **Phase 5:** Test conversation logging (verify duplicate detection)
- **Phase 6:** Test on 50 X + 50 LinkedIn profiles (comprehensive)

**Manual QA Checklist:**
```
Phase 1: Skeleton
☐ Extension installs without errors
☐ Side panel opens on x.com/* profiles
☐ Loading shimmer displays correctly
☐ Vercel theme applied (no light mode leaks)

Phase 2: Scraping + Analysis
☐ Profile data extracted accurately (10/10)
☐ Analysis displays in <5 seconds
☐ Cache reduces API calls (verify 2nd load <50ms)
☐ No console errors

Phase 3: Messages
☐ 3-5 messages generated (100% success)
☐ Copy button works (verified via paste)
☐ Voice scores reasonable (not all 100% or 0%)
☐ Regenerate produces different messages

Phase 4: Voice
☐ Voice training completes without errors
☐ Blind test accuracy >70%
☐ Generated messages match voice
☐ Voice profile saves/loads correctly

Phase 5: History
☐ Conversations logged to Dexie
☐ Duplicate warning shows on re-contact
☐ Follow-up includes context
☐ Analytics calculates correctly

Phase 6: Production
☐ LinkedIn scraper accurate (50/50 profiles)
☐ Zero crashes (both platforms)
☐ <2 min end-to-end time
☐ Keyboard shortcuts work
☐ Bundle size <250KB gzipped
```

### Performance Testing

**Metrics:**
- **Bundle Size:** <250KB gzipped (excluding fonts)
- **Load Time:** <500ms for side panel open
- **Scraping:** <100ms for DOM scraper
- **Analysis:** <5s for streaming response
- **Cache Hit:** <50ms for cached analysis
- **End-to-End:** <2 min from profile to sent message

**Tools:** Chrome DevTools Lighthouse, Bundle Analyzer

### Security Testing

**Checklist:**
- [ ] No API keys in source code
- [ ] All inputs validated (XSS prevention)
- [ ] All outputs sanitized
- [ ] No `eval()` or `innerHTML()` without sanitization
- [ ] Content Security Policy (CSP) enforced
- [ ] No sensitive data in logs

---

## Deployment Checklist

### Pre-Build

- [ ] All tests pass (manual + automated)
- [ ] Bundle size optimized (<250KB gzipped)
- [ ] No console errors or warnings
- [ ] Code formatted (Prettier)
- [ ] TypeScript compiled without errors
- [ ] Linting passed (ESLint)

### Build

```bash
# Production build
npm run build

# Verify output
ls -lh .output/chrome-mv3/

# Expected size: ~990KB total
# - background.js: ~11KB
# - sidebar.js: ~211KB
# - chunks/: ~700KB
# - assets/: ~60KB (CSS)
```

### Pre-Load Testing

- [ ] Load extension in Chrome (developer mode)
- [ ] Test all core flows (5 profiles)
- [ ] Verify no crashes
- [ ] Verify performance targets met
- [ ] Check memory usage (<100MB)

### Chrome Web Store Package

```bash
# Create ZIP
npm run zip

# Output: reply-guy-v1.0.0.zip
# Contains: .output/chrome-mv3/
```

**Store Listing Checklist:**
- [ ] Extension name: "Reply Guy"
- [ ] Description: "AI-powered cold outreach for X and LinkedIn"
- [ ] Screenshots: 5 (1280x800 or 640x400)
  1. Side panel with profile loaded
  2. Message generation in progress
  3. Voice training wizard
  4. Conversation history
  5. Options page
- [ ] Icon: 16px, 32px, 48px, 96px, 128px
- [ ] Privacy policy URL (if required)
- [ ] Category: "Productivity"
- [ ] Languages: "English"

### Permissions Used

```json
{
  "permissions": [
    "sidePanel",
    "storage"
  ],
  "host_permissions": [
    "https://x.com/*",
    "https://twitter.com/*",
    "https://www.linkedin.com/*",
    "https://openrouter.ai/api/*"
  ]
}
```

### Post-Deployment Monitoring

- [ ] Set up error tracking (if any)
- [ ] Monitor Chrome Web Store reviews
- [ ] Track user feedback channels
- [ ] Plan for rapid updates (DOM changes break scrapers)

---

## Risk Mitigation

### Risk 1: X/LinkedIn DOM Changes

**Probability:** High
**Impact:** Medium
**Mitigation:**
- Three-tier fallback chain (DOM → a11y → screenshot)
- Selector object pattern (easy updates)
- Automated testing for early detection
- Community contribution (open source selectors)

### Risk 2: OpenRouter Rate Limits

**Probability:** Medium
**Impact:** High
**Mitigation:**
- 24hr analysis cache (reduces API calls by 90%)
- Rate limiter (1 req/5s)
- Model fallback chain (Sonnet → GPT-4o → Llama 3.3)
- User notification when rate limited

### Risk 3: Voice Detection Inaccuracy

**Probability:** Low
**Impact:** Low
**Mitigation:**
- Blind test feedback loop
- Manual editing enabled
- Multiple message variants (user chooses best)
- Iterative voice refinement

### Risk 4: Chrome Web Store Rejection

**Probability:** Low
**Impact:** High
**Mitigation:**
- No auto-sending (manual copy-paste only)
- Clear privacy policy
- Minimal permissions (only necessary)
- Local-first approach (no server)
- Compliant with Terms of Service

---

## Implementation Sequence

### Week 1-2: Phase 1-2 (Foundation)
- Day 1-3: Skeleton (side panel, detection, UI)
- Day 4-7: Scraping + Analysis (X scraper, OpenRouter, cache)

### Week 3-4: Phase 3-4 (Core Features)
- Day 8-12: Message Generation (prompts, UI, copy)
- Day 13-17: Voice Training (wizard, extraction, blind test)

### Week 5-6: Phase 5-6 (Polish)
- Day 18-22: Conversation History (logging, detection, analytics)
- Day 23-30: LinkedIn + Polish (scraper, testing, optimization)

### Week 7-8: Buffer + Production
- Day 31-36: Final testing, bug fixes, Chrome Web Store submission

**Critical Path:**
Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5 → Phase 6

**Parallelizable:**
- LinkedIn scraper (with X scraper in Phase 2)
- Voice components (can start in Phase 3)
- History components (can start in Phase 4)

---

## Success Metrics

### Technical Metrics
- [ ] Bundle size: <250KB gzipped
- [ ] Load time: <500ms for side panel
- [ ] Analysis time: <5s for streaming response
- [ ] Cache hit: <50ms
- [ ] End-to-end: <2 min
- [ ] Crash rate: 0% (100 profiles tested)

### User Metrics (Future)
- [ ] Daily Active Users (DAU)
- [ ] Messages generated per session
- [ ] Copy-to-clipboard rate
- [ ] Voice training completion rate
- [ ] Response rate (tracked via status updates)

### Business Metrics (Future)
- [ ] Chrome Web Store installs
- [ ] User retention (7-day, 30-day)
- [ ] Average sessions per user
- [ ] Feature usage (messages generated, voices trained)

---

## Glossary

- **WXT:** Next-gen web extension framework (wxt.dev)
- **shadcn/ui:** Copy-paste component library for React
- **Dexie.js:** Minimalistic wrapper for IndexedDB
- **OpenRouter:** Unified API for LLM providers
- **Claude Sonnet 4.5:** Anthropic's balance model (cost/performance)
- **Zustand:** Small, fast state management library
- **Manifest V3:** Latest Chrome extension format
- **Side Panel:** Chrome API for sidebar extensions
- **Content Script:** Script injected into web pages
- **Background Script:** Service worker for extension logic
- **IndexedDB:** Browser database for persistent storage
- **HMR:** Hot Module Replacement (instant reload during dev)

---

**Implementation Plan Status:** COMPLETE ✓
**Ready for Development:** YES
**Confidence Level:** HIGH (95%)
**Next Step:** Begin Phase 1: Skeleton implementation
