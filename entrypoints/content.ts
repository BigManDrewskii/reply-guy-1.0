export default defineContentScript({
  matches: ['<all_urls>'],
  runAt: 'document_idle',

  main() {
    // Wait for page to be ready before scraping
    waitForPageReady().then(() => {
      scrapeAndSend();
    });

    // Background asks us to re-scrape (tab change, navigation)
    chrome.runtime.onMessage.addListener((message) => {
      if (message.type === 'SCRAPE_PAGE') {
        waitForPageReady().then(() => {
          scrapeAndSend();
        });
      }
    });

    // SPA navigation detection
    let lastUrl = location.href;
    new MutationObserver(() => {
      if (location.href !== lastUrl) {
        lastUrl = location.href;
        // Wait for page to settle after navigation
        setTimeout(() => {
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
    // Check if document is already loaded
    if (document.readyState === 'complete') {
      checkElementsAndResolve(resolve);
    } else {
      // Wait for DOMContentLoaded
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

  // Check if any key elements exist already
  if (areKeyElementsPresent(keySelectors)) {
    resolve();
    return;
  }

  // Wait for key elements to appear
  const observer = new MutationObserver(() => {
    if (areKeyElementsPresent(keySelectors)) {
      observer.disconnect();
      resolve();
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  // Timeout after 5 seconds - resolve anyway to avoid blocking
  setTimeout(() => {
    observer.disconnect();
    resolve();
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
  return selectors.some(selector => {
    const element = document.querySelector(selector);
    return element !== null;
  });
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
    isReady: true, // Page was ready when scraped
  };

  if (platform === 'x') return { ...base, ...scrapeX() };
  if (platform === 'linkedin') return { ...base, ...scrapeLinkedIn() };
  if (platform === 'github') return { ...base, ...scrapeGitHub() };
  return { ...base, ...scrapeGeneric() };
}

function detectPlatform(h: string) {
  if (h.includes('x.com') || h.includes('twitter.com')) return 'x';
  if (h.includes('linkedin.com')) return 'linkedin';
  if (h.includes('github.com')) return 'github';
  return 'generic';
}

function getMeta(name: string) {
  return (
    document.querySelector(`meta[name="${name}"]`) ||
    document.querySelector(`meta[property="${name}"]`)
  )?.getAttribute('content') || '';
}

function scrapeX() {
  try {
    return {
      name: document.querySelector('[data-testid="UserName"] span')?.textContent || '',
      bio: document.querySelector('[data-testid="UserDescription"]')?.textContent || '',
      location: document.querySelector('[data-testid="UserLocation"]')?.textContent || '',
      followers: document.querySelector('[href$="/followers"] span')?.textContent || '',
      recentPosts: Array.from(document.querySelectorAll('[data-testid="tweetText"]'))
        .slice(0, 6).map(el => el.textContent || ''),
      isProfile: true,
    };
  } catch { return {}; }
}

function scrapeLinkedIn() {
  try {
    return {
      name: document.querySelector('.text-heading-xlarge')?.textContent?.trim() || '',
      headline: document.querySelector('.text-body-medium.break-words')?.textContent?.trim() || '',
      about: document.querySelector('#about ~ div .visually-hidden + span')?.textContent?.trim() || '',
      isProfile: !!document.querySelector('.text-heading-xlarge'),
    };
  } catch { return {}; }
}

function scrapeGitHub() {
  try {
    return {
      name: document.querySelector('.p-name')?.textContent?.trim() || '',
      bio: document.querySelector('.p-note .js-user-profile-bio')?.textContent?.trim() || '',
      company: document.querySelector('[itemprop="worksFor"]')?.textContent?.trim() || '',
      isProfile: !!document.querySelector('.p-name'),
    };
  } catch { return {}; }
}

function scrapeGeneric() {
  const bodyText = document.body.innerText.substring(0, 2000);
  const h1 = document.querySelector('h1')?.textContent?.trim() || '';
  const socialLinks = Array.from(document.querySelectorAll('a[href]'))
    .map(a => a.getAttribute('href') || '')
    .filter(href =>
      /x\.com|twitter\.com|linkedin\.com|github\.com/.test(href)
    ).slice(0, 5);
  const emailMatch = bodyText.match(/[\w.-]+@[\w.-]+\.\w+/);

  return { h1, bodyText, socialLinks, email: emailMatch?.[0] || '' };
}
