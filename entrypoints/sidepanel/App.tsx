import React, { useEffect } from 'react';
import { useStore } from '../../lib/store';
import { useApiKey } from '../../hooks/useApiKey';
import { usePageData } from '../../hooks/usePageData';
import Header from '../../components/app/Header';
import BottomNav from '../../components/app/BottomNav';
import OnboardingScreen from '../../components/screens/OnboardingScreen';
import IdleScreen from '../../components/screens/IdleScreen';

// Placeholder screens for History and Settings
function PlaceholderScreen({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-center min-h-[600px]">
      <p className="text-text-secondary">{title}</p>
    </div>
  );
}

export default function App() {
  const activeTab = useStore((state) => state.activeTab);
  const setActiveTab = useStore((state) => state.setActiveTab);
  const hasApiKey = useApiKey();
  const pageData = usePageData();

  // Listen for toasts and auto-dismiss
  const toasts = useStore((state) => state.toasts);
  const removeToast = useStore((state) => state.removeToast);

  useEffect(() => {
    toasts.forEach((toast) => {
      const timer = setTimeout(() => {
        removeToast(toast.id);
      }, toast.duration || 3000);
      return () => clearTimeout(timer);
    });
  }, [toasts, removeToast]);

  // Render content based on tab and state
  const renderContent = () => {
    // Onboarding flow
    if (!hasApiKey) {
      return <OnboardingScreen />;
    }

    // Outreach tab
    if (activeTab === 'outreach') {
      if (!pageData) {
        return <IdleScreen />;
      }
      // TODO: OutreachScreen (Phase 2)
      return <PlaceholderScreen title="Outreach Screen (Coming soon)" />;
    }

    // History tab
    if (activeTab === 'history') {
      // TODO: HistoryScreen (Phase 6)
      return <PlaceholderScreen title="History Screen (Coming soon)" />;
    }

    // Settings tab
    if (activeTab === 'settings') {
      // TODO: SettingsScreen (Phase 5)
      return <PlaceholderScreen title="Settings Screen (Coming soon)" />;
    }

    return null;
  };

  // Get platform badge from page data
  const platformBadge = pageData?.platform;

  return (
    <div className="h-screen flex flex-col bg-bg-000 font-sans">
      {/* Header */}
      <Header platformBadge={platformBadge} />

      {/* Content */}
      <main className="flex-1 overflow-y-auto">
        {renderContent()}

        {/* Toast container */}
        <div className="fixed bottom-16 left-4 right-4 z-50 flex flex-col items-center gap-2 pointer-events-none">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className="pointer-events-auto px-4 py-2 rounded-md bg-bg-100 border border-border shadow-lg text-sm"
              style={{
                backgroundColor: toast.type === 'error' ? 'rgba(238, 0, 0, 0.1)' :
                               toast.type === 'success' ? 'rgba(0, 200, 83, 0.1)' :
                               'rgba(17, 17, 17, 0.95)',
              }}
            >
              {toast.message}
            </div>
          ))}
        </div>
      </main>

      {/* Bottom Nav */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
