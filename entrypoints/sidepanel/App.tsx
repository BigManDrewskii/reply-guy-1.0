// Reply Guy Side Panel App - Phase 3: Message Generation
import React, { useEffect, useState } from 'react';
import '@/assets/main.css';
import type { ProfileData, Conversation, Message, VoiceProfile } from '@/lib/db';
import { db } from '@/lib/db';
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
  const [voiceProfile, setVoiceProfile] = useState<VoiceProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'messages' | 'history'>('messages');
  const [conversationHistory, setConversationHistory] = useState<Conversation | null>(null);
  const { showToast, ToastContainer } = useToast();

  // Load voice profile on mount
  useEffect(() => {
    const loadVoiceProfile = async () => {
      try {
        const profiles = await db.voiceProfiles.toArray();
        if (profiles.length > 0) {
          setVoiceProfile(profiles[0]);
          console.log('[Side Panel] Voice profile loaded');
        }
      } catch (error) {
        console.error('[Side Panel] Failed to load voice profile:', error);
      }
    };

    loadVoiceProfile();
  }, []);

  // Load conversation history when profile changes
  useEffect(() => {
    const loadConversationHistory = async () => {
      if (!profile) return;

      try {
        const profileUrl = window.location.href;
        const conversation = await db.conversations.where('profileUrl').equals(profileUrl).first();
        setConversationHistory(conversation || null);
      } catch (error) {
        console.error('[Side Panel] Failed to load conversation history:', error);
      }
    };

    loadConversationHistory();
  }, [profile]);

  // Get confidence bar color
  const getConfidenceColor = (score: number): string => {
    if (score >= 0.8) return '#00c853'; // Green
    if (score >= 0.6) return '#ffc107'; // Amber
    return '#f44336'; // Red
  };

  // Handle copy action with send confirmation
  const handleCopy = async (message: GeneratedMessage) => {
    await navigator.clipboard.writeText(message.content);
    console.log('[Side Panel] Message copied to clipboard');

    // Show confirmation toast with Yes/No buttons
    showToast('Message copied! Did you send it?', [
      {
        label: 'No',
        onClick: () => {
          console.log('[Side Panel] User did not send message');
        }
      },
      {
        label: 'Yes',
        primary: true,
        onClick: async () => {
          console.log('[Side Panel] User confirmed sending message');
          await logSentMessage(message);
        }
      }
    ]);
  };

  // Log sent message to conversation history
  const logSentMessage = async (message: GeneratedMessage) => {
    if (!profile) return;

    try {
      // Get current conversation or create new one
      let conversation = await db.conversations.where('profileUrl').equals(window.location.href).first();

      const newMessage: Message = {
        id: message.id,
        content: message.content,
        angle: message.angle as any,
        voiceMatchScore: message.voiceMatchScore,
        timestamp: new Date(),
        sent: true
      };

      if (conversation) {
        // Update existing conversation
        await db.conversations.update(conversation.id, {
          messages: [...conversation.messages, newMessage],
          lastContact: new Date()
        });
        // Refresh history state
        const updated = await db.conversations.where('profileUrl').equals(window.location.href).first();
        setConversationHistory(updated || null);
      } else {
        // Create new conversation
        const newConversation: Conversation = {
          id: Date.now().toString(),
          platform: window.location.hostname.includes('x.com') || window.location.hostname.includes('twitter.com') ? 'x' : 'linkedin',
          profileUrl: window.location.href,
          profileName: profile.name,
          profileHandle: profile.handle,
          profileSnapshot: profile,
          messages: [newMessage],
          firstContact: new Date(),
          lastContact: new Date(),
          status: 'sent',
          tags: []
        };
        await db.conversations.add(newConversation);
        setConversationHistory(newConversation);
      }

      console.log('[Side Panel] Message logged to conversation history');
      showToast('Saved to history!');
    } catch (error) {
      console.error('[Side Panel] Error logging sent message:', error);
      showToast('Failed to save to history');
    }
  };

  // Handle conversation status update
  const handleStatusUpdate = async (conversationId: string, newStatus: Conversation['status']) => {
    try {
      await db.conversations.update(conversationId, { status: newStatus });

      // Refresh history state
      const profileUrl = window.location.href;
      const updated = await db.conversations.where('profileUrl').equals(profileUrl).first();
      setConversationHistory(updated || null);

      console.log('[Side Panel] Conversation status updated:', newStatus);
      showToast(`Status updated to ${newStatus.replace('_', ' ')}`);
    } catch (error) {
      console.error('[Side Panel] Error updating status:', error);
      showToast('Failed to update status');
    }
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

      // Call message generation API with voice profile if available
      let fullResponse = '';
      for await (const chunk of generateMessages(profile, mockAnalysis, voiceProfile || undefined)) {
        fullResponse += chunk;
      }

      // Parse response
      const generatedMessages = JSON.parse(fullResponse);

      // Calculate voice scores and add IDs
      const messagesWithScores: GeneratedMessage[] = generatedMessages.map((msg: any) => {
        // Use actual voice scoring if profile exists, otherwise mock
        let voiceScore = 85;
        if (voiceProfile) {
          voiceScore = scoreAuthenticity(msg.content, voiceProfile);
        }

        return {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          angle: msg.angle,
          content: msg.content,
          voiceMatchScore: voiceScore,
          whyItWorks: msg.whyItWorks
        };
      });

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

            {/* Messages Section Header with Tabs */}
            <div className="border-b border-[#262626]">
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center space-x-1">
                  {/* Tab Switcher */}
                  <button
                    onClick={() => setActiveTab('messages')}
                    className={`
                      relative px-3 py-1.5 text-sm font-medium transition-colors
                      ${activeTab === 'messages'
                        ? 'text-[#ededed]'
                        : 'text-[#a1a1a1] hover:text-[#ededed]'
                      }
                    `}
                  >
                    Messages
                    {activeTab === 'messages' && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0070f3]" />
                    )}
                  </button>

                  <button
                    onClick={() => setActiveTab('history')}
                    className={`
                      relative px-3 py-1.5 text-sm font-medium transition-colors
                      ${activeTab === 'history'
                        ? 'text-[#ededed]'
                        : 'text-[#a1a1a1] hover:text-[#ededed]'
                      }
                    `}
                  >
                    History
                    {conversationHistory && conversationHistory.messages.length > 0 && (
                      <span className="ml-1 text-xs text-[#666]">({conversationHistory.messages.length})</span>
                    )}
                    {activeTab === 'history' && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0070f3]" />
                    )}
                  </button>

                  {voiceProfile && activeTab === 'messages' && (
                    <span className="text-xs text-[#0070f3] bg-[#0070f3]/10 px-2 py-0.5 rounded ml-2">
                      Using your voice
                    </span>
                  )}
                </div>

                {activeTab === 'messages' && messages.length > 0 && (
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

            {/* Messages Tab Content */}
            {activeTab === 'messages' && (
              <>
                {messages.length > 0 ? (
                  <MessageTabs messages={messages} onCopy={handleCopy} />
                ) : (
                  <div className="px-4 py-3">
                    <p className="text-[#666] text-sm text-center">
                      {analyzing ? 'Generating messages...' : 'Analysis complete. Generate messages to get started.'}
                    </p>
                  </div>
                )}
              </>
            )}

            {/* History Tab Content */}
            {activeTab === 'history' && (
              <div className="px-4 py-3">
                {conversationHistory && conversationHistory.messages.length > 0 ? (
                  <div className="space-y-4">
                    {/* Status Update Section */}
                    <div className="flex items-center justify-between p-3 bg-[#111] border border-[#262626] rounded-lg">
                      <div>
                        <span className="text-xs text-[#666] block mb-1">Conversation Status</span>
                        <select
                          value={conversationHistory.status}
                          onChange={(e) => handleStatusUpdate(conversationHistory.id, e.target.value as Conversation['status'])}
                          className="bg-[#262626] text-[#ededed] text-sm px-3 py-1.5 rounded border border-[#333] focus:outline-none focus:border-[#0070f3] capitalize"
                        >
                          <option value="sent">Sent</option>
                          <option value="responded">Responded</option>
                          <option value="no_response">No Response</option>
                          <option value="converted">Converted</option>
                        </select>
                      </div>
                      <div className="text-right text-xs text-[#666]">
                        <div>{conversationHistory.messages.length} message{conversationHistory.messages.length !== 1 ? 's' : ''}</div>
                        <div>Last: {new Date(conversationHistory.lastContact).toLocaleDateString()}</div>
                      </div>
                    </div>

                    {/* Messages */}
                    <div className="space-y-3">
                      {conversationHistory.messages.map((msg) => (
                        <div key={msg.id} className="border border-[#262626] rounded-lg p-3 bg-[#111]">
                          <div className="flex items-start justify-between mb-2">
                            <span className="text-xs text-[#0070f3] bg-[#0070f3]/10 px-2 py-0.5 rounded capitalize">
                              {msg.angle}
                            </span>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-[#666]">
                                {new Date(msg.timestamp).toLocaleDateString()}
                              </span>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(msg.content);
                                  showToast('Message copied to clipboard!');
                                }}
                                className="text-xs text-[#a1a1a1] hover:text-[#ededed]"
                              >
                                Copy
                              </button>
                            </div>
                          </div>
                          <p className="text-sm text-[#ededed] mb-2">{msg.content}</p>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-[#666]">Voice: {msg.voiceMatchScore}% match</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-[#666] text-sm">
                      No messages sent yet. Copy a message to start tracking your conversations.
                    </p>
                  </div>
                )}
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
