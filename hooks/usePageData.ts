import { useEffect, useState } from 'react';
import type { ScrapedData } from '../types';

/**
 * Hook to subscribe to page data updates from chrome.storage.session
 * This receives scraped data from the content script via the background service worker
 */
export function usePageData(): ScrapedData | null {
  const [pageData, setPageData] = useState<ScrapedData | null>(null);

  useEffect(() => {
    // Listen for page data updates
    const listener = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      if (changes.currentPageData) {
        setPageData(changes.currentPageData.newValue);
      }
    };
    chrome.storage.session.onChanged.addListener(listener);

    // Load existing data on mount
    chrome.storage.session.get('currentPageData', (result) => {
      if (result.currentPageData) {
        setPageData(result.currentPageData);
      }
    });

    return () => chrome.storage.session.onChanged.removeListener(listener);
  }, []);

  return pageData;
}
