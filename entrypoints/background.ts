import { handleFollowUpAlarm } from '@/lib/follow-up';

export default defineBackground(() => {
  // Open side panel when extension icon is clicked
  chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch(console.error);

  // Relay page data from content script → side panel via chrome.storage.session
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'PAGE_DATA') {
      chrome.storage.session.set({ currentPageData: message.data });
    }

    // Inline button: open side panel for a specific profile
    if (message.type === 'OPEN_SIDEPANEL_FOR_PROFILE') {
      const tabId = sender.tab?.id;
      if (!tabId) return;

      // Navigate the tab to the profile URL, then open the side panel
      chrome.tabs.update(tabId, { url: message.profileUrl }).then(() => {
        chrome.sidePanel.open({ tabId }).catch(console.error);
      }).catch(console.error);
    }

    // Inline button: just open the side panel
    if (message.type === 'OPEN_SIDEPANEL') {
      const tabId = sender.tab?.id;
      if (tabId) {
        chrome.sidePanel.open({ tabId }).catch(console.error);
      }
    }

    return true;
  });

  // Re-scrape when tab completes loading
  chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
    if (changeInfo.status === 'complete') {
      chrome.tabs.sendMessage(tabId, { type: 'SCRAPE_PAGE' }).catch(() => {});
    }
  });

  // Re-scrape when user switches tabs
  chrome.tabs.onActivated.addListener((activeInfo) => {
    chrome.tabs.sendMessage(activeInfo.tabId, { type: 'SCRAPE_PAGE' }).catch(() => {});
  });

  // Handle follow-up alarm reminders
  chrome.alarms.onAlarm.addListener(async (alarm) => {
    if (!alarm.name.startsWith('followup-')) return;

    try {
      const followUp = await handleFollowUpAlarm(alarm.name);
      if (!followUp) return;

      // Show notification to remind user
      chrome.notifications.create(`followup-${followUp.contactId}-${followUp.sequence}`, {
        type: 'basic',
        iconUrl: '/icon-128.png',
        title: `Follow-up #${followUp.sequence} due`,
        message: `Time to follow up with ${followUp.contactName}. Open Reply Guy to generate your message.`,
        priority: 2,
        requireInteraction: true,
      });

      // Store the pending follow-up prompt so the side panel can pick it up
      await chrome.storage.session.set({
        pendingFollowUp: {
          contactId: followUp.contactId,
          contactName: followUp.contactName,
          sequence: followUp.sequence,
          prompt: followUp.prompt,
        },
      });
    } catch (err) {
      console.error('[background] Failed to handle follow-up alarm:', err);
    }
  });

  // Handle notification click — open the side panel
  chrome.notifications.onClicked.addListener((notificationId) => {
    if (notificationId.startsWith('followup-')) {
      chrome.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
        if (tabs[0]?.id) {
          chrome.sidePanel.open({ tabId: tabs[0].id }).catch(console.error);
        }
      });
      chrome.notifications.clear(notificationId);
    }
  });

  // Clean up glow when side panel closes
  if (chrome.sidePanel.onPanelClosed) {
    chrome.sidePanel.onPanelClosed.addListener(() => {
      chrome.tabs.query({ active: true }).then(tabs => {
        tabs.forEach(tab => {
          chrome.tabs.sendMessage(tab.id!, { type: 'CLOSE_PANEL' }).catch(() => {});
        });
      });
    });
  }
});
