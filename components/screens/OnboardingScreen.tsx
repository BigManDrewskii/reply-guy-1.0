import React, { useState } from 'react';
import { ApiKeyIcon } from '../../lib/icons';
import { ICON_SIZE } from '../../lib/icons';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useStore } from '../../lib/store';

export default function OnboardingScreen() {
  const [apiKey, setApiKey] = useState('');
  const setHasApiKey = useStore((state) => state.setHasApiKey);
  const addToast = useStore((state) => state.addToast);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!apiKey.trim()) {
      addToast({
        message: 'Please enter an API key',
        type: 'error',
        duration: 3000,
      });
      return;
    }

    // Save to chrome.storage.local
    await chrome.storage.local.set({ apiKey: apiKey.trim() });
    setHasApiKey(true);

    addToast({
      message: 'API key saved!',
      type: 'success',
      duration: 2000,
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[600px] px-6">
      {/* Icon */}
      <ApiKeyIcon {...ICON_DEFAULTS} size={ICON_SIZE.xxl} className="text-text-tertiary mb-6" />

      {/* Heading */}
      <h1 className="text-xl font-semibold text-text-primary mb-2">
        Set up your API key
      </h1>

      {/* Description */}
      <p className="text-sm text-text-secondary text-center mb-8 max-w-xs">
        Reply Guy uses OpenRouter to analyze pages and generate outreach messages.
      </p>

      {/* Form */}
      <form onSubmit={handleSubmit} className="w-full max-w-xs space-y-4">
        <Input
          type="password"
          placeholder="Enter your OpenRouter key"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          className="w-full"
        />

        <Button type="submit" variant="inverted" size="md" className="w-full">
          Get Started →
        </Button>
      </form>

      {/* Help link */}
      <a
        href="https://openrouter.ai"
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-text-secondary hover:text-text-primary mt-6 underline"
      >
        Get a key at openrouter.ai ↗
      </a>
    </div>
  );
}
