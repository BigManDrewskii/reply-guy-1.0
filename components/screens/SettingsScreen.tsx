import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { db } from '@/lib/db';
import { useTheme } from '@/hooks/useTheme';
import { Eye, EyeOff, Mic } from '@/lib/icons';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ConfirmDialog from '@/components/ui/dialog';

export default function SettingsScreen() {
  const { theme, setTheme: toggleTheme } = useTheme();
  const apiKey = useStore((state) => state.apiKey);
  const setApiKey = useStore((state) => state.setApiKey);
  const clearApiKey = useStore((state) => state.clearApiKey);
  const persistentGlow = useStore((state) => state.persistentGlow);
  const setPersistentGlow = useStore((state) => state.setPersistentGlow);

  const [isEditing, setIsEditing] = useState(false);
  const [newKey, setNewKey] = useState(apiKey || '');
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [voiceProfileCount, setVoiceProfileCount] = useState(0);
  const [showVoiceTraining, setShowVoiceTraining] = useState(false);
  const [showClearCacheDialog, setShowClearCacheDialog] = useState(false);
  const [showDeleteConvosDialog, setShowDeleteConvosDialog] = useState(false);

  useEffect(() => {
    // Load voice profile count
    const loadVoiceProfile = () => {
      chrome.storage.local.get('voiceProfile', (result) => {
        if (result.voiceProfile) {
          setVoiceProfileCount(result.voiceProfile.exampleMessages?.length || 0);
        }
      });
    };

    loadVoiceProfile();

    // Listen for changes
    const listener = () => loadVoiceProfile();
    chrome.storage.onChanged.addListener(listener);

    return () => chrome.storage.onChanged.removeListener(listener);
  }, []);

  const maskedKey = apiKey ? `${apiKey.slice(0, 7)}${'•'.repeat(Math.min(apiKey.length - 7, 20))}` : '';

  const validateApiKey = async () => {
    if (!newKey.trim()) {
      setError('Please enter an API key');
      return;
    }

    setIsValidating(true);
    setError('');

    try {
      const response = await fetch('https://openrouter.ai/api/v1/auth/key', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${newKey.trim()}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.data) {
          setApiKey(newKey.trim());
          setIsEditing(false);
          setShowKey(false);
        } else {
          setError('Invalid API key');
        }
      } else {
        setError('Invalid API key');
      }
    } catch {
      setError('Failed to validate API key');
    } finally {
      setIsValidating(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    validateApiKey();
  };

  const handleCancel = () => {
    setNewKey(apiKey || '');
    setError('');
    setIsEditing(false);
    setShowKey(false);
  };

  // Show voice training screen in a modal or overlay
  const handleVoiceTraining = () => {
    setShowVoiceTraining(true);
    // Open a new window or use chrome.runtime to open voice training
    chrome.tabs.create({
      url: chrome.runtime.getURL('sidepanel.html?voiceTraining=true'),
    });
    window.close();
  };

  // Check if we're in voice training mode
  const urlParams = new URLSearchParams(window.location.search);
  const isVoiceTrainingMode = urlParams.get('voiceTraining') === 'true';

  if (isVoiceTrainingMode) {
    // Dynamically import and render VoiceTrainingScreen
    const VoiceTrainingScreen = require('@/components/screens/VoiceTrainingScreen').default;
    return <VoiceTrainingScreen />;
  }

  return (
    <div className="p-4 space-y-4">
      {/* API Key Section */}
      <div>
        <h2 className="text-base font-semibold leading-tight text-foreground mb-3">API Key</h2>

        {!isEditing ? (
          <div className="space-y-3">
            <Card variant="default">
              <CardContent className="px-4 py-3 flex items-center justify-between">
                <span className="text-[13px] leading-relaxed text-foreground font-mono">
                  {showKey ? apiKey : maskedKey}
                </span>
                <button
                  onClick={() => setShowKey(!showKey)}
                  className="text-muted-foreground hover:text-foreground ml-2 flex items-center"
                  type="button"
                  aria-label={showKey ? 'Hide API key' : 'Show API key'}
                >
                  {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </CardContent>
            </Card>

            <Badge variant="success" dot size="md">Connected</Badge>

            <Button
              onClick={() => {
                setIsEditing(true);
                setNewKey(apiKey || '');
              }}
              variant="secondary"
              size="md"
              className="w-full"
            >
              Update API Key
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-3">
            <Input
              type={showKey ? 'text' : 'password'}
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              placeholder="sk-or-..."
              variant="bordered"
              size="md"
              error={!!error}
              disabled={isValidating}
            />
            {error && (
              <p className="text-xs leading-normal text-destructive">{error}</p>
            )}

            <div className="flex gap-2">
              <Button
                type="button"
                onClick={handleCancel}
                disabled={isValidating}
                variant="secondary"
                size="md"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!newKey.trim() || isValidating}
                variant="primary"
                size="md"
                className="flex-1"
              >
                {isValidating ? 'Validating...' : 'Save'}
              </Button>
            </div>
          </form>
        )}
      </div>

      <div className="border-t border-border pt-4">
        <h2 className="text-base font-semibold leading-tight text-foreground mb-3">Voice Training</h2>
        <Button
          onClick={handleVoiceTraining}
          variant="secondary"
          size="md"
          className="w-full"
        >
          <Mic size={16} className="mr-2" />
          Train Your Voice →
        </Button>
        {voiceProfileCount > 0 ? (
          <div className="mt-2 text-center">
            <Badge variant={voiceProfileCount >= 10 ? "success" : "warning"} size="sm">
              {voiceProfileCount} examples · {voiceProfileCount >= 10 ? 'Great' : 'Add more'}
            </Badge>
          </div>
        ) : (
          <p className="text-xs leading-normal text-muted-foreground mt-2 text-center">No examples yet</p>
        )}
      </div>

      <div className="border-t border-border pt-4">
        <h2 className="text-base font-semibold leading-tight text-foreground mb-3">Appearance</h2>
        <div className="space-y-2">
          <Button
            onClick={toggleTheme}
            variant="secondary"
            size="md"
            className="w-full"
          >
            {theme === 'dark' ? '☀️ Switch to Light Mode' : '🌙 Switch to Dark Mode'}
          </Button>

          <Card variant="default">
            <CardContent className="px-4 py-3">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-[13px] leading-relaxed text-foreground">
                  Keep page glow on
                </span>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={persistentGlow}
                    onChange={(e) => setPersistentGlow(e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`
                    w-10 h-6 rounded-full transition-colors duration-200
                    ${persistentGlow ? 'bg-accent' : 'bg-muted'}
                  `}>
                    <div className={`
                      w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform duration-200
                      ${persistentGlow ? 'translate-x-5' : 'translate-x-0.5'}
                      relative top-0.5
                    `} />
                  </div>
                </div>
              </label>
              <p className="text-[11px] leading-normal text-muted-foreground mt-2">
                {persistentGlow
                  ? 'Glow stays on while side panel is open'
                  : 'Glow fades after 10 seconds'}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="border-t border-border pt-4">
        <h2 className="text-base font-semibold leading-tight text-foreground mb-3">Data</h2>
        <div className="space-y-2">
          <Button
            onClick={() => setShowClearCacheDialog(true)}
            variant="ghost"
            size="md"
            className="w-full justify-start"
          >
            Clear cache
          </Button>
          <Button
            onClick={() => setShowDeleteConvosDialog(true)}
            variant="ghost"
            size="md"
            className="w-full justify-start"
          >
            Delete conversations
          </Button>
          <Button
            onClick={() => {
              if (confirm('Are you sure you want to reset everything? This will delete your API key and all data.')) {
                clearApiKey();
                chrome.storage.local.clear();
              }
            }}
            variant="danger"
            size="md"
            className="w-full justify-start"
          >
            Reset everything
          </Button>
        </div>
      </div>

      <div className="border-t border-border pt-4 text-center">
        <p className="text-[10px] leading-normal text-muted-foreground">v0.1.0 · Studio Drewskii</p>
      </div>

      {showClearCacheDialog && (
        <ConfirmDialog
          title="Clear Cache?"
          description="This will delete all cached page analyses. Your conversations and settings will be preserved."
          confirmLabel="Clear Cache"
          onConfirm={async () => {
            await db.analysisCache.clear();
          }}
          onClose={() => setShowClearCacheDialog(false)}
        />
      )}

      {showDeleteConvosDialog && (
        <ConfirmDialog
          title="Delete All Conversations?"
          description="This will permanently delete all your conversation history. This action cannot be undone."
          confirmLabel="Delete All"
          onConfirm={async () => {
            await db.conversations.clear();
          }}
          onClose={() => setShowDeleteConvosDialog(false)}
        />
      )}
    </div>
  );
}
