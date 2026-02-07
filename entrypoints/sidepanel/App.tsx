import React, { useEffect, useState } from 'react';

type Tab = 'outreach' | 'history' | 'settings';

export default function App() {
  const [tab, setTab] = useState<Tab>('outreach');
  const [pageData, setPageData] = useState<any>(null);

  useEffect(() => {
    // Listen for page data updates from background
    const listener = (changes: any) => {
      if (changes.currentPageData) {
        setPageData(changes.currentPageData.newValue);
      }
    };
    chrome.storage.session.onChanged.addListener(listener);

    // Load existing data
    chrome.storage.session.get('currentPageData', (result) => {
      if (result.currentPageData) setPageData(result.currentPageData);
    });

    return () => chrome.storage.session.onChanged.removeListener(listener);
  }, []);

  return (
    <div className="h-screen flex flex-col bg-[#000] text-[#ededed] font-sans">
      {/* Header */}
      <header className="h-12 flex items-center px-4 border-b border-[#262626] bg-[#0a0a0a] shrink-0">
        <span className="text-base font-semibold">⚡ Reply Guy</span>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Render active screen here based on tab + state */}
        <div className="p-4">
          {tab === 'outreach' && <div>Outreach Screen</div>}
          {tab === 'history' && <div>History Screen</div>}
          {tab === 'settings' && <div>Settings Screen</div>}
        </div>
      </main>

      {/* Bottom Nav */}
      <nav className="h-14 flex items-center justify-around border-t border-[#262626] bg-[#0a0a0a] shrink-0">
        {(['outreach', 'history', 'settings'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex flex-col items-center gap-1 text-[11px] ${
              tab === t ? 'text-[#ededed]' : 'text-[#666]'
            }`}
          >
            <span className="text-sm">{t === 'outreach' ? '💬' : t === 'history' ? '📋' : '⚙️'}</span>
            <span className="capitalize">{t}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
