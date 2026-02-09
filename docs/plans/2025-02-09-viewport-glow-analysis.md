# Viewport Glow Analysis — Design Document

## Overview

Add visual feedback to page analysis by wrapping the browser viewport in a soft, colored glow that indicates analysis state. Replace shallow scraping with enhanced data extraction using Mozilla Readability and selector generation.

## Problem

Current page analysis lacks visual feedback. Users cannot see what the extension extracts or when analysis completes. Scraping uses basic DOM queries that fail on generic pages.

## Solution

### Visual Feedback

Inject a shadow DOM container that wraps the viewport with an inset box-shadow. Colors indicate state:

- **Blue pulsing glow** (#0070f3): Analyzing page
- **Green glow** (#00c853): Analysis complete
- **Yellow glow**: Low confidence data
- **Red glow**: Error occurred

Glow fades after 10 seconds unless user enables "Keep highlights on" in Settings.

### Enhanced Scraping

**Platform-specific scrapers** (X, LinkedIn, GitHub) remain unchanged. Add fallbacks:

1. **Mozilla Readability** for generic pages
2. **Selector generation** for element targeting
3. **Structured data extraction** (JSON-LD, schema.org)
4. **Confidence scoring** based on data completeness

**Selector priority:**
1. `data-testid` attributes (most stable)
2. Element IDs
3. Stable classes (no utility classes)
4. Tag names (fallback)

## Architecture

### Data Flow

```
User opens side panel →
Content script injects glow →
Glow turns blue (analyzing) →
Scrape page with enhanced methods →
Send data to side panel →
Glow turns green (complete) →
Fade after 10s
```

### Components

**content.ts additions:**

```typescript
// Glow lifecycle
function initializeGlow() {
  const container = document.createElement('div');
  const shadow = container.attachShadow({ mode: 'open' });
  // Inject CSS + glow frame
}

function updateGlowState(state: 'analyzing' | 'complete' | 'error') {
  // Update box-shadow color and animation
}

// Message handlers
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'START_ANALYSIS') {
    initializeGlow();
    updateGlowState('analyzing');
    scrapeAndSend();
  }
  if (message.type === 'ANALYSIS_COMPLETE') {
    updateGlowState('complete');
  }
  if (message.type === 'CLOSE_PANEL') {
    removeGlow();
  }
});
```

**lib/scrapers.ts** (new module):

```typescript
import { Readability } from '@mozilla/readability';

export function scrapeGeneric() {
  // Try Readability first
  const article = new Readability(document.cloneNode(true)).parse();
  if (article?.textContent) {
    return {
      title: article.title,
      content: article.textContent.substring(0, 2000),
      excerpt: article.excerpt,
      byline: article.byline,
      method: 'readability'
    };
  }

  // Fallback to meta tags
  return {
    title: document.title,
    metaDescription: getMeta('description'),
    ogTitle: getMeta('og:title'),
    ogDescription: getMeta('og:description')
  };
}

export function generateSelector(element: Element): string {
  // Priority: data-testid → ID → classes → tag
  if (element.id) return `#${element.id}`;
  const testId = element.getAttribute('data-testid');
  if (testId) return `[data-testid="${testId}"]`;
  // ... class logic
  return element.tagName.toLowerCase();
}
```

**sidepanel/App.tsx changes:**

```typescript
useEffect(() => {
  // Request glow on mount
  chrome.tabs.query({ active: true }).then(([tab]) => {
    chrome.tabs.sendMessage(tab.id!, { type: 'START_ANALYSIS' });
  });

  return () => {
    // Cleanup on unmount
    chrome.tabs.query({ active: true }).then(([tab]) => {
      chrome.tabs.sendMessage(tab.id!, { type: 'CLOSE_PANEL' });
    });
  };
}, []);
```

## Implementation Phases

### Phase 1: Glow Infrastructure

Create shadow DOM container, CSS animations, and message handlers. Test on simple page without scraping.

**Files:**
- `entrypoints/content.ts` (modify)
- `lib/glow-manager.ts` (create)

### Phase 2: Enhanced Scraping

Add Readability, selector generation, confidence scoring.

**Files:**
- `lib/scrapers.ts` (create)
- `lib/selector-utils.ts` (create)
- `package.json` (add `@mozilla/readability`)

### Phase 3: Integration

Connect glow state to analysis lifecycle. Add auto-fade and Settings toggle.

**Files:**
- `entrypoints/content.ts` (modify)
- `entrypoints/background.ts` (modify)
- `components/screens/SettingsScreen.tsx` (modify)

### Phase 4: Polish

Handle edge cases, test across sites, optimize performance.

**Testing:**
- X, LinkedIn, GitHub
- 10+ random websites
- SPA navigation
- Memory leak testing

## Error Handling

- **Restricted pages** (chrome:// URLs): Skip glow, show notification in side panel
- **CSP blocks shadow DOM**: Fallback to inline styles on body
- **Navigation during analysis**: Remove old glow, restart analysis
- **Low confidence**: Yellow glow + warning in side panel
- **Scraping timeout**: Red glow + error message

## Performance

- Use `will-change: box-shadow` for GPU acceleration
- Throttle state updates to 60fps max
- Batch DOM reads to avoid layout thrashing
- Clean up event listeners and timeouts
- Fixed positioning prevents reflows

## Dependencies

Add to `package.json`:

```json
{
  "dependencies": {
    "@mozilla/readability": "^0.5.0"
  }
}
```

## Success Criteria

- Glow appears when side panel opens
- Blue while analyzing, green when complete
- Fades after 10 seconds (or persists if enabled)
- Enhanced scraping works on generic pages
- No memory leaks
- Works on X, LinkedIn, GitHub, and 10+ random sites
