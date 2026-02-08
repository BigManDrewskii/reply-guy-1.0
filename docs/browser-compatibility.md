# Cross-Browser Compatibility Report

**Extension**: Reply Guy v0.1.0
**Date**: 2026-02-09
**Phase**: Task 16 of 16 - Visual Polish Implementation

---

## Executive Summary

Reply Guy is a **Chrome-only extension** built with WXT framework. This document analyzes browser compatibility, documents modern CSS features used, catalogs Chrome Extension APIs, and provides testing guidance.

### Key Findings

- **Primary Target**: Chrome 120+ (Chromium-based browsers)
- **Minimum Chrome Version**: 120 (for OKLCH color space support)
- **Firefox Support**: Possible via WXT but **out of scope for Phase 1**
- **Critical Dependencies**: Chrome Extension APIs (sidePanel, storage, runtime, tabs)

---

## 1. CSS Feature Support

### 1.1 Modern CSS Features Used

#### OKLCH Color Space (Critical)

**Usage**: Primary color system throughout the application
**Location**: `/styles/design-tokens.css`
**Minimum Version**: Chrome 120+

```css
/* All colors defined with OKLCH */
--color-background: oklch(0 0 0);
--color-card: oklch(0.0670 0 0);
--color-success: oklch(0.6900 0.2000 150.0);
```

**Browser Support**:
- Chrome 120+: ✅ Full support
- Edge 120+: ✅ Full support (Chromium-based)
- Firefox 113+: ✅ Full support (but extension APIs differ)
- Safari 15.4+: ✅ Full support (but not relevant for extensions)

**Fallback Strategy**: No fallbacks implemented. OKLCH is required for Phase 1. If broader support is needed, post-process with tools like `oklch-postcss` to generate HSL fallbacks.

---

#### CSS Custom Properties (@theme)

**Usage**: Design token system
**Location**: `/styles/design-tokens.css`
**Minimum Version**: Chrome 69+

```css
@theme {
  --color-background: oklch(0 0 0);
  --spacing-1: 0.25rem;
  --font-sans: Geist, system-ui, sans-serif;
}
```

**Browser Support**:
- Chrome 69+: ✅
- Edge 79+: ✅
- Firefox: ❌ `@theme` is not a standard CSS feature

**Note**: This is a **Tailwind CSS v4** feature. It gets processed at build time, so browser support depends on Tailwind's output.

---

#### CSS @layer

**Usage**: Not currently used, but available in Tailwind v4
**Minimum Version**: Chrome 99+

**Browser Support**:
- Chrome 99+: ✅
- Edge 99+: ✅
- Firefox 97+: ✅
- Safari 15.4+: ✅

---

#### HSL Color Functions

**Usage**: Tailwind color utilities reference HSL
**Location**: `/tailwind.config.ts`
**Minimum Version**: Chrome 1+

```typescript
colors: {
  background: 'hsl(var(--color-background))',
  foreground: 'hsl(var(--color-foreground))',
}
```

**Browser Support**: Universal

---

#### CSS Grid & Flexbox

**Usage**: Layout system
**Minimum Version**: Chrome 29+ (Flexbox), Chrome 57+ (Grid)

**Browser Support**: Universal in modern browsers

---

#### Custom Scrollbar (Webkit)

**Usage**: Not explicitly used but may appear in component styles
**Browser Support**: Chromium-based browsers only

```css
/* Example - if added later */
::-webkit-scrollbar {
  width: 8px;
}
```

---

### 1.2 Animation Features

#### CSS Keyframes

**Usage**: Shimmer, slide-up, shake, fade animations
**Location**: `/styles/globals.css`
**Minimum Version**: Chrome 43+

**Browser Support**: Universal

```css
@keyframes shimmer {
  0% { backgroundPosition: '-200% 0' }
  100% { backgroundPosition: '200% 0' }
}
```

---

#### prefers-reduced-motion

**Usage**: Accessibility - disables animations for users who prefer reduced motion
**Location**: `/styles/globals.css`
**Minimum Version**: Chrome 74+

**Browser Support**: Universal

```css
@media (prefers-reduced-motion: reduce) {
  .animate-shimmer {
    animation: none;
  }
}
```

---

### 1.3 Vendor Prefixes

**Current Status**: No vendor prefixes used

**Rationale**:
- Targeting modern Chrome (120+)
- Autoprefixer not configured in PostCSS
- All features used are unprefixed in target browsers

**Future Consideration**: If Firefox support is added, run Autoprefixer in build pipeline.

---

### 1.4 Font Loading

**Usage**: Geist Sans & Geist Mono bundled as WOFF2
**Minimum Version**: Chrome 36+

**Implementation**: Fonts are imported via `@font-face` (assumed, not seen in current files)

**Browser Support**: Universal in modern browsers

---

## 2. Chrome Extension APIs

### 2.1 chrome.sidePanel

**Usage**: Opens side panel when extension icon is clicked
**Location**: `/entrypoints/background.ts`
**Minimum Version**: Chrome 114+

```typescript
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })
```

**Browser Support**:
- Chrome 114+: ✅
- Edge 114+: ✅
- Firefox: ❌ No equivalent API (uses sidebar.action, different API surface)
- Safari: ❌ No side panel support

---

### 2.2 chrome.storage

**Usage**: Zustand persistence, session storage for page data
**Locations**:
- `/lib/store.ts` (chrome.storage.local)
- `/entrypoints/background.ts` (chrome.storage.session)
- `/entrypoints/sidepanel/App.tsx` (chrome.storage.session)

**Minimum Version**:
- `chrome.storage.local`: Chrome 1+
- `chrome.storage.session`: Chrome 102+

**Browser Support**:
- Chrome 102+: ✅
- Edge 102+: ✅
- Firefox: ✅ (browser.storage.local, browser.storage.session)
- Safari: ❌ No storage.session API

---

#### Local Storage (Zustand Persistence)

```typescript
storage: {
  getItem: (name) => {
    return new Promise((resolve) => {
      chrome.storage.local.get([name], (result) => {
        resolve(result[name]);
      });
    });
  },
  // ...
}
```

**Purpose**: Persist API key, voice profile, screen state

---

#### Session Storage (Page Data Relay)

```typescript
// Background script
chrome.storage.session.set({ currentPageData: message.data });

// Side panel
chrome.storage.session.onChanged.addListener((changes) => {
  if (changes.currentPageData) {
    setPageData(changes.currentPageData.newValue);
  }
});
```

**Purpose**: Relay page data from content script → background → side panel

**Data Flow**:
1. Content script scrapes page
2. Content script sends message via `chrome.runtime.sendMessage`
3. Background script saves to `chrome.storage.session`
4. Side panel subscribes to `chrome.storage.session.onChanged`

---

### 2.3 chrome.runtime

**Usage**: Message passing between content script, background, and side panel
**Locations**: All entrypoints

**APIs Used**:
- `chrome.runtime.onMessage.addListener`
- `chrome.runtime.sendMessage`

**Minimum Version**: Chrome 1+

**Browser Support**: Universal

---

#### Message Passing Pattern

```typescript
// Content script
chrome.runtime.sendMessage({ type: 'PAGE_DATA', data });

// Background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'PAGE_DATA') {
    // Handle message
  }
  return true; // Keep message channel open for async response
});
```

---

### 2.4 chrome.tabs

**Usage**: Detect tab updates and activation to trigger re-scraping
**Location**: `/entrypoints/background.ts`

**APIs Used**:
- `chrome.tabs.onUpdated.addListener`
- `chrome.tabs.onActivated.addListener`
- `chrome.tabs.sendMessage`

**Minimum Version**: Chrome 1+

**Browser Support**: Universal

```typescript
// Re-scrape when tab completes loading
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === 'complete') {
    chrome.tabs.sendMessage(tabId, { type: 'SCRAPE_PAGE' });
  }
});
```

---

### 2.5 Manifest V3 Permissions

**Usage**: Declared in `wxt.config.ts`
**Permissions**:
- `activeTab`: Access current tab
- `storage`: Access chrome.storage APIs

**Browser Support**:
- Chrome 88+: ✅ (Manifest V3 required)
- Edge 88+: ✅
- Firefox 109+: ✅ (partial support)
- Safari: ❌ (Manifest V2 only)

---

## 3. JavaScript Features

### 3.1 ES2020 Target

**Configuration**: `/tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"]
  }
}
```

**Minimum Version**: Chrome 80+

**Features Used**:
- Optional chaining (`?.`)
- Nullish coalescing (`??`)
- `async`/`await`
- `Promise.allSettled` (if used)
- `String.matchAll` (if used)

---

### 3.2 React 19 Features

**Usage**: Core UI framework
**Minimum Version**: Chrome 90+ (for React 18+ features)

**Features Used**:
- Concurrent rendering (automatic in React 19)
- Suspense (lazy loading)
- Error boundaries
- Hooks (useState, useEffect, useCallback, useMemo, useRef)

**Browser Support**: Universal in modern browsers

---

### 3.3 TypeScript 5.7

**Usage**: Type safety
**Configuration**: Strict mode enabled

**Features Used**:
- Type inference
- Union types
- Generic types
- Utility types (Partial, Pick, Omit, etc.)

**Impact**: Transpiled away at build time, zero runtime cost

---

## 4. Browser Compatibility Matrix

| Feature | Chrome 120+ | Edge 120+ | Firefox 113+ | Safari 15.4+ |
|---------|-------------|-----------|--------------|--------------|
| **CSS** |
| OKLCH colors | ✅ | ✅ | ✅ | ✅ |
| Custom properties | ✅ | ✅ | ✅ | ✅ |
| CSS Grid | ✅ | ✅ | ✅ | ✅ |
| Flexbox | ✅ | ✅ | ✅ | ✅ |
| `@keyframes` | ✅ | ✅ | ✅ | ✅ |
| `prefers-reduced-motion` | ✅ | ✅ | ✅ | ✅ |
| **JavaScript** |
| ES2020 | ✅ | ✅ | ✅ | ✅ |
| Optional chaining | ✅ | ✅ | ✅ | ✅ |
| Nullish coalescing | ✅ | ✅ | ✅ | ✅ |
| Async/await | ✅ | ✅ | ✅ | ✅ |
| **Extension APIs** |
| `chrome.sidePanel` | ✅ | ✅ | ❌ | ❌ |
| `chrome.storage.session` | ✅ | ✅ | ✅ | ❌ |
| `chrome.storage.local` | ✅ | ✅ | ✅ | ✅ |
| `chrome.runtime` | ✅ | ✅ | ✅ | ✅ |
| `chrome.tabs` | ✅ | ✅ | ✅ | ✅ |
| **Frameworks** |
| React 19 | ✅ | ✅ | ✅ | ✅ |
| WXT | ✅ | ✅ | ✅ | ❌ |
| **Overall Status** | ✅ **FULL SUPPORT** | ✅ **FULL SUPPORT** | ⚠️ **NESDS PORTING** | ❌ **NOT SUPPORTED** |

---

## 5. Known Limitations

### 5.1 Firefox Limitations (Phase 1)

1. **No `chrome.sidePanel` API**
   - Firefox uses `sidebar.action` API
   - Requires different UI approach
   - Side panel not available on icon click

2. **Different Storage Namespace**
   - Use `browser` prefix instead of `chrome`
   - WXT handles this automatically, but needs testing

3. **Manifest V3 Support**
   - Firefox has partial MV3 support
   - Some APIs may behave differently

4. **WXT Firefox Support**
   - WXT supports Firefox (`npm run dev:firefox`)
   - **Untested in Phase 1**

---

### 5.2 Safari Limitations

1. **No Manifest V3 Support**
   - Safari uses Manifest V2
   - Different permission model
   - Background scripts vs service workers

2. **No `chrome.storage.session`**
   - Would need alternative approach
   - `chrome.storage.local` with TTL workaround

3. **No Side Panel API**
   - No equivalent in Safari
   - Would need popup-based UI

4. **WXT Does Not Support Safari**
   - No build target for Safari
   - Different build system required

---

## 6. Testing Checklist

### 6.1 Chrome Testing (Primary Target)

**Required Before Release**:
- [ ] Install extension in Chrome 120+ (stable)
- [ ] Verify side panel opens on icon click
- [ ] Test content script on generic page
- [ ] Test platform-specific scrapers:
  - [ ] X.com (Twitter)
  - [ ] LinkedIn
  - [ ] GitHub
  - [ ] Generic website
- [ ] Verify page data flows to side panel
- [ ] Test API key storage (chrome.storage.local)
- [ ] Test session data relay (chrome.storage.session)
- [ ] Test offline behavior (disconnect network)
- [ ] Test error handling (invalid API key, network errors)
- [ ] Test all animations respect `prefers-reduced-motion`
- [ ] Verify dark theme colors render correctly (OKLCH)

---

### 6.2 Edge Testing (Secondary Target)

**Optional** (Chromium-based, should work):
- [ ] Install extension in Edge 120+
- [ ] Verify same functionality as Chrome
- [ ] Test Edge-specific features (if any)

---

### 6.3 Firefox Testing (Future Phase)

**Out of Scope for Phase 1**, but if attempted:
- [ ] Run `npm run dev:firefox`
- [ ] Test `browser.sidePanel` API availability
- [ ] Verify storage migration (`chrome` → `browser` namespace)
- [ ] Test popup vs side panel UI differences
- [ ] Check for Firefox-specific console warnings
- [ ] Verify content script isolation (Firefox has stricter CSP)

---

### 6.4 Manual Testing Scripts

**Test 1: Basic Extension Load**
```
1. Open chrome://extensions
2. Enable Developer Mode
3. Click "Load unpacked"
4. Select .output/chrome-mv3 folder
5. Verify extension loads without errors
6. Click extension icon
7. Verify side panel opens
```

**Test 2: Content Script Injection**
```
1. Navigate to https://x.com/elonmusk
2. Open Chrome DevTools → Console
3. Run: chrome.runtime.sendMessage({type: 'SCRAPE_PAGE'})
4. Open side panel
5. Verify profile data appears
```

**Test 3: Storage Persistence**
```
1. Enter API key in Settings
2. Close side panel
3. Restart Chrome
4. Open side panel
5. Verify API key persists
```

**Test 4: Session Data Relay**
```
1. Open side panel
2. Navigate to different tab
3. Verify side panel updates with new page data
4. Close and reopen side panel
5. Verify data persists
```

**Test 5: Reduced Motion**
```
1. Open chrome://settings/accessibility
2. Enable "Reduce motion"
3. Open extension side panel
4. Navigate between screens
5. Verify no animations play
6. Open console
7. Verify no animation-related errors
```

---

## 7. Minimum Browser Version Requirements

### Primary Target (Chrome)

| Component | Minimum Version | Reason |
|-----------|-----------------|---------|
| **OKLCH colors** | Chrome 120+ | Color system |
| **chrome.sidePanel** | Chrome 114+ | Side panel UI |
| **chrome.storage.session** | Chrome 102+ | Page data relay |
| **ES2020** | Chrome 80+ | JavaScript target |
| **React 19** | Chrome 90+ | Concurrent rendering |
| **WXT** | Chrome 88+ | Manifest V3 |

**Final Minimum**: **Chrome 120+**

---

### Secondary Target (Edge)

| Component | Minimum Version | Reason |
|-----------|-----------------|---------|
| **Chromium engine** | Edge 120+ | Same as Chrome |

**Final Minimum**: **Edge 120+**

---

### Future Target (Firefox)

| Component | Minimum Version | Reason |
|-----------|-----------------|---------|
| **OKLCH colors** | Firefox 113+ | Color system |
| **browser.storage.session** | Firefox 113+ | Page data relay |
| **Manifest V3** | Firefox 109+ | Extension manifest |

**Final Minimum**: **Firefox 113+** (with porting effort)

---

## 8. Recommendations

### 8.1 Phase 1 (Current)

1. **Test thoroughly on Chrome 120+**
   - This is the primary target
   - All features designed for Chrome
   - Focus on core functionality

2. **Document any Chrome-specific assumptions**
   - Already done in this document
   - Update as new features are added

3. **Add browser check before release**
   - Warn users if Chrome version < 120
   - Graceful degradation (if possible)

---

### 8.2 Phase 2 (Future)

1. **Add Firefox support**
   - Run `npm run dev:firefox` to test
   - Replace `chrome.sidePanel` with Firefox sidebar
   - Test `browser` namespace APIs
   - Adjust manifest for Firefox quirks

2. **Consider OKLCH fallbacks**
   - Use postcss-oklch to generate HSL fallbacks
   - Enables support for older browsers
   - Only if broader compatibility is needed

3. **Add browser warning UI**
   - Check `navigator.userAgent`
   - Show warning if unsupported browser
   - Link to Chrome download page

---

### 8.3 Build Configuration

**Current WXT Config**:
```typescript
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'Reply Guy',
    description: 'AI-powered outreach for any page',
    version: '0.1.0',
    action: {},  // Enables openPanelOnActionClick
    permissions: [
      'activeTab',
      'storage',
    ],
  },
});
```

**For Firefox Support** (future):
```bash
# Build for Firefox
npm run build:firefox

# Test Firefox build
wxt -b firefox
```

---

## 9. External Dependencies

### 9.1 Framework Versions

| Package | Version | Chrome Support |
|---------|---------|----------------|
| WXT | 0.19.0 | 88+ (MV3) |
| React | 19.0.0 | 90+ |
| TypeScript | 5.7.0 | N/A (transpiled) |
| Tailwind CSS | 4.0.0 | 99+ (@layer) |
| Zustand | 5.0.3 | N/A (transpiled) |
| Dexie | 4.0.11 | N/A (transpiled) |

---

### 9.2 Chrome APIs Used

**Permissions**:
- `activeTab`: Access current tab
- `storage`: chrome.storage.local, chrome.storage.session

**Automatic Permissions** (added by WXT):
- `sidePanel`: Required for side panel UI
- `scripting`: For content script injection

---

## 10. Conclusion

### Current State

**Reply Guy is a Chrome-first extension** with the following characteristics:

1. **Primary Target**: Chrome 120+ (full support)
2. **Secondary Target**: Edge 120+ (full support, untested)
3. **Future Target**: Firefox 113+ (requires porting effort)
4. **Unsupported**: Safari (no Manifest V3, no side panel API)

### Critical Dependencies

- **OKLCH colors**: Requires Chrome 120+
- **chrome.sidePanel**: Requires Chrome 114+
- **chrome.storage.session**: Requires Chrome 102+
- **WXT framework**: Chrome 88+ (Manifest V3)

### Testing Priority

1. Test extensively on Chrome 120+ (stable)
2. Optionally test on Edge 120+
3. Document any issues found
4. Firefox support is out of scope for Phase 1

### Next Steps

1. Run manual testing checklist (Section 6)
2. File bugs for any compatibility issues
3. Add browser version warning in onboarding
4. Consider Firefox support for Phase 2

---

**Document Version**: 1.0
**Last Updated**: 2026-02-09
**Author**: Task 16 Implementation Subagent
