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
