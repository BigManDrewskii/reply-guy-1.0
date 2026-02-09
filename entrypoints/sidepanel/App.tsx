import { useEffect, useState, useRef, lazy, Suspense } from 'react';
import type { PageData } from '@/types';
import { useStore } from '@/lib/store';
import { Zap, Home, Clock, Settings } from '@/lib/icons';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { useToast } from '@/components/ui/useToast';
import Toast from '@/components/ui/toast';
import { cn } from '@/lib/utils/cn';
import Skeleton from '@/components/ui/skeleton';
import { ProfileCardSkeleton, MessageCardSkeleton } from '@/components/ui/skeleton';

// Lazy load screens to reduce initial bundle size
const OnboardingScreen = lazy(() => import('@/components/screens/OnboardingScreen'));
const IdleScreen = lazy(() => import('@/components/screens/IdleScreen'));
const OutreachScreen = lazy(() => import('@/components/screens/OutreachScreen'));
const HistoryScreen = lazy(() => import('@/components/screens/HistoryScreen'));
const SettingsScreen = lazy(() => import('@/components/screens/SettingsScreen'));
const VoiceTrainingScreen = lazy(() => import('@/components/screens/VoiceTrainingScreen'));

type Screen = 'outreach' | 'history' | 'settings' | 'voiceTraining';

/**
 * Skeleton-based loading fallback (never spinners per design rules).
 */
function ScreenLoader() {
  return (
    <div className="space-y-4 p-4 animate-fade-in">
      <ProfileCardSkeleton />
      <div className="space-y-2">
        <Skeleton variant="text" className="w-1/3 h-5" />
        <Skeleton variant="pulse" className="h-2 w-full rounded-full" />
      </div>
      <MessageCardSkeleton />
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('outreach');
  const [displayScreen, setDisplayScreen] = useState<Screen>('outreach');
  const [animationClass, setAnimationClass] = useState('');
  const [pageData, setPageData] = useState<PageData | null>(null);
  const apiKey = useStore((state) => state.apiKey);
  const { toasts, remove } = useToast();

  // Scroll position preservation per screen
  const scrollPositions = useRef<Record<Screen, number>>({
    outreach: 0,
    history: 0,
    settings: 0,
    voiceTraining: 0,
  });
  const mainRef = useRef<HTMLDivElement>(null);

  // Save scroll position before switching screens
  const handleScreenChange = (newScreen: Screen) => {
    if (mainRef.current) {
      scrollPositions.current[screen] = mainRef.current.scrollTop;
    }
    setScreen(newScreen);
  };

  // Restore scroll position after screen transition
  useEffect(() => {
    if (mainRef.current && displayScreen === screen) {
      mainRef.current.scrollTop = scrollPositions.current[screen];
    }
  }, [displayScreen, screen]);

  useEffect(() => {
    // Subscribe to page data from content script (via background → storage.session)
    const listener = (changes: Record<string, chrome.storage.StorageChange>) => {
      if (changes.currentPageData) {
        const newData = changes.currentPageData.newValue;
        setPageData(newData);

        // Notify content script that analysis is complete
        chrome.tabs.query({ active: true, currentWindow: true }).then(([tab]) => {
          if (tab?.id) {
            chrome.tabs.sendMessage(tab.id, {
              type: 'ANALYSIS_COMPLETE',
              confidence: newData.confidence || 100
            }).catch(() => {});
          }
        });
      }
    };
    chrome.storage.session.onChanged.addListener(listener);

    // Load existing data on mount
    chrome.storage.session.get('currentPageData', (result) => {
      if (result.currentPageData) setPageData(result.currentPageData);
    });

    // Start analysis when side panel opens
    chrome.tabs.query({ active: true, currentWindow: true }).then(([tab]) => {
      if (tab?.id) {
        chrome.tabs.sendMessage(tab.id, { type: 'START_ANALYSIS' }).catch(() => {});
      }
    });

    return () => {
      chrome.storage.session.onChanged.removeListener(listener);

      // Clean up glow when side panel unmounts
      chrome.tabs.query({ active: true, currentWindow: true }).then(([tab]) => {
        if (tab?.id) {
          chrome.tabs.sendMessage(tab.id, { type: 'CLOSE_PANEL' }).catch(() => {});
        }
      });
    };
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape to close voice training
      if (e.key === 'Escape' && screen === 'voiceTraining') {
        handleScreenChange('settings');
        return;
      }

      // Don't intercept if user is typing in an input/textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Alt+1/2/3 for tab switching
      if (e.altKey && e.key === '1') { handleScreenChange('outreach'); e.preventDefault(); }
      if (e.altKey && e.key === '2') { handleScreenChange('history'); e.preventDefault(); }
      if (e.altKey && e.key === '3') { handleScreenChange('settings'); e.preventDefault(); }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [screen]);

  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (screen !== displayScreen && !prefersReducedMotion) {
      // Apply slide-out animation
      setAnimationClass('animate-slide-out-right');

      const timeout1 = setTimeout(() => {
        setDisplayScreen(screen);
        setAnimationClass('animate-slide-in-left');
      }, 250);

      const timeout2 = setTimeout(() => {
        setAnimationClass('');
      }, 500);

      return () => {
        clearTimeout(timeout1);
        clearTimeout(timeout2);
      };
    } else if (screen !== displayScreen && prefersReducedMotion) {
      // Instant switch for users who prefer reduced motion
      setDisplayScreen(screen);
    }
  }, [screen, displayScreen]);

  // If no API key, show onboarding
  if (!apiKey) {
    return (
      <div className="h-screen flex flex-col bg-background text-foreground">
        <header className="h-11 flex items-center px-4 border-b border-border bg-card shrink-0">
          <Zap size={16} className="mr-2" />
          <span className="text-sm font-semibold">Reply Guy</span>
        </header>
        <main className="flex-1 overflow-y-auto">
          <ErrorBoundary>
            <Suspense fallback={<ScreenLoader />}>
              <OnboardingScreen />
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>
    );
  }

  const renderMainContent = () => {
    if (displayScreen === 'voiceTraining') {
      return (
        <ErrorBoundary>
          <Suspense fallback={<ScreenLoader />}>
            <VoiceTrainingScreen onBack={() => handleScreenChange('settings')} />
          </Suspense>
        </ErrorBoundary>
      );
    }

    if (displayScreen === 'outreach') {
      if (!pageData) {
        return (
          <ErrorBoundary>
            <Suspense fallback={<ScreenLoader />}>
              <IdleScreen />
            </Suspense>
          </ErrorBoundary>
        );
      }
      return (
        <ErrorBoundary>
          <Suspense fallback={<ScreenLoader />}>
            <OutreachScreen initialData={pageData} />
          </Suspense>
        </ErrorBoundary>
      );
    }

    if (displayScreen === 'history') {
      return (
        <ErrorBoundary>
          <Suspense fallback={<ScreenLoader />}>
            <HistoryScreen />
          </Suspense>
        </ErrorBoundary>
      );
    }

    if (displayScreen === 'settings') {
      return (
        <ErrorBoundary>
          <Suspense fallback={<ScreenLoader />}>
            <SettingsScreen onNavigateVoiceTraining={() => handleScreenChange('voiceTraining')} />
          </Suspense>
        </ErrorBoundary>
      );
    }

    return null;
  };

  // Only show bottom nav for main screens (not voice training)
  const showNav = displayScreen !== 'voiceTraining';
  const navScreens: Array<{ key: Screen; icon: typeof Home; label: string }> = [
    { key: 'outreach', icon: Home, label: 'Outreach' },
    { key: 'history', icon: Clock, label: 'History' },
    { key: 'settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      <header className="h-11 flex items-center px-4 border-b border-border bg-card shrink-0">
        <Zap size={16} className="mr-2" />
        <span className="text-sm font-semibold">Reply Guy</span>
      </header>

      <main ref={mainRef} className={cn('flex-1 overflow-y-auto p-4', animationClass)}>
        {renderMainContent()}
      </main>

      {showNav && (
        <nav className="h-12 flex flex-col border-t border-border bg-card px-2 shrink-0">
          <div className="relative flex flex-1">
            {/* Sliding indicator */}
            <div
              className="absolute top-0 h-[2px] bg-foreground transition-all duration-[250ms] ease-out"
              style={{
                left: screen === 'outreach' ? '0%' : screen === 'history' ? '33.33%' : '66.66%',
                width: '33.33%'
              }}
            />
            {navScreens.map(({ key, icon: Icon, label }) => {
              const isActive = screen === key;

              return (
                <button
                  key={key}
                  onClick={() => handleScreenChange(key)}
                  aria-label={label}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'relative flex flex-col items-center justify-center gap-0.5 flex-1 h-full',
                    'transition-colors duration-150 rounded-md',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/50',
                    isActive
                      ? 'text-foreground'
                      : 'text-muted-foreground hover:text-foreground/70'
                  )}
                >
                  <Icon size={16} />
                  <span className="text-[10px] capitalize font-medium">{label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      )}

      {toasts.map((toast, index) => (
        <Toast key={toast.id} toast={{ ...toast, index }} onRemove={remove} />
      ))}
    </div>
  );
}
