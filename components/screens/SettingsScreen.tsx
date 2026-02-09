import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { db } from '@/lib/db';
import { Eye, EyeOff, Mic, ChevronRight } from '@/lib/icons';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ConfirmDialog from '@/components/ui/dialog';
import { useToast } from '@/components/ui/useToast';
import { MODEL_CHAIN } from '@/lib/openrouter';

interface SettingsScreenProps {
  onNavigateVoiceTraining?: () => void;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[10.5px] font-semibold uppercase tracking-[0.06em] text-muted-foreground mb-2.5">
      {children}
    </h2>
  );
}

export default function SettingsScreen({ onNavigateVoiceTraining }: SettingsScreenProps) {
  const apiKey = useStore((state) => state.apiKey);
  const setApiKey = useStore((state) => state.setApiKey);
  const clearApiKey = useStore((state) => state.clearApiKey);
  const persistentGlow = useStore((state) => state.persistentGlow);
  const setPersistentGlow = useStore((state) => state.setPersistentGlow);
  const preferredModel = useStore((state) => state.preferredModel);
  const setPreferredModel = useStore((state) => state.setPreferredModel);
  const { add: addToast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [newKey, setNewKey] = useState(apiKey || '');
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [voiceProfileCount, setVoiceProfileCount] = useState(0);
  const [hasStructuredProfile, setHasStructuredProfile] = useState(false);
  const [showClearCacheDialog, setShowClearCacheDialog] = useState(false);
  const [showDeleteConvosDialog, setShowDeleteConvosDialog] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [isClearingCache, setIsClearingCache] = useState(false);
  const [isDeletingConvos, setIsDeletingConvos] = useState(false);

  useEffect(() => {
    const loadVoiceProfile = () => {
      chrome.storage.local.get('voiceProfile', (result) => {
        if (result.voiceProfile) {
          const vp = result.voiceProfile;
          const isStructured = !!(vp.register || vp.registerDimensions || vp.quantitativeAnchors);
          setHasStructuredProfile(isStructured);
          setVoiceProfileCount(
            isStructured
              ? (vp.exemplars?.length || vp.sampleCount || 0)
              : (vp.sampleCount || vp.exampleMessages?.length || 0)
          );
        } else {
          setHasStructuredProfile(false);
          setVoiceProfileCount(0);
        }
      });
    };

    loadVoiceProfile();

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
          addToast({ type: 'success', message: 'API key updated successfully' });
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

  // Friendly model names
  const modelLabels: Record<string, string> = {
    'google/gemini-2.0-flash-001': 'Gemini 2.0 Flash',
    'anthropic/claude-3.5-haiku': 'Claude 3.5 Haiku',
    'openai/gpt-4o-mini': 'GPT-4o Mini',
  };

  return (
    <div className="space-y-6 stagger-children">
      {/* API Key Section */}
      <div>
        <SectionLabel>API Key</SectionLabel>
        <Card variant="default">
          <CardContent className="p-4">
            {!isEditing ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <code className="text-xs text-foreground/70 font-mono truncate flex-1 mr-3">
                    {showKey ? apiKey : maskedKey}
                  </code>
                  <button
                    onClick={() => setShowKey(!showKey)}
                    className="text-muted-foreground hover:text-foreground transition-colors duration-200 p-1.5 rounded-lg hover:bg-muted/50"
                    type="button"
                    aria-label={showKey ? 'Hide API key' : 'Show API key'}
                  >
                    {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <Badge variant="success" dot size="sm">Connected</Badge>
                  <button
                    onClick={() => {
                      setIsEditing(true);
                      setNewKey(apiKey || '');
                    }}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors duration-200"
                  >
                    Change
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSave} className="space-y-3">
                <Input
                  type={showKey ? 'text' : 'password'}
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  placeholder="sk-or-..."
                  size="md"
                  error={!!error}
                  disabled={isValidating}
                />
                {error && (
                  <p className="text-xs text-destructive">{error}</p>
                )}
                <div className="flex gap-2.5">
                  <Button
                    type="button"
                    onClick={handleCancel}
                    disabled={isValidating}
                    variant="ghost"
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
          </CardContent>
        </Card>
      </div>

      {/* Model Selection */}
      <div>
        <SectionLabel>AI Model</SectionLabel>
        <Card variant="default">
          <CardContent className="p-4 space-y-2.5">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Primary model for generation. Falls back to others if unavailable.
            </p>
            <div className="space-y-1">
              {MODEL_CHAIN.map((model) => (
                <button
                  key={model}
                  onClick={() => setPreferredModel(model)}
                  className={`
                    w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left transition-all duration-[200ms]
                    ${preferredModel === model
                      ? 'bg-muted border border-border/50'
                      : 'hover:bg-card-hover border border-transparent'
                    }
                  `}
                >
                  <span className={`text-sm ${preferredModel === model ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                    {modelLabels[model] || model.split('/')[1]}
                  </span>
                  {preferredModel === model && (
                    <div className="w-2 h-2 rounded-full bg-foreground" />
                  )}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Voice Training Section */}
      <div>
        <SectionLabel>Voice Training</SectionLabel>
        <Card variant="default">
          <CardContent className="p-0">
            <button
              onClick={onNavigateVoiceTraining}
              className="w-full flex items-center justify-between p-4 hover:bg-card-hover transition-all duration-[200ms] rounded-xl group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center group-hover:bg-muted-hover transition-colors duration-[200ms]">
                  <Mic size={15} className="text-muted-foreground" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-foreground">Train Your Voice</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {hasStructuredProfile
                      ? `${voiceProfileCount} exemplar${voiceProfileCount !== 1 ? 's' : ''} \u00b7 Style DNA active`
                      : voiceProfileCount > 0
                      ? `${voiceProfileCount} example${voiceProfileCount !== 1 ? 's' : ''} \u00b7 Retrain for Style DNA`
                      : 'No profile yet'
                    }
                  </p>
                </div>
              </div>
              <ChevronRight size={15} className="text-muted-foreground group-hover:translate-x-0.5 transition-transform duration-[200ms]" />
            </button>
          </CardContent>
        </Card>
      </div>

      {/* Appearance Section */}
      <div>
        <SectionLabel>Appearance</SectionLabel>
        <Card variant="default">
          <CardContent className="p-4">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="text-sm text-foreground">Page glow</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {persistentGlow ? 'Stays on while panel is open' : 'Fades after 10 seconds'}
                </p>
              </div>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={persistentGlow}
                  onChange={(e) => setPersistentGlow(e.target.checked)}
                  className="sr-only"
                />
                <div className={`
                  w-10 h-[22px] rounded-full transition-colors duration-[250ms]
                  ${persistentGlow ? 'bg-foreground' : 'bg-muted'}
                `}>
                  <div className={`
                    w-[18px] h-[18px] bg-background rounded-full shadow-xs transform transition-transform duration-[250ms]
                    ${persistentGlow ? 'translate-x-[20px]' : 'translate-x-[2px]'}
                    relative top-[2px]
                  `} />
                </div>
              </div>
            </label>
          </CardContent>
        </Card>
      </div>

      {/* Data Section */}
      <div>
        <SectionLabel>Data</SectionLabel>
        <Card variant="default">
          <CardContent className="p-1.5">
            <button
              onClick={() => setShowClearCacheDialog(true)}
              disabled={isClearingCache}
              className="w-full flex items-center justify-between px-3.5 py-3 hover:bg-card-hover transition-all duration-[200ms] rounded-xl text-left disabled:opacity-40"
            >
              <span className="text-sm text-foreground">
                {isClearingCache ? 'Clearing...' : 'Clear cache'}
              </span>
              <ChevronRight size={14} className="text-muted-foreground" />
            </button>
            <div className="mx-3.5 border-t border-border/30" />
            <button
              onClick={() => setShowDeleteConvosDialog(true)}
              disabled={isDeletingConvos}
              className="w-full flex items-center justify-between px-3.5 py-3 hover:bg-card-hover transition-all duration-[200ms] rounded-xl text-left disabled:opacity-40"
            >
              <span className="text-sm text-foreground">
                {isDeletingConvos ? 'Deleting...' : 'Delete conversations'}
              </span>
              <ChevronRight size={14} className="text-muted-foreground" />
            </button>
            <div className="mx-3.5 border-t border-border/30" />
            <button
              onClick={() => setShowResetDialog(true)}
              className="w-full flex items-center justify-between px-3.5 py-3 hover:bg-card-hover transition-all duration-[200ms] rounded-xl text-left"
            >
              <span className="text-sm text-destructive">Reset everything</span>
              <ChevronRight size={14} className="text-destructive/50" />
            </button>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <div className="text-center pb-3">
        <p className="text-[10px] text-muted-foreground/40 font-medium">v0.3.0 · Studio Drewskii</p>
      </div>

      {showClearCacheDialog && (
        <ConfirmDialog
          title="Clear Cache?"
          description="This will delete all cached page analyses. Your conversations and settings will be preserved."
          confirmLabel="Clear Cache"
          onConfirm={async () => {
            setIsClearingCache(true);
            try {
              await db.analysisCache.clear();
              addToast({ type: 'success', message: 'Cache cleared successfully' });
            } catch {
              addToast({ type: 'error', message: 'Failed to clear cache' });
            } finally {
              setIsClearingCache(false);
            }
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
            setIsDeletingConvos(true);
            try {
              await db.conversations.clear();
              addToast({ type: 'success', message: 'Conversations deleted' });
            } catch {
              addToast({ type: 'error', message: 'Failed to delete conversations' });
            } finally {
              setIsDeletingConvos(false);
            }
          }}
          onClose={() => setShowDeleteConvosDialog(false)}
        />
      )}

      {showResetDialog && (
        <ConfirmDialog
          title="Reset Everything?"
          description="This will delete your API key, voice profile, all conversations, and cached data. This action cannot be undone."
          confirmLabel="Reset Everything"
          onConfirm={async () => {
            try {
              clearApiKey();
              await db.delete();
              chrome.storage.local.clear();
              addToast({ type: 'success', message: 'All data has been reset' });
            } catch {
              addToast({ type: 'error', message: 'Failed to reset data' });
            }
          }}
          onClose={() => setShowResetDialog(false)}
        />
      )}
    </div>
  );
}
