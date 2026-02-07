// Scraping Strategy - Three-tier fallback chain
import type { ProfileData, Post } from '../db';
import { X_SELECTORS } from './selectors/x';
import { LINKEDIN_SELECTORS } from './selectors/linkedin';

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
  console.log('[LinkedIn Scraper] Starting DOM scrape...');

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
      console.warn(`[LinkedIn Scraper] Failed to query ${selector}:`, e);
      return fallback;
    }
  };

  // Helper: Parse number from text (e.g., "1,234" → 1234, "1.2K" → 1200)
  const parseNumber = (text: string): number => {
    const match = text.match(/[\d.,]+/);
    if (!match) return 0;

    const num = parseFloat(match[0].replace(/,/g, ''));
    if (text.includes('K')) return Math.round(num * 1000);
    if (text.includes('M')) return Math.round(num * 1000000);
    if (text.includes('+')) return Math.round(num); // Handle "500+"
    return Math.round(num);
  };

  // Extract name
  const name = safeQuery(
    LINKEDIN_SELECTORS.name,
    (el) => el.textContent?.trim() || '',
    'Unknown'
  );

  // Extract handle (use profile URL since LinkedIn doesn't have @handles)
  const handle = safeQuery(
    'link[href*="/in/"]',
    (el) => {
      const href = (el as HTMLAnchorElement).getAttribute('href') || '';
      const match = href.match(/\/in\/([^\/]+)/);
      return match ? match[1] : '';
    },
    ''
  );

  // Fallback: get handle from current URL
  const finalHandle = handle || (() => {
    const urlMatch = window.location.pathname.match(/\/in\/([^\/]+)/);
    return urlMatch ? urlMatch[1] : '';
  })();

  // Extract headline (LinkedIn's version of bio/one-liner)
  const headline = safeQuery(
    LINKEDIN_SELECTORS.headline,
    (el) => el.textContent?.trim() || '',
    ''
  );

  // Extract bio (from About section)
  const bio = safeQuery(
    LINKEDIN_SELECTORS.bio,
    (el) => el.textContent?.trim() || headline,
    headline
  );

  // Extract location
  const location = safeQuery(
    LINKEDIN_SELECTORS.location,
    (el) => el.textContent?.trim() || undefined,
    undefined
  );

  // Extract followers count
  const followers = safeQuery(
    LINKEDIN_SELECTORS.followers,
    (el) => parseNumber(el.textContent || ''),
    undefined
  );

  // Extract connections count
  const connections = safeQuery(
    LINKEDIN_SELECTORS.connections,
    (el) => parseNumber(el.textContent || ''),
    undefined
  );

  // Extract experience (last 3 positions)
  const experienceItems = document.querySelectorAll(LINKEDIN_SELECTORS.experienceItem);
  const experience: Array<{ title: string; company: string }> = [];

  for (let i = 0; i < Math.min(experienceItems.length, 3); i++) {
    const item = experienceItems[i];

    const title = safeQuery(
      LINKEDIN_SELECTORS.experienceTitle,
      (el) => el.textContent?.trim() || '',
      '',
      item
    );

    const company = safeQuery(
      LINKEDIN_SELECTORS.experienceCompany,
      (el) => el.textContent?.trim() || '',
      '',
      item
    );

    if (title) {
      experience.push({ title, company });
    }
  }

  // Extract recent posts (last 10)
  const posts: Post[] = [];
  const postElements = document.querySelectorAll(LINKEDIN_SELECTORS.post);

  for (let i = 0; i < Math.min(postElements.length, 10); i++) {
    const post = postElements[i];

    // Extract post text
    const text = safeQuery(
      LINKEDIN_SELECTORS.postText,
      (el) => el.textContent?.trim() || '',
      '',
      post
    );

    // Extract reactions (LinkedIn's version of likes)
    const likes = safeQuery(
      LINKEDIN_SELECTORS.postLikes,
      (el) => {
        const text = el.textContent?.trim() || '';
        // Handle "1,234" or "1.2K" formats
        if (text.includes('K') || text.includes('M')) {
          return parseNumber(text);
        }
        // Handle "1 reaction" or "123 reactions" or "1 like"
        const numMatch = text.match(/(\d+[\d,]*)/);
        return numMatch ? parseNumber(numMatch[1]) : 0;
      },
      0,
      post
    );

    // Extract comments (mapped to retweets field for Post interface)
    const comments = safeQuery(
      LINKEDIN_SELECTORS.postComments,
      (el) => {
        const text = el.textContent?.trim() || '';
        if (text.includes('K') || text.includes('M')) {
          return parseNumber(text);
        }
        // Handle "1 comment" or "123 comments"
        const numMatch = text.match(/(\d+[\d,]*)/);
        return numMatch ? parseNumber(numMatch[1]) : 0;
      },
      0,
      post
    );

    // Extract timestamp
    const timestamp = safeQuery<Date>(
      LINKEDIN_SELECTORS.postTime,
      (el) => {
        const timeText = el.textContent?.trim() || '';
        // Parse relative time like "2d ago", "3h ago", "1w ago"
        if (timeText.includes('d') || timeText.includes('day')) {
          const days = parseInt(timeText) || 1;
          const date = new Date();
          date.setDate(date.getDate() - days);
          return date;
        }
        if (timeText.includes('h') || timeText.includes('hour')) {
          const hours = parseInt(timeText) || 1;
          const date = new Date();
          date.setHours(date.getHours() - hours);
          return date;
        }
        if (timeText.includes('w') || timeText.includes('week')) {
          const weeks = parseInt(timeText) || 1;
          const date = new Date();
          date.setDate(date.getDate() - (weeks * 7));
          return date;
        }
        return new Date();
      },
      new Date(),
      post
    );

    if (text) {
      posts.push({ text, likes, retweets: comments, timestamp });
    }
  }

  const profileData: ProfileData = {
    name,
    handle: finalHandle,
    bio,
    location,
    followers,
    verified: false, // LinkedIn doesn't have verified in the same way
    recentPosts: posts.length > 0 ? posts : undefined,
  };

  console.log('[LinkedIn Scraper] Scraped profile:', profileData);
  return profileData;
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
