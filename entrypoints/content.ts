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

  setTimeout(() => {
    if (!resolved) {
      resolved = true;
      observer.disconnect();
      resolve();
    }
  }, 5000);
}

function getKeySelectors(platform: string): string[] {
  switch (platform) {
    case 'x':
      return ['[data-testid="UserName"]', '[data-testid="tweet"]'];
    case 'linkedin':
      return ['.text-heading-xlarge', '.pv-top-card', '.scaffold-layout'];
    case 'github':
      return ['.p-name', '[itemprop="worksFor"]'];
    default:
      return ['h1', 'main', 'article'];
  }
}

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

// ============================================
// X (Twitter) Scraper — Enhanced
// ============================================

function scrapeX() {
  try {
    const name = document.querySelector('[data-testid="UserName"] span')?.textContent || '';
    const bio = document.querySelector('[data-testid="UserDescription"]')?.textContent || '';
    const location = document.querySelector('[data-testid="UserLocation"]')?.textContent || '';
    const followers = document.querySelector('[href$="/followers"] span')?.textContent || '';
    const recentPosts = Array.from(document.querySelectorAll('[data-testid="tweetText"]'))
      .slice(0, 6).map(el => el.textContent || '');

    // Extract username from URL or DOM
    const urlMatch = window.location.pathname.match(/^\/([^/]+)/);
    const username = urlMatch?.[1] || '';

    // Thread context detection
    const threadContext = detectThreadContext();
    const isThread = threadContext.length > 0;

    let confidence = 50;
    if (name) confidence += 15;
    if (bio) confidence += 10;
    if (location) confidence += 5;
    if (followers) confidence += 5;
    if (recentPosts.length > 0) confidence += 15;

    return {
      name, bio, location, followers, recentPosts, username,
      isProfile: true,
      confidence: Math.min(confidence, 100),
      threadContext,
      isThread,
    };
  } catch { return {}; }
}

/**
 * Detect if the current page is a thread/conversation and extract context.
 * Looks for the conversation thread structure on X tweet pages.
 */
function detectThreadContext(): string[] {
  try {
    // Check if we're on a tweet/status page
    const isTweetPage = /\/status\/\d+/.test(window.location.pathname);
    if (!isTweetPage) return [];

    // Extract tweets in the thread (parent tweets above the main tweet)
    const tweetTexts = Array.from(document.querySelectorAll('[data-testid="tweetText"]'));
    if (tweetTexts.length <= 1) return [];

    // Get the thread context (up to 5 parent tweets)
    return tweetTexts
      .slice(0, 5)
      .map(el => el.textContent?.trim() || '')
      .filter(text => text.length > 0);
  } catch {
    return [];
  }
}

// ============================================
// LinkedIn Scraper — Resilient Section-Based
// ============================================

/**
 * Multi-strategy element finder. Tries each selector in order,
 * returns the first match. Resilient to LinkedIn DOM changes.
 */
function q(selectors: string[]): Element | null {
  for (const sel of selectors) {
    try {
      const el = document.querySelector(sel);
      if (el) return el;
    } catch { /* invalid selector, skip */ }
  }
  return null;
}

/** Extract trimmed text from first matching selector */
function qText(selectors: string[]): string {
  return q(selectors)?.textContent?.trim() || '';
}

/**
 * Extract the text content of a LinkedIn profile section by its anchor ID.
 * LinkedIn sections follow the pattern: <section> containing an element with id="sectionName"
 * The section's visible text is extracted, cleaned, and returned.
 */
function extractSection(sectionId: string, maxLength = 2000): string {
  try {
    // Strategy 1: Find the anchor element and walk up to its <section>
    const anchor = document.getElementById(sectionId);
    if (anchor) {
      const section = anchor.closest('section');
      if (section) {
        return cleanSectionText(section.innerText, maxLength);
      }
      // Fallback: the anchor's parent section via sibling traversal
      const parent = anchor.parentElement;
      if (parent) {
        const nextContainer = parent.nextElementSibling;
        if (nextContainer) {
          return cleanSectionText((nextContainer as HTMLElement).innerText, maxLength);
        }
      }
    }

    // Strategy 2: Find section by aria-label or heading text
    const sectionLabel = sectionId.charAt(0).toUpperCase() + sectionId.slice(1);
    const sections = document.querySelectorAll('section');
    for (const sec of sections) {
      const heading = sec.querySelector('h2, [class*="header"]');
      if (heading && heading.textContent?.trim().toLowerCase().includes(sectionId.toLowerCase())) {
        return cleanSectionText(sec.innerText, maxLength);
      }
    }

    return '';
  } catch {
    return '';
  }
}

/** Clean raw section text: collapse whitespace, remove "see more" artifacts */
function cleanSectionText(text: string, maxLength: number): string {
  return text
    .replace(/\s*see more\s*/gi, ' ')
    .replace(/\s*\.\.\.(see more|show more)\s*/gi, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+/g, ' ')
    .trim()
    .substring(0, maxLength);
}

/**
 * Extract structured list items from a section.
 * Returns individual entries (experience roles, education items, etc.)
 */
function extractSectionItems(sectionId: string, maxItems = 8): string[] {
  try {
    const anchor = document.getElementById(sectionId);
    if (!anchor) return [];

    const section = anchor.closest('section');
    if (!section) return [];

    // LinkedIn wraps each item in an <li> inside a pvs-list or artdeco-list
    const items = section.querySelectorAll('li.artdeco-list__item, li[class*="pvs-list__item"], li[class*="pvs-list__paged-list-item"]');
    if (items.length > 0) {
      return Array.from(items)
        .slice(0, maxItems)
        .map(li => {
          // Get visible text, collapse to single line
          const text = (li as HTMLElement).innerText
            ?.replace(/\n+/g, ' | ')
            .replace(/\s+/g, ' ')
            .trim();
          return text || '';
        })
        .filter(t => t.length > 5);
    }

    // Fallback: split section text by double newlines
    const sectionText = cleanSectionText(section.innerText, 3000);
    return sectionText
      .split(/\n{2,}/)
      .map(s => s.trim())
      .filter(s => s.length > 10)
      .slice(0, maxItems);
  } catch {
    return [];
  }
}

function scrapeLinkedIn() {
  try {
    const url = window.location.href;
    const isProfile = /linkedin\.com\/in\//.test(url);
    const isCompany = /linkedin\.com\/company\//.test(url);

    if (isCompany) {
      return scrapeLinkedInCompany();
    }

    if (!isProfile) {
      // LinkedIn article or other page
      return {
        name: getMeta('og:title') || document.querySelector('h1')?.textContent?.trim() || '',
        bodyText: document.querySelector('.article-content, .reader-article-content')?.textContent?.trim()?.substring(0, 3000) || '',
        confidence: 40,
      };
    }

    // ── Profile Name ──
    const name = qText([
      '.text-heading-xlarge',
      'h1.top-card-layout__title',
      '[data-anonymize="person-name"]',
      '.pv-top-card--list li:first-child',
      'h1',
    ]) || [getMeta('profile:first_name'), getMeta('profile:last_name')].filter(Boolean).join(' ');

    // ── Headline ──
    const headline = qText([
      '.text-body-medium.break-words',
      '.top-card-layout__headline',
      '[data-anonymize="headline"]',
      '.pv-top-card--list + .text-body-medium',
    ]);

    // ── Location ──
    const location = qText([
      '.text-body-small.inline.t-black--light.break-words',
      '.top-card-layout__first-subline',
      '.pv-top-card--list-bullet li:first-child',
      'span.text-body-small[class*="break-words"]',
    ]);

    // ── Connection degree ──
    const connectionDegree = qText([
      '.dist-value',
      '.distance-badge .dist-value',
      'span[class*="distance-badge"]',
    ]);

    // ── Followers / connections count ──
    const followers = qText([
      '.pvs-header__optional-link span.t-bold',
      '.t-bold:has(+ .t-black--light)',
      '[data-anonymize="connections-count"]',
      'span[class*="t-bold"][class*="connections"]',
    ]) || extractFollowersFromText();

    // ── Avatar URL ──
    const avatarUrl = (() => {
      const img = q([
        '.pv-top-card-profile-picture__image',
        '.pv-top-card__photo img',
        'img.profile-photo-edit__preview',
        '.presence-entity__image',
        'img[class*="pv-top-card"]',
      ]) as HTMLImageElement | null;
      return img?.src || getMeta('og:image') || '';
    })();

    // ── About section (critical — use section-based extraction) ──
    const about = extractSection('about', 2000) || qText([
      '#about ~ .display-flex .inline-show-more-text',
      '.pv-about-section .pv-about__summary-text',
      '[data-anonymize="about-description"]',
    ]);

    // ── Experience (structured items) ──
    const experience = extractSectionItems('experience', 8);

    // ── Education ──
    const education = extractSectionItems('education', 5);

    // ── Skills ──
    const skillsSection = extractSectionItems('skills', 15);
    // Also try the direct span approach
    const skillSpans = Array.from(
      document.querySelectorAll(
        '#skills ~ div span[aria-hidden="true"], ' +
        '[id="skills"] ~ div span[aria-hidden="true"], ' +
        '.pv-skill-category-entity__name-text'
      )
    )
      .slice(0, 15)
      .map(el => el.textContent?.trim() || '')
      .filter(s => s.length > 1 && s.length < 60);

    const skills = skillSpans.length > 0 ? skillSpans : skillsSection;

    // ── Recent Activity ──
    const recentActivity = extractRecentActivity();

    // ── Raw profile sections (fallback for LLM analysis) ──
    const profileSections: Record<string, string> = {};
    for (const sectionId of ['about', 'experience', 'education', 'skills', 'certifications', 'publications', 'projects', 'volunteering']) {
      const text = extractSection(sectionId, 1500);
      if (text.length > 20) {
        profileSections[sectionId] = text;
      }
    }

    // ── Confidence scoring ──
    let confidence = 30;
    if (name && name.length > 2) confidence += 15;
    if (headline) confidence += 10;
    if (about && about.length > 50) confidence += 15;
    if (experience.length > 0) confidence += 10;
    if (education.length > 0) confidence += 5;
    if (skills.length > 0) confidence += 5;
    if (recentActivity.length > 0) confidence += 5;
    if (location) confidence += 3;
    if (connectionDegree) confidence += 2;

    return {
      name,
      headline,
      about,
      location,
      followers,
      connectionDegree,
      avatarUrl,
      experience,
      education,
      skills,
      recentActivity,
      profileSections,
      isProfile: true,
      confidence: Math.min(confidence, 100),
    };
  } catch (err) {
    // Last resort: return whatever we can get from meta tags
    return {
      name: getMeta('og:title') || document.querySelector('h1')?.textContent?.trim() || '',
      headline: getMeta('og:description') || '',
      isProfile: true,
      confidence: 25,
    };
  }
}

/** Extract followers/connections count from nearby text patterns */
function extractFollowersFromText(): string {
  try {
    const topCard = document.querySelector('.pv-top-card, .scaffold-layout__main');
    if (!topCard) return '';
    const text = topCard.textContent || '';
    const match = text.match(/(\d[\d,]+)\+?\s*(followers|connections)/i);
    return match ? match[1] + ' ' + match[2] : '';
  } catch {
    return '';
  }
}

/** Extract recent activity/posts from the activity section */
function extractRecentActivity(): string[] {
  try {
    // Try the activity section on the profile page
    const activityItems = document.querySelectorAll(
      '.feed-shared-update-v2__description, ' +
      '.pv-recent-activity-section__card-subtitle, ' +
      '[class*="feed-shared-text"] span[dir="ltr"], ' +
      '.update-components-text span[dir="ltr"]'
    );

    if (activityItems.length > 0) {
      return Array.from(activityItems)
        .slice(0, 6)
        .map(el => el.textContent?.trim()?.substring(0, 400) || '')
        .filter(t => t.length > 10);
    }

    // Fallback: extract from the "Recent Activity" or "Activity" section
    const activitySection = extractSection('recent-activity', 2000) || extractSection('activity', 2000);
    if (activitySection.length > 30) {
      return activitySection
        .split(/\n{2,}/)
        .map(s => s.trim())
        .filter(s => s.length > 20)
        .slice(0, 6);
    }

    return [];
  } catch {
    return [];
  }
}

/** Scrape LinkedIn company page */
function scrapeLinkedInCompany() {
  try {
    const name = document.querySelector('h1 span')?.textContent?.trim() || getMeta('og:title') || '';
    const headline = qText([
      '.org-top-card-summary__tagline',
      '.top-card-layout__headline',
    ]);
    const about = qText([
      '.org-about-us-organization-description__text',
      '.org-page-details__definition-text',
    ])?.substring(0, 2000) || extractSection('about', 2000);

    const bodyText = document.querySelector('.org-grid__content-height-enforcer, main')?.textContent?.trim()?.substring(0, 3000) || '';

    return {
      name,
      headline,
      about,
      bodyText,
      isProfile: false,
      confidence: name ? 60 : 35,
    };
  } catch {
    return { isProfile: false, confidence: 25 };
  }
}

// ============================================
// GitHub Scraper
// ============================================

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
