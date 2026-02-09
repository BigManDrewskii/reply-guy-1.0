import type { PageData } from '@/types';
import { getMeta } from '@/lib/utils/meta';

/**
 * Scrape LinkedIn profile data from the current page.
 * Handles both /in/ profile pages and /company/ pages.
 */
export function scrapeLinkedIn(): Partial<PageData> {
  const url = window.location.href;
  const isProfile = /linkedin\.com\/in\//.test(url);
  const isCompany = /linkedin\.com\/company\//.test(url);

  const data: Partial<PageData> = {
    platform: 'linkedin',
  };

  if (isProfile) {
    // Profile name
    const nameEl =
      document.querySelector('.text-heading-xlarge') ||
      document.querySelector('h1.top-card-layout__title') ||
      document.querySelector('[data-anonymize="person-name"]') ||
      document.querySelector('h1');
    data.name = nameEl?.textContent?.trim() || getMeta('profile:first_name') + ' ' + getMeta('profile:last_name') || '';

    // Headline
    const headlineEl =
      document.querySelector('.text-body-medium.break-words') ||
      document.querySelector('.top-card-layout__headline') ||
      document.querySelector('[data-anonymize="headline"]');
    data.headline = headlineEl?.textContent?.trim() || '';

    // Location
    const locationEl =
      document.querySelector('.text-body-small.inline.t-black--light.break-words') ||
      document.querySelector('.top-card-layout__first-subline');
    data.location = locationEl?.textContent?.trim() || '';

    // About section
    const aboutEl =
      document.querySelector('#about ~ .display-flex .inline-show-more-text') ||
      document.querySelector('.pv-about-section .pv-about__summary-text') ||
      document.querySelector('[data-anonymize="about-description"]');
    data.about = aboutEl?.textContent?.trim()?.substring(0, 1500) || '';

    // Connection degree
    const connectionEl = document.querySelector('.dist-value') ||
      document.querySelector('.distance-badge .dist-value');
    data.connectionDegree = connectionEl?.textContent?.trim() || '';

    // Experience
    const experienceItems = document.querySelectorAll(
      '#experience ~ .pvs-list__outer-container .pvs-entity, ' +
      '.experience-section .pv-entity__summary-info, ' +
      '.pv-profile-section__card-item-v2'
    );
    data.experience = Array.from(experienceItems)
      .slice(0, 5)
      .map(el => {
        const title = el.querySelector('.t-bold span, .pv-entity__secondary-title')?.textContent?.trim() || '';
        const company = el.querySelector('.t-normal span, .pv-entity__company-summary-info span')?.textContent?.trim() || '';
        return [title, company].filter(Boolean).join(' at ');
      })
      .filter(Boolean);

    // Skills
    const skillItems = document.querySelectorAll(
      '#skills ~ .pvs-list__outer-container .pvs-entity span[aria-hidden="true"], ' +
      '.pv-skill-category-entity__name-text'
    );
    data.skills = Array.from(skillItems)
      .slice(0, 10)
      .map(el => el.textContent?.trim() || '')
      .filter(Boolean);

    // Recent posts/activity
    const activityItems = document.querySelectorAll(
      '.feed-shared-update-v2__description, ' +
      '.pv-recent-activity-section__card-subtitle'
    );
    data.recentPosts = Array.from(activityItems)
      .slice(0, 5)
      .map(el => el.textContent?.trim()?.substring(0, 300) || '')
      .filter(Boolean);

    // Followers
    const followersEl = document.querySelector('.t-bold:has(+ .t-black--light)') ||
      document.querySelector('[data-anonymize="connections-count"]');
    data.followers = followersEl?.textContent?.trim() || '';

    data.isProfile = true;
    data.confidence = calculateLinkedInConfidence(data);
  } else if (isCompany) {
    // Company page
    data.name = document.querySelector('h1 span')?.textContent?.trim() || getMeta('og:title') || '';
    data.headline = document.querySelector('.org-top-card-summary__tagline')?.textContent?.trim() || '';
    data.about = document.querySelector('.org-about-us-organization-description__text')?.textContent?.trim()?.substring(0, 1500) || '';
    data.isProfile = false;
    data.confidence = 50;
  } else {
    // LinkedIn article or other page
    data.name = getMeta('og:title') || document.querySelector('h1')?.textContent?.trim() || '';
    data.bodyText = document.querySelector('.article-content')?.textContent?.trim()?.substring(0, 2000) || '';
    data.confidence = 40;
  }

  // Common LinkedIn meta
  data.ogImage = getMeta('og:image');
  data.ogTitle = getMeta('og:title');
  data.ogDescription = getMeta('og:description');

  return data;
}

/**
 * Enhanced generic scraper using meta tags and content extraction.
 * Falls back gracefully when Readability is not available.
 */
export function scrapeGeneric(): Partial<PageData> {
  // Try Readability first for better content extraction
  try {
    // Dynamic import check — Readability may not be bundled
    const documentClone = document.cloneNode(true) as Document;
    const { Readability } = require('@mozilla/readability');
    const article = new Readability(documentClone).parse();

    if (article && article.textContent) {
      return {
        h1: article.title,
        bodyText: article.textContent.substring(0, 2000),
        excerpt: article.excerpt || '',
        byline: article.byline || '',
        method: 'readability',
        confidence: calculateGenericConfidence(article)
      };
    }
  } catch (error) {
    // Readability not available or failed, fall through to meta tags
  }

  // Fallback to meta tag extraction
  const h1 = document.querySelector('h1')?.textContent?.trim() || '';
  const metaDescription = getMeta('description');
  const ogTitle = getMeta('og:title');
  const ogDescription = getMeta('og:description');
  const ogImage = getMeta('og:image');

  // Extract social links
  const socialLinks = Array.from(document.querySelectorAll('a[href]'))
    .map(a => a.getAttribute('href') || '')
    .filter(href =>
      /x\.com|twitter\.com|linkedin\.com|github\.com/.test(href)
    ).slice(0, 5);

  // Extract email
  const bodyText = document.body?.innerText?.substring(0, 2000) || '';
  const emailMatch = bodyText.match(/[\w.-]+@[\w.-]+\.\w+/);

  return {
    h1: h1 || ogTitle || '',
    bodyText,
    metaDescription,
    ogDescription,
    ogImage,
    socialLinks,
    email: emailMatch?.[0] || '',
    method: 'meta-tags',
    confidence: calculateMetaConfidence(h1, metaDescription, bodyText)
  };
}

/**
 * Generate a stable CSS selector for an element.
 */
export function generateSelector(element: Element): string {
  const testId = element.getAttribute('data-testid');
  if (testId) return `[data-testid="${testId}"]`;

  if (element.id) return `#${element.id}`;

  const classes = element.className
    .split(' ')
    .filter(c => {
      const trimmed = c.trim();
      if (!trimmed) return false;
      if (trimmed.includes(':')) return false;
      if (/^(active|hover|focus|visited|link)$/.test(trimmed)) return false;
      return true;
    })
    .slice(0, 2);

  if (classes.length > 0) {
    return `${element.tagName.toLowerCase()}.${classes.join('.')}`;
  }

  return element.tagName.toLowerCase();
}

/**
 * Calculate confidence score for LinkedIn profile data.
 */
function calculateLinkedInConfidence(data: Partial<PageData>): number {
  let score = 40;

  if (data.name && data.name.length > 2) score += 10;
  if (data.headline) score += 10;
  if (data.about && data.about.length > 50) score += 10;
  if (data.experience && data.experience.length > 0) score += 10;
  if (data.skills && data.skills.length > 0) score += 5;
  if (data.recentPosts && data.recentPosts.length > 0) score += 10;
  if (data.location) score += 5;

  return Math.min(score, 100);
}

/**
 * Calculate confidence score for Readability results.
 */
function calculateGenericConfidence(article: any): number {
  if (!article) return 30;

  let score = 50;
  if (article.textContent && article.textContent.length > 500) score += 10;
  if (article.textContent && article.textContent.length > 1500) score += 10;
  if (article.title) score += 10;
  if (article.excerpt) score += 10;
  if (article.byline) score += 10;

  return Math.min(score, 100);
}

/**
 * Calculate confidence score for meta tag extraction.
 */
function calculateMetaConfidence(h1: string, metaDescription: string, bodyText: string): number {
  let score = 30;

  if (h1) score += 15;
  if (metaDescription) score += 15;
  if (bodyText && bodyText.length > 500) score += 20;
  if (bodyText && bodyText.length > 1500) score += 20;

  return Math.min(score, 100);
}
