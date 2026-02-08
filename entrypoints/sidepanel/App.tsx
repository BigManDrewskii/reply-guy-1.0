import { useEffect, useState, lazy, Suspense } from 'react';
import type { PageData } from '@/types';
import { useStore } from '@/lib/store';
import { Zap, Home, Clock, Settings } from '@/lib/icons';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { useToast } from '@/components/ui/useToast';
import Toast from '@/components/ui/Toast';

// Lazy load screens to reduce initial bundle size
const OnboardingScreen = lazy(() => import('@/components/screens/OnboardingScreen'));
const IdleScreen = lazy(() => import('@/components/screens/IdleScreen'));
const OutreachScreen = lazy(() => import('@/components/screens/OutreachScreen'));
const HistoryScreen = lazy(() => import('@/components/screens/HistoryScreen'));
const SettingsScreen = lazy(() => import('@/components/screens/SettingsScreen'));

type Screen = 'outreach' | 'history' | 'settings';

// Loading fallback for lazy-loaded screens
function ScreenLoader() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center space-y-2">
        <div className="inline-block w-8 h-8 border-2 border-border border-t-[#0070f3] rounded-full animate-spin" />
        <p className="text-xs text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('outreach');
  const [pageData, setPageData] = useState<PageData | null>(null);
  const apiKey = useStore((state) => state.apiKey);
  const { toasts, remove } = useToast();

  useEffect(() => {
    // Subscribe to page data from content script (via background → storage.session)
    const listener = (changes: Record<string, chrome.storage.StorageChange>) => {
      if (changes.currentPageData) {
        setPageData(changes.currentPageData.newValue);
      }
    };
    chrome.storage.session.onChanged.addListener(listener);

    // Load existing data on mount
    chrome.storage.session.get('currentPageData', (result) => {
      if (result.currentPageData) setPageData(result.currentPageData);
    });

    return () => chrome.storage.session.onChanged.removeListener(listener);
  }, []);

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
    if (screen === 'outreach') {
      // If no page data yet, show idle screen
      if (!pageData) {
        return (
          <ErrorBoundary>
            <Suspense fallback={<ScreenLoader />}>
              <IdleScreen />
            </Suspense>
          </ErrorBoundary>
        );
      }
      // Show page data
      return (
        <ErrorBoundary>
          <Suspense fallback={<ScreenLoader />}>
            <OutreachScreen initialData={pageData} />
          </Suspense>
        </ErrorBoundary>
      );
    }

    if (screen === 'history') {
      return (
        <ErrorBoundary>
          <Suspense fallback={<ScreenLoader />}>
            <HistoryScreen />
          </Suspense>
        </ErrorBoundary>
      );
    }

    if (screen === 'settings') {
      return (
        <ErrorBoundary>
          <Suspense fallback={<ScreenLoader />}>
            <SettingsScreen />
          </Suspense>
        </ErrorBoundary>
      );
    }

    return null;
  };

  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      <header className="h-11 flex items-center px-4 border-b border-border bg-card shrink-0">
        <Zap size={16} className="mr-2" />
        <span className="text-sm font-semibold">Reply Guy</span>
      </header>

      <main className="flex-1 overflow-y-auto p-4">
        {renderMainContent()}
      </main>

      <nav className="h-12 flex flex-col border-t border-border bg-card px-2 shrink-0">
        <div className="relative flex flex-1">
          {/* Sliding indicator */}
          <div
            className="absolute top-0 h-[2px] bg-accent transition-all duration-[250ms] ease-out"
            style={{
              left: screen === 'outreach' ? '0%' : screen === 'history' ? '33.33%' : '66.66%',
              width: '33.33%'
            }}
          />
          {(['outreach', 'history', 'settings'] as Screen[]).map((s) => {
            const icons = {
              outreach: Home,
              history: Clock,
              settings: Settings,
            } as const;

            const Icon = icons[s];
            const isActive = screen === s;

            return (
              <button
                key={s}
                onClick={() => setScreen(s)}
                className={`
                  relative flex flex-col items-center justify-center gap-0.5 flex-1 h-full
                  transition-all duration-150
                  ${isActive ? 'bg-cta text-cta-foreground' : 'text-muted-foreground hover:bg-muted/30'}
                  focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary/50
                `}
              >
                <Icon size={16} />
                <span className="text-[10px] capitalize font-medium">{s}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {toasts.map((toast, index) => (
        <Toast key={toast.id} toast={{ ...toast, index }} onRemove={remove} />
      ))}
    </div>
  );
}
