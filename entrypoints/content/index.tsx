// Reply Guy Content Script
// Detects profile pages and scrapes profile data

import { scrapeProfile } from '@/lib/scraper/strategy';

export default defineContentScript({
  matches: ['*://x.com/*', '*://twitter.com/*', '*://www.linkedin.com/*'],
  main() {
    console.log('[Reply Guy] Content script loaded');

    // Platform detection
    function detectPlatform(): 'x' | 'linkedin' | null {
      const hostname = window.location.hostname;

      if (hostname === 'x.com' || hostname === 'twitter.com') {
        return 'x';
      }

      if (hostname === 'www.linkedin.com') {
        return 'linkedin';
      }

      return null;
    }

    // Profile URL detection
    function isProfileURL(url: string): boolean {
      try {
        const urlObj = new URL(url);

        // X/Twitter profiles
        if (urlObj.hostname === 'x.com' || urlObj.hostname === 'twitter.com') {
          const pathname = urlObj.pathname;
          const parts = pathname.split('/').filter(Boolean);
          // Match: /username or /username/with_replies
          return parts.length === 1 || (parts.length === 2 && parts[1] === 'with_replies');
        }

        // LinkedIn profiles
        if (urlObj.hostname === 'www.linkedin.com') {
          const pathname = urlObj.pathname;
          return pathname.startsWith('/in/') && pathname.split('/').filter(Boolean).length === 2;
        }

        return false;
      } catch {
        return false;
      }
    }

    // Send profile detection to background
    function notifyProfileDetection(platform: 'x' | 'linkedin') {
      chrome.runtime.sendMessage({
        type: 'PROFILE_DETECTED',
        platform,
        url: window.location.href,
        timestamp: Date.now()
      }).catch((error) => {
        console.error('[Reply Guy] Failed to send profile detection:', error);
      });
    }

    // Initial page load detection
    function onPageLoad() {
      const platform = detectPlatform();

      if (platform && isProfileURL(window.location.href)) {
        console.log(`[Reply Guy] Profile page detected: ${platform}`);
        notifyProfileDetection(platform);
      }
    }

    // SPA navigation detection (X/Twitter are SPAs)
    function setupNavigationObserver() {
      // Detect URL changes via MutationObserver (for SPAs)
      let lastUrl = window.location.href;

      const observer = new MutationObserver(() => {
        const currentUrl = window.location.href;

        if (currentUrl !== lastUrl) {
          console.log(`[Reply Guy] URL changed: ${lastUrl} → ${currentUrl}`);
          lastUrl = currentUrl;

          // Check if new URL is a profile page
          const platform = detectPlatform();
          if (platform && isProfileURL(currentUrl)) {
            console.log(`[Reply Guy] Navigated to profile page: ${platform}`);
            notifyProfileDetection(platform);
          }
        }
      });

      // Observe document changes
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      console.log('[Reply Guy] Navigation observer setup complete');
    }

    // Listen for messages from background/side panel
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      console.log('[Reply Guy] Received message:', message);

      if (message.type === 'SCRAPE_PROFILE') {
        const platform = detectPlatform();

        if (!platform) {
          sendResponse({
            success: false,
            error: 'Platform not detected',
            platform: null
          });
          return true;
        }

        console.log(`[Reply Guy] Starting profile scrape for ${platform}...`);

        // Call scraper and send result to background
        scrapeProfile(platform)
          .then((profileData) => {
            console.log('[Reply Guy] Profile scraped successfully:', profileData);

            // Send scraped data to background
            chrome.runtime.sendMessage({
              type: 'PROFILE_DATA',
              data: profileData,
              platform,
              url: window.location.href,
              timestamp: Date.now()
            }).catch((error) => {
              console.error('[Reply Guy] Failed to send profile data:', error);
            });

            sendResponse({
              success: true,
              data: profileData,
              platform
            });
          })
          .catch((error) => {
            console.error('[Reply Guy] Scrape failed:', error);

            sendResponse({
              success: false,
              error: error instanceof Error ? error.message : 'Unknown error',
              platform
            });
          });

        return true; // Async response
      }

      return false;
    });

    // Initialize content script
    onPageLoad();
    setupNavigationObserver();

    console.log('[Reply Guy] Content script initialized');
  }
});
