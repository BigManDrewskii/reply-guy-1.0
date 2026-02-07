export default defineBackground(() => {
  // Open side panel when extension icon is clicked
  chrome.action.onClicked.addListener(async (tab) => {
    if (tab.id) {
      await chrome.sidePanel.open({ tabId: tab.id });
    }
  });

  // Enable side panel on ALL pages
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })
    .catch(console.error);

  // Listen for messages from content script
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'PAGE_DATA') {
      // Relay to side panel — side panel listens via port or storage
      chrome.storage.session.set({ currentPageData: message.data });
    }
    return true;
  });

  // When tab updates, tell content script to re-scrape
  chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
    if (changeInfo.status === 'complete') {
      chrome.tabs.sendMessage(tabId, { type: 'SCRAPE_PAGE' }).catch(() => {});
    }
  });

  // When active tab changes, tell new tab to scrape
  chrome.tabs.onActivated.addListener(async (activeInfo) => {
    chrome.tabs.sendMessage(activeInfo.tabId, { type: 'SCRAPE_PAGE' }).catch(() => {});
  });
});
