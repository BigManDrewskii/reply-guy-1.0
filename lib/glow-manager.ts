/**
 * Manages the viewport glow visualization for page analysis.
 * Uses shadow DOM for CSS isolation and fixed positioning for performance.
 */

export type GlowState = 'idle' | 'analyzing' | 'complete' | 'error' | 'low-confidence';

let glowContainer: HTMLDivElement | null = null;
let shadowRoot: ShadowRoot | null = null;
let glowFrame: HTMLDivElement | null = null;
let fadeTimeout: number | null = null;

/**
 * Initialize the glow overlay container with shadow DOM.
 */
export function initializeGlow(): void {
  if (glowContainer) return; // Already initialized

  try {
    glowContainer = document.createElement('div');
    glowContainer.id = 'reply-guy-overlay';

    shadowRoot = glowContainer.attachShadow({ mode: 'open' });

    // Inject styles
    const style = document.createElement('style');
    style.textContent = getGlowStyles();
    shadowRoot.appendChild(style);

    // Create glow frame
    glowFrame = document.createElement('div');
    glowFrame.className = 'viewport-glow';
    glowFrame.id = 'rg-viewport-glow';
    shadowRoot.appendChild(glowFrame);

    document.body.appendChild(glowContainer);
  } catch (error) {
    console.warn('Failed to initialize glow:', error);
    cleanup();
  }
}

/**
 * Update the glow state (color, animation).
 */
export function updateGlowState(state: GlowState): void {
  if (!glowFrame) return;

  // Clear any pending fade
  if (fadeTimeout) {
    window.clearTimeout(fadeTimeout);
    fadeTimeout = null;
  }

  // Update class for CSS state
  glowFrame.className = `viewport-glow ${state}`;

  // Auto-fade complete state after 10s, unless persistent glow is enabled
  if (state === 'complete') {
    chrome.storage.local.get('reply-guy-storage', (result) => {
      const storage = result['reply-guy-storage'];
      const persistentGlow = storage?.state?.persistentGlow ?? false;

      if (!persistentGlow) {
        fadeTimeout = window.setTimeout(() => {
          updateGlowState('idle');
        }, 10000);
      }
    });
  }
}

/**
 * Remove the glow overlay and clean up.
 */
export function removeGlow(): void {
  cleanup();
}

/**
 * Internal cleanup function.
 */
function cleanup(): void {
  if (fadeTimeout) {
    window.clearTimeout(fadeTimeout);
    fadeTimeout = null;
  }

  glowContainer?.remove();
  glowContainer = null;
  shadowRoot = null;
  glowFrame = null;
}

/**
 * Get CSS styles for the glow effect.
 */
function getGlowStyles(): string {
  return `
    .viewport-glow {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      pointer-events: none;
      z-index: 2147483647;
      transition: box-shadow 0.3s ease;
      will-change: box-shadow;
    }

    .viewport-glow.idle {
      box-shadow: none;
    }

    .viewport-glow.analyzing {
      box-shadow: inset 0 0 60px 20px rgba(0, 112, 243, 0.4);
      animation: pulse-glow 2s ease-in-out infinite;
    }

    .viewport-glow.complete {
      box-shadow: inset 0 0 40px 10px rgba(0, 200, 83, 0.3);
      animation: none;
    }

    .viewport-glow.error {
      box-shadow: inset 0 0 60px 20px rgba(238, 0, 0, 0.4);
      animation: none;
    }

    .viewport-glow.low-confidence {
      box-shadow: inset 0 0 60px 20px rgba(255, 193, 7, 0.4);
      animation: none;
    }

    @keyframes pulse-glow {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.6;
      }
    }
  `;
}
