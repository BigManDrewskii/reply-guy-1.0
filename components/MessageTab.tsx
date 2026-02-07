// Message Tab Component - Displays generated messages
import React from 'react';

export interface Message {
  id: string;
  angle: string;
  content: string;
  voiceMatchScore: number;
  whyItWorks: string;
}

interface MessageTabProps {
  message: Message;
  onCopy: (message: Message) => void;
}

export const MessageTab: React.FC<MessageTabProps> = ({ message, onCopy }) => {
  return (
    <div className="p-4 bg-[#111] border border-[#262626] rounded-lg">
      {/* Message Content */}
      <p className="text-[#ededed] text-sm leading-relaxed mb-4">
        {message.content}
      </p>

      {/* Metadata */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4 text-xs font-mono text-[#666]">
          <span>Voice: {message.voiceMatchScore}% match</span>
          <span>{message.content.split(/\s+/).length} words</span>
        </div>
      </div>

      {/* Copy Button */}
      <button
        onClick={() => onCopy(message)}
        className="w-full py-2 px-4 bg-[#ededed] text-[#000] font-medium rounded hover:bg-[#ffffff] transition-colors"
      >
        Copy Message
      </button>

      {/* Why It Works */}
      {message.whyItWorks && (
        <div className="mt-4 pt-4 border-t border-[#262626]">
          <p className="text-[#a1a1a1] text-xs">
            Why this works: {message.whyItWorks}
          </p>
        </div>
      )}
    </div>
  );
};
