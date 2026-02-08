import { useState } from 'react';
import { useStore } from '@/lib/store';
import { Key, ExternalLink } from '@/lib/icons';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';

export default function OnboardingScreen() {
  const [apiKey, setApiKey] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState('');
  const setStoredApiKey = useStore((state) => state.setApiKey);

  const validateApiKey = async () => {
    if (!apiKey.trim()) {
      setError('Please enter an API key');
      return;
    }

    setIsValidating(true);
    setError('');

    try {
      const response = await fetch('https://openrouter.ai/api/v1/auth/key', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey.trim()}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.data) {
          setStoredApiKey(apiKey.trim());
        } else {
          setError('Invalid API key');
        }
      } else {
        setError('Invalid API key');
      }
    } catch {
      setError('Failed to validate API key. Please try again.');
    } finally {
      setIsValidating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    validateApiKey();
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-6">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-6">
        <Key size={32} className="text-foreground" />
      </div>

      <h1 className="text-2xl font-semibold text-foreground mb-3">
        Set up your API key
      </h1>

      <p className="text-sm text-muted-foreground mb-6 text-center leading-relaxed">
        Reply Guy uses OpenRouter to analyze pages and generate outreach messages.
      </p>

      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-6">
        <div>
          <Input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-or-..."
            variant="bordered"
            size="md"
            error={!!error}
            disabled={isValidating}
          />
          {error && (
            <p className="text-xs text-destructive mt-2">{error}</p>
          )}
        </div>

        <Button
          type="submit"
          variant="primary"
          size="md"
          disabled={!apiKey.trim() || isValidating}
          className="w-full"
        >
          {isValidating ? 'Validating...' : 'Get Started →'}
        </Button>
      </form>

      <div className="mt-8">
        <a
          href="https://openrouter.ai/keys"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-primary hover:underline inline-flex items-center"
        >
          Get a key at openrouter.ai
          <ExternalLink size={12} className="ml-1" />
        </a>
      </div>
    </div>
  );
}
