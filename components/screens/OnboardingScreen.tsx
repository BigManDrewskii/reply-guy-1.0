import { useState } from 'react';
import { useStore } from '@/lib/store';
import { Key, ExternalLink, Zap, ChevronRight } from '@/lib/icons';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

type OnboardingStep = 'welcome' | 'apiKey';

export default function OnboardingScreen() {
  const [step, setStep] = useState<OnboardingStep>('welcome');
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
      setError('Failed to validate. Please try again.');
    } finally {
      setIsValidating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    validateApiKey();
  };

  // Step 1: Welcome
  if (step === 'welcome') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 animate-fade-in">
        {/* Logo */}
        <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mb-6">
          <Zap size={26} className="text-primary-foreground" />
        </div>

        <h1 className="text-lg font-semibold text-foreground mb-1.5">
          Reply Guy
        </h1>

        <p className="text-xs text-muted-foreground text-center max-w-[220px] leading-relaxed mb-8">
          AI-powered outreach that sounds like you. Analyze profiles and craft personalized messages.
        </p>

        {/* Steps */}
        <div className="w-full max-w-[260px] space-y-3 mb-8">
          {[
            { num: '1', label: 'Connect API key' },
            { num: '2', label: 'Train your voice (optional)' },
            { num: '3', label: 'Start reaching out' },
          ].map((item) => (
            <div key={item.num} className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-semibold text-muted-foreground shrink-0">
                {item.num}
              </div>
              <span className="text-[13px] text-foreground/80">{item.label}</span>
            </div>
          ))}
        </div>

        <Button
          onClick={() => setStep('apiKey')}
          variant="primary"
          size="md"
          className="w-full max-w-[260px]"
        >
          Get Started
          <ChevronRight size={14} />
        </Button>
      </div>
    );
  }

  // Step 2: API Key
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 animate-fade-in">
      <div className="w-10 h-10 rounded-xl bg-muted/60 flex items-center justify-center mb-5">
        <Key size={18} className="text-muted-foreground" />
      </div>

      <h1 className="text-base font-semibold text-foreground mb-1">
        Connect your API key
      </h1>

      <p className="text-xs text-muted-foreground text-center max-w-[240px] leading-relaxed mb-5">
        Reply Guy uses OpenRouter for AI. You'll need an API key to get started.
      </p>

      <form onSubmit={handleSubmit} className="w-full max-w-[280px] space-y-3">
        <div>
          <Input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-or-..."
            size="md"
            error={!!error}
            disabled={isValidating}
          />
          {error && (
            <p className="text-[11px] text-destructive mt-1.5">{error}</p>
          )}
        </div>

        <Button
          type="submit"
          variant="primary"
          size="md"
          disabled={!apiKey.trim() || isValidating}
          loading={isValidating}
          className="w-full"
        >
          {isValidating ? 'Validating...' : 'Connect'}
        </Button>
      </form>

      <div className="mt-5 flex flex-col items-center gap-2.5">
        <a
          href="https://openrouter.ai/keys"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
        >
          Get a key at openrouter.ai
          <ExternalLink size={10} />
        </a>

        <button
          onClick={() => setStep('welcome')}
          className="text-[11px] text-muted-foreground/60 hover:text-muted-foreground transition-colors"
        >
          Back
        </button>
      </div>
    </div>
  );
}
