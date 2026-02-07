// Scraping Strategy - Three-tier fallback chain
import type { ProfileData, Post } from '../db';
import { X_SELECTORS } from './selectors/x';

export type Platform = 'x' | 'linkedin';

// Scrape profile with fallback chain
export async function scrapeProfile(platform: Platform): Promise<ProfileData> {
  // Tier 1: DOM selectors (fast, ~50ms)
  try {
    return platform === 'x'
      ? await scrapeXProfile()
      : await scrapeLinkedInProfile();
  } catch (e) {
    console.warn('[Scraper] DOM selectors failed, trying a11y tree...', e);
  }

  // Tier 2: Accessibility tree (reliable, ~200ms)
  try {
    return await scrapeViaAccessibilityTree(platform);
  } catch (e) {
    console.warn('[Scraper] A11y tree failed, trying screenshot...', e);
  }

  // Tier 3: Screenshot + Claude Vision (expensive, ~2s)
  return await scrapeViaScreenshot(platform);
}

// Tier 1: X DOM scraper
async function scrapeXProfile(): Promise<ProfileData> {
  console.log('[X Scraper] Starting DOM scrape...');

  // Helper: Safe query with optional context
  const safeQuery = <T>(
    selector: string,
    extractor: (el: Element) => T,
    fallback: T,
    context?: Element | ParentNode
  ): T => {
    try {
      const el = context
        ? context.querySelector(selector)
        : document.querySelector(selector);
      return el ? extractor(el) : fallback;
    } catch (e) {
      console.warn(`[X Scraper] Failed to query ${selector}:`, e);
      return fallback;
    }
  };

  // Helper: Parse number from text (e.g., "1.2K" → 1200)
  const parseNumber = (text: string): number => {
    const match = text.match(/[\d.,]+/);
    if (!match) return 0;

    const num = parseFloat(match[0].replace(/,/g, ''));
    if (text.includes('K')) return Math.round(num * 1000);
    if (text.includes('M')) return Math.round(num * 1000000);
    return Math.round(num);
  };

  // Extract name
  const name = safeQuery(
    X_SELECTORS.name,
    (el) => el.textContent?.trim() || '',
    'Unknown'
  );

  // Extract handle (@username)
  const handle = safeQuery(
    X_SELECTORS.handle,
    (el) => {
      const text = el.textContent?.trim() || '';
      return text.startsWith('@') ? text : '@' + text;
    },
    ''
  );

  // Extract bio
  const bio = safeQuery(
    X_SELECTORS.bio,
    (el) => el.textContent?.trim() || '',
    ''
  );

  // Extract location
  const location = safeQuery(
    X_SELECTORS.location,
    (el) => el.textContent?.trim() || undefined,
    undefined
  );

  // Extract followers count
  const followers = safeQuery(
    X_SELECTORS.followers,
    (el) => parseNumber(el.textContent || ''),
    undefined
  );

  // Extract verified status
  const verified = safeQuery(
    X_SELECTORS.verified,
    () => true,
    false
  );

  // Extract recent posts (last 10)
  const posts: Post[] = [];
  const tweetElements = document.querySelectorAll(X_SELECTORS.tweets);

  for (let i = 0; i < Math.min(tweetElements.length, 10); i++) {
    const tweet = tweetElements[i];

    // Extract tweet text
    const text = safeQuery(
      X_SELECTORS.tweetText,
      (el) => el.textContent?.trim() || '',
      '',
      tweet
    );

    // Extract likes
    const likes = safeQuery(
      X_SELECTORS.tweetLikes,
      (el) => parseNumber(el.textContent || ''),
      0,
      tweet
    );

    // Extract retweets
    const retweets = safeQuery(
      X_SELECTORS.tweetRetweets,
      (el) => parseNumber(el.textContent || ''),
      0,
      tweet
    );

    // Extract timestamp
    const timestamp = safeQuery<Date>(
      X_SELECTORS.tweetTime,
      (el) => {
        const datetime = (el as HTMLElement).getAttribute('datetime');
        return datetime ? new Date(datetime) : new Date();
      },
      new Date(),
      tweet
    );

    if (text) {
      posts.push({ text, likes, retweets, timestamp });
    }
  }

  const profileData: ProfileData = {
    name,
    handle,
    bio,
    location,
    followers,
    verified,
    recentPosts: posts.length > 0 ? posts : undefined,
  };

  console.log('[X Scraper] Scraped profile:', profileData);
  return profileData;
}

// Tier 1: LinkedIn DOM scraper
async function scrapeLinkedInProfile(): Promise<ProfileData> {
  // TODO: Implement LinkedIn DOM scraper
  throw new Error('LinkedIn scraper not yet implemented');
}

// Tier 2: Accessibility tree fallback
async function scrapeViaAccessibilityTree(
  platform: Platform
): Promise<ProfileData> {
  // TODO: Implement accessibility tree scraper
  throw new Error('Accessibility tree scraper not yet implemented');
}

// Tier 3: Screenshot + Vision fallback
async function scrapeViaScreenshot(platform: Platform): Promise<ProfileData> {
  // TODO: Implement screenshot + vision scraper
  throw new Error('Screenshot scraper not yet implemented');
}
