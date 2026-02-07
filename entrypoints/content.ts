export default defineContentScript({
  matches: ['<all_urls>'],  // Run on EVERY page
  runAt: 'document_idle',

  main() {
    // Scrape on load
    scrapeAndSend();

    // Re-scrape when background asks (tab change, navigation)
    chrome.runtime.onMessage.addListener((message) => {
      if (message.type === 'SCRAPE_PAGE') {
        scrapeAndSend();
      }
    });

    // Watch for SPA navigation
    let lastUrl = location.href;
    const observer = new MutationObserver(() => {
      if (location.href !== lastUrl) {
        lastUrl = location.href;
        setTimeout(scrapeAndSend, 500); // Wait for SPA content to render
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  },
});

function scrapeAndSend() {
  const data = scrapePage();
  chrome.runtime.sendMessage({ type: 'PAGE_DATA', data }).catch(() => {});
}

function scrapePage() {
  const url = location.href;
  const hostname = location.hostname;

  // Detect platform for enhanced scraping
  const platform = detectPlatform(hostname);

  // Base data available on ALL pages
  const base = {
    url,
    hostname,
    platform,
    title: document.title,
    metaDescription: getMeta('description'),
    ogTitle: getMeta('og:title'),
    ogDescription: getMeta('og:description'),
    ogImage: getMeta('og:image'),
    author: getMeta('author') || getMeta('article:author'),
    scrapedAt: new Date().toISOString(),
  };

  // Platform-specific enhanced scraping
  if (platform === 'x') return { ...base, ...scrapeX() };
  if (platform === 'linkedin') return { ...base, ...scrapeLinkedIn() };
  if (platform === 'github') return { ...base, ...scrapeGitHub() };

  // Generic: grab visible text content for context
  return { ...base, ...scrapeGeneric() };
}

function detectPlatform(hostname: string) {
  if (hostname.includes('x.com') || hostname.includes('twitter.com')) return 'x';
  if (hostname.includes('linkedin.com')) return 'linkedin';
  if (hostname.includes('github.com')) return 'github';
  if (hostname.includes('dribbble.com')) return 'dribbble';
  if (hostname.includes('behance.net')) return 'behance';
  return 'generic';
}

function getMeta(name: string): string {
  const el =
    document.querySelector(`meta[name="${name}"]`) ||
    document.querySelector(`meta[property="${name}"]`);
  return el?.getAttribute('content') || '';
}

function scrapeX() {
  // Enhanced X profile scraping using data-testid selectors
  try {
    return {
      name: document.querySelector('[data-testid="UserName"] span')?.textContent || '',
      handle: document.querySelector('[data-testid="UserName"] + div span')?.textContent || '',
      bio: document.querySelector('[data-testid="UserDescription"]')?.textContent || '',
      location: document.querySelector('[data-testid="UserLocation"]')?.textContent || '',
      website: document.querySelector('[data-testid="UserUrl"] a')?.getAttribute('href') || '',
      followers: document.querySelector('[href$="/followers"] span')?.textContent || '',
      following: document.querySelector('[href$="/following"] span')?.textContent || '',
      verified: !!document.querySelector('[data-testid="icon-verified"]'),
      recentPosts: Array.from(document.querySelectorAll('[data-testid="tweetText"]'))
        .slice(0, 8)
        .map(el => el.textContent || ''),
      isProfile: true,
    };
  } catch {
    return { isProfile: false };
  }
}

function scrapeLinkedIn() {
  try {
    return {
      name: document.querySelector('.text-heading-xlarge')?.textContent?.trim() || '',
      headline: document.querySelector('.text-body-medium.break-words')?.textContent?.trim() || '',
      location: document.querySelector('.text-body-small.inline.t-black--light.break-words')?.textContent?.trim() || '',
      about: document.querySelector('#about ~ div .visually-hidden + span')?.textContent?.trim() || '',
      company: document.querySelector('.experience-item .t-bold span')?.textContent?.trim() || '',
      connections: document.querySelector('.t-bold + .t-black--light')?.textContent?.trim() || '',
      isProfile: !!document.querySelector('.text-heading-xlarge'),
    };
  } catch {
    return { isProfile: false };
  }
}

function scrapeGitHub() {
  try {
    return {
      name: document.querySelector('.p-name')?.textContent?.trim() || '',
      handle: document.querySelector('.p-nickname')?.textContent?.trim() || '',
      bio: document.querySelector('.p-note .js-user-profile-bio')?.textContent?.trim() || '',
      location: document.querySelector('[itemprop="homeLocation"]')?.textContent?.trim() || '',
      company: document.querySelector('[itemprop="worksFor"]')?.textContent?.trim() || '',
      website: document.querySelector('[itemprop="url"] a')?.getAttribute('href') || '',
      repos: document.querySelector('.Counter')?.textContent?.trim() || '',
      followers: document.querySelector('a[href$="followers"] span')?.textContent?.trim() || '',
      isProfile: !!document.querySelector('.p-name'),
    };
  } catch {
    return { isProfile: false };
  }
}

function scrapeGeneric() {
  // Get readable text content from the page (first ~2000 chars)
  const bodyText = document.body.innerText.substring(0, 3000);

  // Try to find any profile-like info
  const h1 = document.querySelector('h1')?.textContent?.trim() || '';
  const h2 = document.querySelector('h2')?.textContent?.trim() || '';

  // Look for social links
  const socialLinks = Array.from(document.querySelectorAll('a[href]'))
    .map(a => a.getAttribute('href') || '')
    .filter(href =>
      href.includes('twitter.com') || href.includes('x.com') ||
      href.includes('linkedin.com') || href.includes('github.com')
    )
    .slice(0, 5);

  // Look for email
  const emailMatch = bodyText.match(/[\w.-]+@[\w.-]+\.\w+/);

  return {
    h1,
    h2,
    bodyText: bodyText.substring(0, 2000), // Trim for token budget
    socialLinks,
    email: emailMatch?.[0] || '',
    isProfile: false,
  };
}
