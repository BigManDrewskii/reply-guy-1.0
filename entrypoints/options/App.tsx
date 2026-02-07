// Options Page - Settings for Reply Guy
import React, { useState, useEffect } from 'react';
import { extractVoiceProfile } from '@/lib/openrouter';
import { db } from '@/lib/db';
import type { VoiceProfile } from '@/lib/db';

export default function Options() {
  const [apiKey, setApiKey] = useState('');
  const [saved, setSaved] = useState(false);

  // Voice training state
  const [sampleMessages, setSampleMessages] = useState('');
  const [extracting, setExtracting] = useState(false);
  const [voiceProfile, setVoiceProfile] = useState<VoiceProfile | null>(null);
  const [profileSaved, setProfileSaved] = useState(false);

  useEffect(() => {
    // Load saved API key
    chrome.storage.local.get(['openrouterApiKey'], (result) => {
      if (result.openrouterApiKey) {
        setApiKey(result.openrouterApiKey);
      }
    });

    // Load existing voice profile
    loadVoiceProfile();
  }, []);

  const loadVoiceProfile = async () => {
    try {
      const profiles = await db.voiceProfiles.toArray();
      if (profiles.length > 0) {
        setVoiceProfile(profiles[0]);
      }
    } catch (error) {
      console.error('[Options] Failed to load voice profile:', error);
    }
  };

  const handleSave = () => {
    chrome.storage.local.set({ openrouterApiKey: apiKey }, () => {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  };

  const handleExtractVoice = async () => {
    const messages = sampleMessages
      .split('\n')
      .map(m => m.trim())
      .filter(m => m.length > 0);

    if (messages.length < 5) {
      alert('Please provide at least 5 example messages');
      return;
    }

    setExtracting(true);
    try {
      console.log('[Options] Extracting voice profile from', messages.length, 'messages');
      const profile = await extractVoiceProfile(messages);

      const voiceProfileData: VoiceProfile = {
        id: 'default',
        avgMessageLength: profile.avgMessageLength,
        emojiFrequency: profile.emojiFrequency,
        emojiTypes: profile.emojiTypes,
        tone: profile.tone,
        sentenceStructure: profile.sentenceStructure,
        openingPatterns: profile.openingPatterns,
        closingPatterns: profile.closingPatterns,
        personalityMarkers: profile.personalityMarkers,
        avoidPhrases: profile.avoidPhrases,
        exampleMessages: messages,
        lastUpdated: new Date()
      };

      // Save to IndexedDB
      await db.voiceProfiles.put(voiceProfileData);
      setVoiceProfile(voiceProfileData);
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 3000);

      console.log('[Options] Voice profile extracted and saved');
    } catch (error) {
      console.error('[Options] Error extracting voice profile:', error);
      alert('Failed to extract voice profile. Please check your API key and try again.');
    } finally {
      setExtracting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-[#ededed] p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">Reply Guy Settings</h1>

        {/* API Key Section */}
        <div className="border border-[#262626] rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">OpenRouter API Key</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-[#a1a1a1] mb-2">
                API Key
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-or-..."
                className="w-full px-3 py-2 bg-[#111] border border-[#262626] rounded text-[#ededed] placeholder-[#666] focus:outline-none focus:border-[#0070f3]"
              />
            </div>

            <button
              onClick={handleSave}
              className="px-4 py-2 bg-[#0070f3] text-white rounded hover:bg-[#0060d3] transition-colors"
            >
              {saved ? 'Saved ✓' : 'Save API Key'}
            </button>
          </div>

          <div className="mt-4 text-xs text-[#666]">
            <p>
              Get your API key from{' '}
              <a
                href="https://openrouter.ai/keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#0070f3] hover:underline"
              >
                openrouter.ai/keys
              </a>
            </p>
          </div>
        </div>

        {/* Voice Training Section */}
        <div className="border border-[#262626] rounded-lg p-6 mt-6">
          <h2 className="text-lg font-semibold mb-4">Voice Training</h2>

          {voiceProfile ? (
            // Show existing profile
            <div className="space-y-4">
              <div className="p-4 bg-[#111] border border-[#262626] rounded">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-[#ededed]">
                    Your Voice Profile
                  </span>
                  <span className="text-xs text-[#666]">
                    Updated: {new Date(voiceProfile.lastUpdated).toLocaleDateString()}
                  </span>
                </div>

                <div className="space-y-2 text-xs text-[#a1a1a1]">
                  <div className="flex justify-between">
                    <span>Average Length:</span>
                    <span className="text-[#ededed]">{voiceProfile.avgMessageLength} words</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Emoji Frequency:</span>
                    <span className="text-[#ededed]">{voiceProfile.emojiFrequency} per message</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tone:</span>
                    <span className="text-[#ededed]">{voiceProfile.tone}/10</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sentence Structure:</span>
                    <span className="text-[#ededed]">{voiceProfile.sentenceStructure}</span>
                  </div>
                </div>

                {voiceProfile.emojiTypes && voiceProfile.emojiTypes.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-[#262626]">
                    <span className="text-xs text-[#a1a1a1]">Top Emojis: </span>
                    <span className="text-xs text-[#ededed]">
                      {voiceProfile.emojiTypes.slice(0, 5).join(' ')}
                    </span>
                  </div>
                )}
              </div>

              <button
                onClick={() => {
                  setVoiceProfile(null);
                  setSampleMessages('');
                }}
                className="px-4 py-2 bg-[#262626] text-[#ededed] rounded hover:bg-[#333] transition-colors text-sm"
              >
                Update Profile
              </button>
            </div>
          ) : (
            // Show collection form
            <div className="space-y-4">
              <p className="text-sm text-[#a1a1a1]">
                Paste 5-10 example DMs you've sent. We'll extract your writing style to generate
                more authentic messages.
              </p>

              <div>
                <label className="block text-sm text-[#a1a1a1] mb-2">
                  Example Messages (one per line)
                </label>
                <textarea
                  value={sampleMessages}
                  onChange={(e) => setSampleMessages(e.target.value)}
                  placeholder="Hey! Saw your post about...&#10;Thanks for sharing...&#10;Would love to chat about..."
                  className="w-full h-48 px-3 py-2 bg-[#111] border border-[#262626] rounded text-[#ededed] placeholder-[#666] focus:outline-none focus:border-[#0070f3] text-sm resize-none"
                />
                <div className="mt-1 text-xs text-[#666]">
                  {sampleMessages.split('\n').filter(m => m.trim().length > 0).length} messages
                </div>
              </div>

              <button
                onClick={handleExtractVoice}
                disabled={extracting || sampleMessages.trim().length === 0}
                className={`
                  px-4 py-2 rounded transition-colors
                  ${extracting || sampleMessages.trim().length === 0
                    ? 'bg-[#262626] text-[#666] cursor-not-allowed'
                    : 'bg-[#0070f3] text-white hover:bg-[#0060d3]'
                  }
                `}
              >
                {extracting ? 'Extracting...' : 'Extract Voice Profile'}
              </button>

              {profileSaved && (
                <div className="text-sm text-[#00c853]">
                  Voice profile saved successfully!
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
