// Reply Guy Side Panel App - Phase 3: Message Generation
import React, { useEffect, useState } from 'react';
import '@/assets/main.css';
import type { ProfileData } from '@/lib/db';
import { MessageTabs } from '@/components/MessageTabs';
import { useToast } from '@/components/ui/toast';
import { generateMessages } from '@/lib/openrouter';
import { scoreAuthenticity } from '@/lib/voice/scorer';

interface GeneratedMessage {
  id: string;
  angle: string;
  content: string;
  voiceMatchScore: number;
  whyItWorks: string;
}

export default function App() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [confidence, setConfidence] = useState(0);
  const [messages, setMessages] = useState<GeneratedMessage[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const { showToast, ToastContainer } = useToast();

  // Get confidence bar color
  const getConfidenceColor = (score: number): string => {
    if (score >= 0.8) return '#00c853'; // Green
    if (score >= 0.6) return '#ffc107'; // Amber
    return '#f44336'; // Red
  };

  // Handle copy action
  const handleCopy = (message: GeneratedMessage) => {
    navigator.clipboard.writeText(message.content).then(() => {
      console.log('[Side Panel] Message copied to clipboard');
      showToast('Message copied to clipboard!');
    });
  };

  // Handle regenerate messages
  const handleRegenerate = async () => {
    if (!profile) return;

    console.log('[Side Panel] Regenerating messages...');
    setMessages([]);
    setAnalyzing(true);

    try {
      // Generate mock analysis (in production, this would come from actual analysis)
      const mockAnalysis = {
        summary: `${profile.name} is a ${profile.followers ? 'influencer' : 'professional'} on the platform.`,
        painPoints: ['Growing audience', 'Engagement rate', 'Content consistency'],
        outreachAngles: [
          { type: 'service', reasoning: 'They may need help scaling', hook: 'Recent content' },
          { type: 'partner', reasoning: 'Collaboration opportunity', hook: 'Shared audience' }
        ],
        confidence: 0.75
      };

      // Call message generation API
      let fullResponse = '';
      for await (const chunk of generateMessages(profile, mockAnalysis)) {
        fullResponse += chunk;
      }

      // Parse response
      const generatedMessages = JSON.parse(fullResponse);

      // Calculate voice scores and add IDs
      const messagesWithScores: GeneratedMessage[] = generatedMessages.map((msg: any) => ({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        angle: msg.angle,
        content: msg.content,
        voiceMatchScore: Math.round(Math.random() * 20 + 80), // Mock score 80-100
        whyItWorks: msg.whyItWorks
      }));

      setMessages(messagesWithScores);
      console.log('[Side Panel] Messages regenerated successfully:', messagesWithScores.length);
      showToast(`Generated ${messagesWithScores.length} new messages!`);
    } catch (error) {
      console.error('[Side Panel] Error regenerating messages:', error);
      showToast('Failed to generate messages. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  useEffect(() => {
    // Listen for messages from background script
    const handleMessage = (message: any) => {
      console.log('[Side Panel] Received message:', message);

      if (message.type === 'PROFILE_DATA') {
        console.log('[Side Panel] Profile data received:', message.data);
        setProfile(message.data);
        setLoading(false);
      }
    };

    chrome.runtime.onMessage.addListener(handleMessage);

    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage);
    };
  }, []);

  return (
    <div className="w-[380px] h-screen bg-black text-[#ededed] flex flex-col font-sans relative">
      {/* Toast Container */}
      <ToastContainer />
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#262626]">
        <h1 className="text-[16px] font-semibold">⚡ Reply Guy</h1>
        <div className="flex items-center space-x-2">
          <button className="text-[#a1a1a1] hover:text-[#ededed]">
            ⚙
          </button>
          <button className="text-[#a1a1a1] hover:text-[#ededed]">
            ···
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          // Loading shimmer (Phase 1: Skeleton)
          <div className="p-4 space-y-4">
            {/* Profile Card Skeleton */}
            <div className="border-b border-[#262626] p-4">
              <div className="flex items-start space-x-3">
                {/* Avatar Skeleton */}
                <div className="skeleton h-12 w-12 rounded-full bg-[#111] border border-[#262626]" />

                {/* Profile Info Skeleton */}
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-4 w-32 bg-[#111] rounded" />
                  <div className="skeleton h-3 w-24 bg-[#111] rounded" />
                  <div className="skeleton h-3 w-16 bg-[#111] rounded" />
                </div>
              </div>
            </div>

            {/* Confidence Bar Skeleton */}
            <div className="border-b border-[#262626] px-4 py-3">
              <div className="flex items-center justify-between mb-2">
                <div className="skeleton h-4 w-24 bg-[#111] rounded" />
                <div className="skeleton h-4 w-12 bg-[#111] rounded" />
              </div>
              <div className="skeleton h-2 w-full bg-[#111] rounded-full" />
            </div>

            {/* Message Tabs Skeleton */}
            <div className="px-4 py-3 space-y-3">
              <div className="skeleton h-6 w-32 bg-[#111] rounded" />
              <div className="bg-[#111] border border-[#262626] rounded-lg p-4">
                <div className="skeleton h-4 w-full bg-[#111] rounded mb-2" />
                <div className="skeleton h-4 w-48 bg-[#111] rounded mb-2" />
                <div className="skeleton h-4 w-24 bg-[#111] rounded mb-4" />
                <div className="skeleton h-8 w-full bg-[#262626] rounded" />
              </div>
            </div>
          </div>
        ) : profile ? (
          // Phase 2: Show real profile data
          <div className="p-4 space-y-4">
            {/* Profile Card */}
            <div className="border-b border-[#262626] p-4">
              <div className="flex items-start space-x-3">
                {/* Avatar */}
                <div className="h-12 w-12 rounded-full bg-[#111] border border-[#262626] flex items-center justify-center">
                  <span className="text-[#ededed] font-semibold">
                    {profile.name.charAt(0).toUpperCase()}
                  </span>
                </div>

                {/* Profile Info */}
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-[#ededed] font-semibold">{profile.name}</h3>
                    {profile.verified && (
                      <span className="text-[#1d9bf0] text-xs" title="Verified">✓</span>
                    )}
                  </div>
                  <p className="text-[#a1a1a1] text-sm">{profile.handle}</p>
                  {profile.location && (
                    <p className="text-[#666] text-xs mt-1">{profile.location}</p>
                  )}
                  {profile.followers && (
                    <p className="text-[#666] text-xs mt-1">
                      {profile.followers.toLocaleString()} followers
                    </p>
                  )}
                </div>
              </div>
              {profile.bio && (
                <p className="text-[#a1a1a1] text-sm mt-3 line-clamp-2">{profile.bio}</p>
              )}
            </div>

            {/* Confidence Bar */}
            <div className="border-b border-[#262626] px-4 py-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[#a1a1a1] text-sm">Confidence</span>
                <span className="text-[#ededed] font-mono text-sm">
                  {Math.round(confidence * 100)}%
                </span>
              </div>
              <div className="h-2 bg-[#111] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${confidence * 100}%`,
                    backgroundColor: getConfidenceColor(confidence)
                  }}
                ></div>
              </div>
            </div>

            {/* Messages Section */}
            <div className="border-b border-[#262626]">
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-[#a1a1a1] text-sm font-medium">Messages</span>
                {messages.length > 0 && (
                  <button
                    onClick={handleRegenerate}
                    disabled={analyzing}
                    className={`
                      px-3 py-1.5 text-xs font-medium rounded-md
                      transition-colors duration-200
                      ${analyzing
                        ? 'bg-[#262626] text-[#666] cursor-not-allowed'
                        : 'bg-[#0070f3] text-white hover:bg-[#0060df]'
                      }
                    `}
                  >
                    {analyzing ? 'Generating...' : 'Regenerate'}
                  </button>
                )}
              </div>
            </div>

            {messages.length > 0 ? (
              <MessageTabs messages={messages} onCopy={handleCopy} />
            ) : (
              <div className="px-4 py-3">
                <p className="text-[#666] text-sm text-center">
                  {analyzing ? 'Generating messages...' : 'Analysis complete. Generate messages to get started.'}
                </p>
              </div>
            )}
          </div>
        ) : (
          // Empty state
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <p className="text-[#a1a1a1] text-sm">
              Navigate to an X or LinkedIn profile to get started
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
