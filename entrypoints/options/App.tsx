// Options Page - Settings for Reply Guy
import React, { useState, useEffect } from 'react';

export default function Options() {
  const [apiKey, setApiKey] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Load saved API key
    chrome.storage.local.get(['openrouterApiKey'], (result) => {
      if (result.openrouterApiKey) {
        setApiKey(result.openrouterApiKey);
      }
    });
  }, []);

  const handleSave = () => {
    chrome.storage.local.set({ openrouterApiKey: apiKey }, () => {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
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

        {/* Voice Training Section (placeholder) */}
        <div className="border border-[#262626] rounded-lg p-6 mt-6">
          <h2 className="text-lg font-semibold mb-4">Voice Training</h2>
          <p className="text-sm text-[#a1a1a1]">
            Upload example DMs to train Reply Guy to write like you.
          </p>
          <button
            disabled
            className="mt-4 px-4 py-2 bg-[#262626] text-[#666] rounded cursor-not-allowed"
          >
            Coming Soon
          </button>
        </div>
      </div>
    </div>
  );
}
