// Message Tabs Component - Tabbed interface for message angles
import React, { useState } from 'react';
import { MessageTab, type Message } from './MessageTab';

interface MessageTabsProps {
  messages: Message[];
  onCopy: (message: Message) => void;
}

type TabType = 'service' | 'partner' | 'community' | 'value_first' | 'all';

export const MessageTabs: React.FC<MessageTabsProps> = ({ messages, onCopy }) => {
  const [activeTab, setActiveTab] = useState<TabType>('all');

  // Filter messages by active tab
  const filteredMessages = messages.filter((message) => {
    if (activeTab === 'all') return true;
    return message.angle === activeTab;
  });

  // Get tab label
  const getTabLabel = (tab: TabType): string => {
    switch (tab) {
      case 'service': return 'Service';
      case 'partner': return 'Partner';
      case 'community': return 'Community';
      case 'value_first': return 'Value First';
      case 'all': return 'All';
      default: return tab;
    }
  };

  // Count messages per tab
  const getTabCount = (tab: TabType): number => {
    if (tab === 'all') return messages.length;
    return messages.filter((m) => m.angle === tab).length;
  };

  const tabs: TabType[] = ['all', 'service', 'partner', 'community', 'value_first'];

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="flex items-center space-x-1 border-b border-[#262626]">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`
              relative px-4 py-3 text-sm font-medium transition-colors
              ${activeTab === tab
                ? 'text-[#ededed]'
                : 'text-[#a1a1a1] hover:text-[#ededed]'
              }
            `}
          >
            {getTabLabel(tab)}
            {getTabCount(tab) > 0 && (
              <span className="ml-2 text-xs text-[#666]">({getTabCount(tab)})</span>
            )}
            {activeTab === tab && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0070f3]" />
            )}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="space-y-3">
        {filteredMessages.length > 0 ? (
          filteredMessages.map((message) => (
            <MessageTab key={message.id} message={message} onCopy={onCopy} />
          ))
        ) : (
          <div className="p-8 text-center">
            <p className="text-[#666] text-sm">
              No messages for this angle yet
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
