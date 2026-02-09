import { initializeGlow, removeGlow, updateGlowState } from '@/lib/glow-manager';
import { scrapeGeneric as enhancedScrapeGeneric } from '@/lib/scrapers';
import { getMeta } from '@/lib/utils/meta';

export default defineContentScript({
  matches: ['<all_urls>'],
  runAt: 'document_idle',

  main() {
    // Wait for page to be ready before scraping
    waitForPageReady().then(() => {
      scrapeAndSend();
    });

    // Message handlers for glow lifecycle and scraping
    chrome.runtime.onMessage.addListener((message) => {
      if (message.type === 'SCRAPE_PAGE') {
        waitForPageReady().then(() => {
          scrapeAndSend();
        });
      }

      if (message.type === 'START_ANALYSIS') {
        initializeGlow();
        updateGlowState('analyzing');
        waitForPageReady().then(() => {
          scrapeAndSend();
        });
      }

      if (message.type === 'ANALYSIS_COMPLETE') {
        updateGlowState(message.confidence < 50 ? 'low-confidence' : 'complete');
      }

      if (message.type === 'CLOSE_PANEL') {
        removeGlow();
      }

      return true;
    });

    // SPA navigation detection with debounced MutationObserver
    let lastUrl = location.href;
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;

    new MutationObserver(() => {
      if (location.href !== lastUrl) {
        lastUrl = location.href;

        // Debounce: cancel previous timer and set a new one
        if (debounceTimer) clearTimeout(debounceTimer);

        debounceTimer = setTimeout(() => {
          debounceTimer = null;
          waitForPageReady().then(() => {
            scrapeAndSend();
          });
        }, 500);
      }
    }).observe(document.body, { childList: true, subtree: true });
  },
});

/**
 * Waits for the page to be ready before scraping.
 * Checks for critical DOM elements and waits for dynamic content to load.
 * Resolves immediately if page appears ready, or after timeout.
 */
function waitForPageReady(): Promise<void> {
  return new Promise((resolve) => {
    if (document.readyState === 'complete') {
      checkElementsAndResolve(resolve);
    } else {
      const domReadyHandler = () => {
        checkElementsAndResolve(resolve);
        document.removeEventListener('DOMContentLoaded', domReadyHandler);
      };
      document.addEventListener('DOMContentLoaded', domReadyHandler);
    }
  });
}

/**
 * Checks if key elements are present, using MutationObserver to wait for them.
 * Resolves after 5 seconds max to avoid blocking indefinitely.
 */
function checkElementsAndResolve(resolve: () => void) {
  const platform = detectPlatform(location.hostname);
  const keySelectors = getKeySelectors(platform);

  if (areKeyElementsPresent(keySelectors)) {
    resolve();
    return;
  }

  let resolved = false;
  const observer = new MutationObserver(() => {
    if (!resolved && areKeyElementsPresent(keySelectors)) {
      resolved = true;
      observer.disconnect();
      resolve();
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  // Timeout after 5 seconds
  setTimeout(() => {
    if (!resolved) {
      resolved = true;
      observer.disconnect();
      resolve();
    }
  }, 5000);
}

/**
 * Gets platform-specific key selectors to wait for.
 */
function getKeySelectors(platform: string): string[] {
  switch (platform) {
    case 'x':
      return ['[data-testid="UserName"]', '[data-testid="tweet"]'];
    case 'linkedin':
      return ['.text-heading-xlarge', '.pv-top-card'];
    case 'github':
      return ['.p-name', '[itemprop="worksFor"]'];
    default:
      return ['h1', 'main', 'article'];
  }
}

/**
 * Checks if any of the key elements are present in the DOM.
 */
function areKeyElementsPresent(selectors: string[]): boolean {
  return selectors.some(selector => document.querySelector(selector) !== null);
}

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
    isReady: true,
  };

  if (platform === 'x') return { ...base, ...scrapeX() };
  if (platform === 'linkedin') return { ...base, ...scrapeLinkedIn() };
  if (platform === 'github') return { ...base, ...scrapeGitHub() };

  const genericData = enhancedScrapeGeneric();
  return { ...base, ...genericData };
}

function detectPlatform(h: string) {
  if (h.includes('x.com') || h.includes('twitter.com')) return 'x';
  if (h.includes('linkedin.com')) return 'linkedin';
  if (h.includes('github.com')) return 'github';
  return 'generic';
}

function scrapeX() {
  try {
    const name = document.querySelector('[data-testid="UserName"] span')?.textContent || '';
    const bio = document.querySelector('[data-testid="UserDescription"]')?.textContent || '';
    const location = document.querySelector('[data-testid="UserLocation"]')?.textContent || '';
    const followers = document.querySelector('[href$="/followers"] span')?.textContent || '';
    const recentPosts = Array.from(document.querySelectorAll('[data-testid="tweetText"]'))
      .slice(0, 6).map(el => el.textContent || '');

    let confidence = 50;
    if (name) confidence += 15;
    if (bio) confidence += 10;
    if (location) confidence += 5;
    if (followers) confidence += 5;
    if (recentPosts.length > 0) confidence += 15;

    return {
      name, bio, location, followers, recentPosts,
      isProfile: true,
      confidence: Math.min(confidence, 100)
    };
  } catch { return {}; }
}

function scrapeLinkedIn() {
  try {
    const name = document.querySelector('.text-heading-xlarge')?.textContent?.trim() || '';
    const headline = document.querySelector('.text-body-medium.break-words')?.textContent?.trim() || '';
    const about = document.querySelector('#about ~ div .visually-hidden + span')?.textContent?.trim() || '';
    const isProfile = !!document.querySelector('.text-heading-xlarge');

    let confidence = 40;
    if (name) confidence += 20;
    if (headline) confidence += 15;
    if (about) confidence += 15;
    if (isProfile) confidence += 10;

    return {
      name, headline, about, isProfile,
      confidence: Math.min(confidence, 100)
    };
  } catch { return {}; }
}

function scrapeGitHub() {
  try {
    const name = document.querySelector('.p-name')?.textContent?.trim() || '';
    const bio = document.querySelector('.p-note .js-user-profile-bio')?.textContent?.trim() || '';
    const company = document.querySelector('[itemprop="worksFor"]')?.textContent?.trim() || '';
    const isProfile = !!document.querySelector('.p-name');

    let confidence = 40;
    if (name) confidence += 20;
    if (bio) confidence += 15;
    if (company) confidence += 10;
    if (isProfile) confidence += 15;

    return {
      name, bio, company, isProfile,
      confidence: Math.min(confidence, 100)
    };
  } catch { return {}; }
}
