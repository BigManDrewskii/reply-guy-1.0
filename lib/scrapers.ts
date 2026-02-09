import type { PageData } from '@/types';
import { getMeta } from '@/lib/utils/meta';

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
        bodyText: article.textContent.substring(0, 3000),
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
  const bodyText = document.body?.innerText?.substring(0, 3000) || '';
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
