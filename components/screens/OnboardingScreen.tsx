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
      <div className="flex flex-col items-center justify-center min-h-[75vh] px-6 animate-fade-in-up">
        {/* Logo */}
        <div className="w-16 h-16 rounded-2xl bg-foreground flex items-center justify-center mb-8">
          <Zap size={28} className="text-background" />
        </div>

        <h1 className="text-xl font-semibold text-foreground mb-2 tracking-tight">
          Reply Guy
        </h1>

        <p className="text-sm text-muted-foreground text-center max-w-[240px] leading-relaxed mb-10">
          AI-powered outreach that sounds like you. Analyze profiles and craft personalized messages.
        </p>

        {/* Steps */}
        <div className="w-full max-w-[260px] space-y-4 mb-10">
          {[
            { num: '1', label: 'Connect your API key' },
            { num: '2', label: 'Train your voice' },
            { num: '3', label: 'Start reaching out' },
          ].map((item, i) => (
            <div key={item.num} className="flex items-center gap-3.5" style={{ animationDelay: `${i * 80}ms` }}>
              <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-[12px] font-semibold text-muted-foreground shrink-0">
                {item.num}
              </div>
              <span className="text-sm text-foreground/80">{item.label}</span>
            </div>
          ))}
        </div>

        <Button
          onClick={() => setStep('apiKey')}
          variant="primary"
          size="lg"
          className="w-full max-w-[260px]"
        >
          Get Started
          <ChevronRight size={15} />
        </Button>
      </div>
    );
  }

  // Step 2: API Key
  return (
    <div className="flex flex-col items-center justify-center min-h-[75vh] px-6 animate-fade-in-up">
      <div className="w-12 h-12 rounded-xl bg-muted/60 flex items-center justify-center mb-6">
        <Key size={20} className="text-muted-foreground" />
      </div>

      <h1 className="text-lg font-semibold text-foreground mb-1.5 tracking-tight">
        Connect your API key
      </h1>

      <p className="text-sm text-muted-foreground text-center max-w-[260px] leading-relaxed mb-6">
        Reply Guy uses OpenRouter for AI. You'll need an API key to get started.
      </p>

      <form onSubmit={handleSubmit} className="w-full max-w-[280px] space-y-3.5">
        <div>
          <Input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-or-..."
            size="lg"
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
          size="lg"
          disabled={!apiKey.trim() || isValidating}
          loading={isValidating}
          className="w-full"
        >
          {isValidating ? 'Validating...' : 'Connect'}
        </Button>
      </form>

      <div className="mt-6 flex flex-col items-center gap-3">
        <a
          href="https://openrouter.ai/keys"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-muted-foreground hover:text-foreground transition-colors duration-200 inline-flex items-center gap-1.5"
        >
          Get a key at openrouter.ai
          <ExternalLink size={15} />
        </a>

        <button
          onClick={() => setStep('welcome')}
          className="text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors duration-200"
        >
          Back
        </button>
      </div>
    </div>
  );
}
