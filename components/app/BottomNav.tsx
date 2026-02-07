import React from 'react';
import { cn } from '../../lib/utils/cn';
import type { Tab } from '../../types';

interface BottomNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const tabs: { id: Tab; icon: string; label: string }[] = [
    { id: 'outreach', icon: '💬', label: 'Outreach' },
    { id: 'history', icon: '📋', label: 'History' },
    { id: 'settings', icon: '⚙️', label: 'Settings' },
  ];

  return (
    <nav className="h-14 flex items-center justify-around border-t border-border bg-bg-050 shrink-0">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            'flex flex-col items-center gap-1 text-[11px] transition-[150ms_ease]',
            activeTab === tab.id ? 'text-text-primary' : 'text-text-tertiary hover:text-text-secondary'
          )}
        >
          <span className="text-sm">{tab.icon}</span>
          <span className="capitalize">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
