import { Readability } from '@mozilla/readability';
import type { PageData } from '@/types';

/**
 * Enhanced generic scraper using Mozilla Readability.
 * Falls back to meta tag extraction if Readability fails.
 */
export function scrapeGeneric(): Partial<PageData> {
  // Try Readability first for better content extraction
  try {
    const documentClone = document.cloneNode(true) as Document;
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
    console.warn('Readability failed, falling back to meta tags:', error);
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
    socialLinks,
    email: emailMatch?.[0] || '',
    ogImage,
    method: 'meta-tags',
    confidence: calculateMetaConfidence(h1, metaDescription, bodyText)
  };
}

/**
 * Generate a stable CSS selector for an element.
 * Priority: data-testid → ID → stable classes → tag
 */
export function generateSelector(element: Element): string {
  // Priority 1: data-testid (most stable)
  const testId = element.getAttribute('data-testid');
  if (testId) {
    return `[data-testid="${testId}"]`;
  }

  // Priority 2: ID
  if (element.id) {
    return `#${element.id}`;
  }

  // Priority 3: Classes (filter out utility classes)
  const classes = element.className
    .split(' ')
    .filter(c => {
      const trimmed = c.trim();
      if (!trimmed) return false;

      // Filter out Tailwind utilities and pseudo-classes
      if (trimmed.includes(':')) return false;
      if (/^(active|hover|focus|visited|link)$/.test(trimmed)) return false;

      // Keep semantic classes
      return true;
    })
    .slice(0, 2); // Limit to 2 most specific classes

  if (classes.length > 0) {
    return `${element.tagName.toLowerCase()}.${classes.join('.')}`;
  }

  // Fallback: tag name
  return element.tagName.toLowerCase();
}

/**
 * Calculate confidence score for Readability results.
 */
function calculateGenericConfidence(article: Readability.ReturnType | null): number {
  if (!article) return 30;

  let score = 50;

  // Content length
  if (article.textContent && article.textContent.length > 500) score += 10;
  if (article.textContent && article.textContent.length > 1500) score += 10;

  // Has title
  if (article.title) score += 10;

  // Has excerpt
  if (article.excerpt) score += 10;

  // Has byline
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

/**
 * Get meta tag content by name or property.
 */
function getMeta(name: string): string {
  return (
    document.querySelector(`meta[name="${name}"]`) ||
    document.querySelector(`meta[property="${name}"]`)
  )?.getAttribute('content') || '';
}
