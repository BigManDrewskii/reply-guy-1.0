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

// Lazy load screens
const OnboardingScreen = lazy(() => import('@/components/screens/OnboardingScreen'));
const IdleScreen = lazy(() => import('@/components/screens/IdleScreen'));
const OutreachScreen = lazy(() => import('@/components/screens/OutreachScreen'));
const HistoryScreen = lazy(() => import('@/components/screens/HistoryScreen'));
const SettingsScreen = lazy(() => import('@/components/screens/SettingsScreen'));
const VoiceTrainingScreen = lazy(() => import('@/components/screens/VoiceTrainingScreen'));

type Screen = 'outreach' | 'history' | 'settings' | 'voiceTraining';

function ScreenLoader() {
  return (
    <div className="space-y-4 animate-fade-in p-1">
      <ProfileCardSkeleton />
      <div className="space-y-2.5">
        <Skeleton variant="text" className="w-1/3 h-4" />
        <Skeleton variant="pulse" className="h-1.5 w-full rounded-full" />
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

  // Scroll position preservation
  const scrollPositions = useRef<Record<Screen, number>>({
    outreach: 0,
    history: 0,
    settings: 0,
    voiceTraining: 0,
  });
  const mainRef = useRef<HTMLDivElement>(null);

  const handleScreenChange = (newScreen: Screen) => {
    if (mainRef.current) {
      scrollPositions.current[screen] = mainRef.current.scrollTop;
    }
    setScreen(newScreen);
  };

  useEffect(() => {
    if (mainRef.current && displayScreen === screen) {
      mainRef.current.scrollTop = scrollPositions.current[screen];
    }
  }, [displayScreen, screen]);

  useEffect(() => {
    const listener = (changes: Record<string, chrome.storage.StorageChange>) => {
      if (changes.currentPageData) {
        const newData = changes.currentPageData.newValue;
        setPageData(newData);

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

    chrome.storage.session.get('currentPageData', (result) => {
      if (result.currentPageData) setPageData(result.currentPageData);
    });

    chrome.tabs.query({ active: true, currentWindow: true }).then(([tab]) => {
      if (tab?.id) {
        chrome.tabs.sendMessage(tab.id, { type: 'START_ANALYSIS' }).catch(() => {});
      }
    });

    return () => {
      chrome.storage.session.onChanged.removeListener(listener);
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
      if (e.key === 'Escape' && screen === 'voiceTraining') {
        handleScreenChange('settings');
        return;
      }

      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.altKey && e.key === '1') { handleScreenChange('outreach'); e.preventDefault(); }
      if (e.altKey && e.key === '2') { handleScreenChange('history'); e.preventDefault(); }
      if (e.altKey && e.key === '3') { handleScreenChange('settings'); e.preventDefault(); }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [screen]);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (screen !== displayScreen && !prefersReducedMotion) {
      setAnimationClass('animate-slide-out-right');

      const timeout1 = setTimeout(() => {
        setDisplayScreen(screen);
        setAnimationClass('animate-slide-in-left');
      }, 250);

      const timeout2 = setTimeout(() => {
        setAnimationClass('');
      }, 550);

      return () => {
        clearTimeout(timeout1);
        clearTimeout(timeout2);
      };
    } else if (screen !== displayScreen && prefersReducedMotion) {
      setDisplayScreen(screen);
    }
  }, [screen, displayScreen]);

  // Onboarding
  if (!apiKey) {
    return (
      <div className="h-screen flex flex-col bg-background text-foreground">
        <header className="h-13 flex items-center px-5 border-b border-border/30 bg-card/80 glass shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-foreground flex items-center justify-center">
              <Zap size={14} className="text-background" />
            </div>
            <span className="text-sm font-semibold tracking-tight">Reply Guy</span>
          </div>
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

  const showNav = displayScreen !== 'voiceTraining';
  const navScreens: Array<{ key: Screen; icon: typeof Home; label: string }> = [
    { key: 'outreach', icon: Home, label: 'Outreach' },
    { key: 'history', icon: Clock, label: 'History' },
    { key: 'settings', icon: Settings, label: 'Settings' },
  ];

  const activeIndex = navScreens.findIndex(n => n.key === screen);

  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      {/* Header */}
      <header className="h-13 flex items-center px-5 border-b border-border/30 bg-card/80 glass shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-foreground flex items-center justify-center">
            <Zap size={14} className="text-background" />
          </div>
          <span className="text-sm font-semibold tracking-tight">Reply Guy</span>
        </div>
      </header>

      {/* Main content */}
      <main ref={mainRef} className={cn('flex-1 overflow-y-auto p-5 scrollbar-hidden', animationClass)}>
        {renderMainContent()}
      </main>

      {/* Bottom navigation */}
      {showNav && (
        <nav className="h-15 flex flex-col border-t border-border/30 bg-card/80 glass px-4 shrink-0">
          <div className="relative flex flex-1">
            {/* Sliding active indicator */}
            <div
              className="absolute top-0 h-[2px] bg-foreground rounded-full transition-all duration-[250ms] ease-out"
              style={{
                left: `${(activeIndex / navScreens.length) * 100}%`,
                width: `${100 / navScreens.length}%`,
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
                    'relative flex flex-col items-center justify-center gap-1 flex-1 h-full',
                    'transition-all duration-[200ms] ease-out',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring',
                    isActive
                      ? 'text-foreground'
                      : 'text-muted-foreground hover:text-foreground/60'
                  )}
                >
                  <Icon size={18} strokeWidth={isActive ? 2.2 : 1.6} />
                  <span className={cn(
                    'text-[12px] transition-all duration-[200ms]',
                    isActive ? 'font-semibold' : 'font-medium'
                  )}>{label}</span>
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
