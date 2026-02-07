import {browser} from "wxt/browser";
import ExtMessage, {MessageFrom, MessageType} from "@/entrypoints/types.ts";

// Profile URL pattern matching
const PROFILE_PATTERNS = {
  x: /^https:\/\/(?:x\.com|twitter\.com)\/[^\/]+\/?$/,
  linkedin: /^https:\/\/www\.linkedin\.com\/in\/[^\/]+\/?$/
};

function isProfileURL(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;

    // Check X/Twitter profiles: x.com/username
    if (urlObj.hostname === 'x.com' || urlObj.hostname === 'twitter.com') {
      // Match pattern: /username or /username/ (but not /username/followers, etc.)
      const parts = pathname.split('/').filter(Boolean);
      return parts.length === 1 || (parts.length === 2 && parts[1] === 'with_replies');
    }

    // Check LinkedIn profiles: linkedin.com/in/username
    if (urlObj.hostname === 'www.linkedin.com') {
      return pathname.startsWith('/in/') && pathname.split('/').filter(Boolean).length === 2;
    }

    return false;
  } catch {
    return false;
  }
}

export default defineBackground(() => {
    console.log('Reply Guy background script initialized', {id: browser.runtime.id});

    // Configure side panel behavior
    // @ts-ignore
    browser.sidePanel.setPanelBehavior({openPanelOnActionClick: true}).catch((error: unknown) => {
      console.error('[SidePanel] Failed to set behavior:', error);
    });

    // Handle keyboard shortcut: Cmd+Shift+R / Ctrl+Shift+R
    browser.commands.onCommand.addListener(async (command) => {
      if (command === 'toggle-side-panel') {
        console.log('[Command] Toggle side panel command received');

        try {
          // Get current active tab
          const [tab] = await browser.tabs.query({ active: true, currentWindow: true });

          if (!tab.id) {
            console.warn('[Command] No active tab found');
            return;
          }

          // Toggle side panel by opening it
          // Note: Chrome doesn't have a close() method, so we just open it
          await browser.sidePanel.open({ tabId: tab.id });
          console.log('[Command] Side panel opened');
        } catch (error) {
          console.error('[Command] Failed to toggle side panel:', error);
        }
      }
    });

    // Auto-open side panel on profile navigation
    browser.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
      // Only run when page is fully loaded
      if (changeInfo.status !== 'complete' || !tab.url) return;

      // Check if URL is a profile page
      if (isProfileURL(tab.url)) {
        console.log('[SidePanel] Profile detected, opening side panel:', tab.url);

        try {
          // Open side panel
          await browser.sidePanel.open({ tabId });
          console.log('[SidePanel] Side panel opened successfully');
        } catch (error) {
          console.error('[SidePanel] Failed to open side panel:', error);
        }
      }
    });

    // Monitor extension icon click
    browser.action.onClicked.addListener(async (tab) => {
      console.log('[Action] Extension icon clicked', tab);

      try {
        await browser.tabs.sendMessage(tab.id!, {messageType: MessageType.clickExtIcon});
      } catch (error) {
        console.error('[Action] Failed to send message to content script:', error);
      }
    });

    // Handle messages from content scripts
    browser.runtime.onMessage.addListener(async (message: ExtMessage | { type: string; platform?: string; url?: string; timestamp?: number; data?: any }, sender, sendResponse) => {
      console.log('[Message] Received:', message);

      // Handle Reply Guy profile detection
      if (message.type === 'PROFILE_DETECTED') {
        console.log('[Profile Detection] Profile detected:', {
          platform: message.platform,
          url: message.url,
          timestamp: message.timestamp
        });

        // Trigger scraping by sending SCRAPE_PROFILE to content script
        if (sender.tab?.id) {
          try {
            await browser.tabs.sendMessage(sender.tab.id, { type: 'SCRAPE_PROFILE' });
            console.log('[Profile Detection] Sent SCRAPE_PROFILE to content script');
          } catch (error) {
            console.error('[Profile Detection] Failed to send SCRAPE_PROFILE:', error);
          }
        }

        return true;
      }

      // Handle scraped profile data from content script
      if (message.type === 'PROFILE_DATA') {
        console.log('[Profile Data] Received profile data:', {
          platform: message.platform,
          url: message.url,
          data: message.data
        });

        // Forward to side panel
        try {
          // Send to side panel (and all extension pages)
          await chrome.runtime.sendMessage({
            type: 'PROFILE_DATA',
            data: message.data,
            platform: message.platform,
            url: message.url,
            timestamp: message.timestamp
          });
          console.log('[Profile Data] Forwarded to side panel');
        } catch (error) {
          console.error('[Profile Data] Failed to forward to side panel:', error);
        }

        return true;
      }

      // Handle legacy messages from starter template
      if ('messageType' in message) {
        if (message.messageType === MessageType.clickExtIcon) {
          console.log('[Message] Extension icon clicked, message handled');
          return true;
        } else if (message.messageType === MessageType.changeTheme || message.messageType === MessageType.changeLocale) {
          // Broadcast theme/locale changes to all tabs
          const tabs = await browser.tabs.query({active: true, currentWindow: true});
          console.log(`[Message] Broadcasting to ${tabs.length} tabs`);

          if (tabs) {
            for (const tab of tabs) {
              try {
                await browser.tabs.sendMessage(tab.id!, message);
              } catch (error) {
                console.error(`[Message] Failed to send to tab ${tab.id}:`, error);
              }
            }
          }
        }
      }

      return false;
    });
});
