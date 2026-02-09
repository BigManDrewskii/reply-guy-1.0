import { useEffect } from 'react';
import { useStore } from '@/lib/store';

/**
 * Global keyboard shortcuts for the side panel.
 *
 * Shortcuts:
 *   Ctrl/Cmd + 1  → Outreach screen
 *   Ctrl/Cmd + 2  → History screen
 *   Ctrl/Cmd + 3  → Settings screen
 *   Escape         → Close any open dialog (handled by ConfirmDialog itself)
 */
export function useKeyboardShortcuts() {
  const setActiveScreen = useStore((state) => state.setActiveScreen);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (!mod) return;

      // Ignore if user is typing in an input or textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      switch (e.key) {
        case '1':
          e.preventDefault();
          setActiveScreen('outreach');
          break;
        case '2':
          e.preventDefault();
          setActiveScreen('history');
          break;
        case '3':
          e.preventDefault();
          setActiveScreen('settings');
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [setActiveScreen]);
}
