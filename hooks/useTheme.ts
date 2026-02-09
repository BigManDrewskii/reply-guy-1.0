import { useEffect } from 'react';

/**
 * Dark mode only — per PRD design specification.
 * Ensures the 'dark' class is always applied to the document root.
 */
export function useTheme() {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('dark');
    root.classList.remove('light');
  }, []);

  return { theme: 'dark' as const };
}
