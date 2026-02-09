import { useState } from 'react';
import { useStore } from '@/lib/store';
import { Key, ExternalLink, Zap, Mic, ChevronRight } from '@/lib/icons';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

type OnboardingStep = 'welcome' | 'apiKey' | 'voicePrompt';

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
          // Key is valid — store it and advance to voice prompt
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

  // Step 1: Welcome
  if (step === 'welcome') {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 animate-fade-in">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-foreground/10 to-foreground/5 flex items-center justify-center mb-6 border border-border">
          <Zap size={36} className="text-foreground" />
        </div>

        <h1 className="text-lg font-semibold leading-tight text-foreground mb-2">
          Welcome to Reply Guy
        </h1>

        <p className="text-[13px] leading-relaxed text-muted-foreground mb-8 text-center max-w-xs">
          AI-powered outreach that sounds like you. Analyze any profile and generate personalized messages in seconds.
        </p>

        <div className="w-full max-w-sm space-y-3 mb-8">
          {[
            { icon: '1', title: 'Connect your API key', desc: 'Powered by OpenRouter for flexible model access' },
            { icon: '2', title: 'Train your voice', desc: 'Optional: teach the AI your writing style' },
            { icon: '3', title: 'Start reaching out', desc: 'Analyze profiles and generate messages' },
          ].map((item) => (
            <Card key={item.icon} variant="default">
              <CardContent className="p-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center text-xs font-bold shrink-0">
                  {item.icon}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Button
          onClick={() => setStep('apiKey')}
          variant="primary"
          size="md"
          className="w-full max-w-sm"
        >
          Get Started
          <ChevronRight size={16} className="ml-1" />
        </Button>
      </div>
    );
  }

  // Step 2: API Key
  return (
    <div className="flex flex-col items-center justify-center h-full p-6 animate-fade-in">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-6">
        <Key size={32} className="text-foreground" />
      </div>

      <h1 className="text-base font-semibold leading-tight text-foreground mb-3">
        Set up your API key
      </h1>

      <p className="text-[13px] leading-relaxed text-muted-foreground mb-6 text-center">
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
            <p className="text-xs leading-normal text-destructive mt-2">{error}</p>
          )}
        </div>

        <Button
          type="submit"
          variant="primary"
          size="md"
          disabled={!apiKey.trim() || isValidating}
          className="w-full"
        >
          {isValidating ? 'Validating...' : 'Connect API Key →'}
        </Button>
      </form>

      <div className="mt-6 flex flex-col items-center gap-3">
        <a
          href="https://openrouter.ai/keys"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs leading-normal text-primary hover:underline inline-flex items-center"
        >
          Get a key at openrouter.ai
          <ExternalLink size={12} className="ml-1" />
        </a>

        <button
          onClick={() => setStep('welcome')}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back
        </button>
      </div>
    </div>
  );
}
