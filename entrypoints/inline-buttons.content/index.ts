import './style.css';

/**
 * Inline Timeline Buttons — Injects a Reply Guy icon into X (Twitter) tweet action bars.
 * Clicking the icon opens the side panel with context about that tweet's author.
 *
 * Uses createIntegratedUi (not shadow root) so the button blends with X's native styles.
 * A MutationObserver watches for dynamically loaded tweets in the infinite scroll timeline.
 */
export default defineContentScript({
  matches: ['*://x.com/*', '*://twitter.com/*'],
  runAt: 'document_idle',

  main(ctx) {
    const PROCESSED_ATTR = 'data-reply-guy-injected';
    const ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M14 9l-2 2-2-2"/><path d="M12 11v-4"/></svg>`;

    /**
     * Inject a Reply Guy button into a tweet's action bar.
     */
    function injectButton(actionBar: Element) {
      if (actionBar.getAttribute(PROCESSED_ATTR)) return;
      actionBar.setAttribute(PROCESSED_ATTR, 'true');

      // Find the parent tweet element to extract author info
      const tweetEl = actionBar.closest('article[data-testid="tweet"]');
      if (!tweetEl) return;

      // Create the button
      const btn = document.createElement('button');
      btn.className = 'reply-guy-inline-btn';
      btn.innerHTML = ICON_SVG;
      btn.setAttribute('aria-label', 'Analyze with Reply Guy');
      btn.setAttribute('type', 'button');

      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        // Extract the tweet author's profile link
        const authorLink = tweetEl.querySelector('a[role="link"][href^="/"]');
        const authorHref = authorLink?.getAttribute('href');

        if (authorHref) {
          const profileUrl = `https://x.com${authorHref.split('/status')[0]}`;

          // Send message to background to open side panel with this profile
          chrome.runtime.sendMessage({
            type: 'OPEN_SIDEPANEL_FOR_PROFILE',
            profileUrl,
          }).catch(() => {});
        } else {
          // Fallback: just open the side panel
          chrome.runtime.sendMessage({
            type: 'OPEN_SIDEPANEL',
          }).catch(() => {});
        }

        // Visual feedback
        btn.classList.add('processing');
        ctx.setTimeout(() => {
          btn.classList.remove('processing');
        }, 2000);
      });

      // Append to the action bar (after the existing action buttons)
      const wrapper = document.createElement('div');
      wrapper.style.display = 'flex';
      wrapper.style.alignItems = 'center';
      wrapper.appendChild(btn);
      actionBar.appendChild(wrapper);
    }

    /**
     * Scan the page for tweet action bars and inject buttons.
     */
    function scanAndInject() {
      const actionBars = document.querySelectorAll(
        `article[data-testid="tweet"] [role="group"]:not([${PROCESSED_ATTR}])`
      );
      actionBars.forEach(injectButton);
    }

    // Initial scan
    ctx.setTimeout(scanAndInject, 1000);

    // Watch for new tweets loaded via infinite scroll
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;

    const observer = new MutationObserver(() => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = ctx.setTimeout(() => {
        debounceTimer = null;
        scanAndInject();
      }, 300);
    });

    // Start observing once the timeline container exists
    const startObserving = () => {
      const timeline = document.querySelector('main') || document.body;
      observer.observe(timeline, {
        childList: true,
        subtree: true,
      });
    };

    ctx.setTimeout(startObserving, 1500);

    // Cleanup on context invalidation
    ctx.onInvalidated(() => {
      observer.disconnect();
      if (debounceTimer) clearTimeout(debounceTimer);
      // Remove all injected buttons
      document.querySelectorAll(`.reply-guy-inline-btn`).forEach(el => {
        el.parentElement?.remove();
      });
    });
  },
});
