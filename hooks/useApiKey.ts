import { useEffect, useState } from 'react';
import { useStore } from '../lib/store';

/**
 * Hook to check for API key in chrome.storage.local
 * Updates Zustand store with result
 */
export function useApiKey(): boolean {
  const { setHasApiKey } = useStore();
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    chrome.storage.local.get(['apiKey'], (result) => {
      const hasKey = !!result.apiKey;
      setHasApiKey(hasKey);
      setHasChecked(true);
    });
  }, [setHasApiKey]);

  return useStore((state) => state.hasApiKey);
}
