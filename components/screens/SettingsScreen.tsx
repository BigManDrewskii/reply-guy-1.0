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

interface SettingsScreenProps {
  onNavigateVoiceTraining?: () => void;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-2">
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
  const { add: addToast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [newKey, setNewKey] = useState(apiKey || '');
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [voiceProfileCount, setVoiceProfileCount] = useState(0);
  const [showClearCacheDialog, setShowClearCacheDialog] = useState(false);
  const [showDeleteConvosDialog, setShowDeleteConvosDialog] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [isClearingCache, setIsClearingCache] = useState(false);
  const [isDeletingConvos, setIsDeletingConvos] = useState(false);

  useEffect(() => {
    const loadVoiceProfile = () => {
      chrome.storage.local.get('voiceProfile', (result) => {
        if (result.voiceProfile) {
          setVoiceProfileCount(result.voiceProfile.exampleMessages?.length || 0);
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

  return (
    <div className="space-y-5">
      {/* API Key Section */}
      <div>
        <SectionLabel>API Key</SectionLabel>
        <Card variant="default">
          <CardContent className="p-3">
            {!isEditing ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <code className="text-xs text-foreground/80 font-mono truncate flex-1 mr-2">
                    {showKey ? apiKey : maskedKey}
                  </code>
                  <button
                    onClick={() => setShowKey(!showKey)}
                    className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded"
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
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Change
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSave} className="space-y-2.5">
                <Input
                  type={showKey ? 'text' : 'password'}
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  placeholder="sk-or-..."
                  size="sm"
                  error={!!error}
                  disabled={isValidating}
                />
                {error && (
                  <p className="text-[11px] text-destructive">{error}</p>
                )}
                <div className="flex gap-2">
                  <Button
                    type="button"
                    onClick={handleCancel}
                    disabled={isValidating}
                    variant="ghost"
                    size="sm"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={!newKey.trim() || isValidating}
                    variant="primary"
                    size="sm"
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

      {/* Voice Training Section */}
      <div>
        <SectionLabel>Voice Training</SectionLabel>
        <Card variant="default">
          <CardContent className="p-0">
            <button
              onClick={onNavigateVoiceTraining}
              className="w-full flex items-center justify-between p-3 hover:bg-card-hover transition-colors rounded-xl"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                  <Mic size={14} className="text-muted-foreground" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-foreground">Train Your Voice</p>
                  <p className="text-[11px] text-muted-foreground">
                    {voiceProfileCount > 0
                      ? `${voiceProfileCount} example${voiceProfileCount !== 1 ? 's' : ''} · ${voiceProfileCount >= 10 ? 'Great' : 'Add more'}`
                      : 'No examples yet'
                    }
                  </p>
                </div>
              </div>
              <ChevronRight size={14} className="text-muted-foreground" />
            </button>
          </CardContent>
        </Card>
      </div>

      {/* Appearance Section */}
      <div>
        <SectionLabel>Appearance</SectionLabel>
        <Card variant="default">
          <CardContent className="p-3">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="text-sm text-foreground">Page glow</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
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
                  w-9 h-5 rounded-full transition-colors duration-200
                  ${persistentGlow ? 'bg-primary' : 'bg-muted'}
                `}>
                  <div className={`
                    w-4 h-4 bg-white rounded-full shadow-xs transform transition-transform duration-200
                    ${persistentGlow ? 'translate-x-[18px]' : 'translate-x-[2px]'}
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
          <CardContent className="p-1">
            <button
              onClick={() => setShowClearCacheDialog(true)}
              disabled={isClearingCache}
              className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-card-hover transition-colors rounded-lg text-left disabled:opacity-50"
            >
              <span className="text-sm text-foreground">
                {isClearingCache ? 'Clearing...' : 'Clear cache'}
              </span>
              <ChevronRight size={14} className="text-muted-foreground" />
            </button>
            <div className="mx-3 border-t border-border/40" />
            <button
              onClick={() => setShowDeleteConvosDialog(true)}
              disabled={isDeletingConvos}
              className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-card-hover transition-colors rounded-lg text-left disabled:opacity-50"
            >
              <span className="text-sm text-foreground">
                {isDeletingConvos ? 'Deleting...' : 'Delete conversations'}
              </span>
              <ChevronRight size={14} className="text-muted-foreground" />
            </button>
            <div className="mx-3 border-t border-border/40" />
            <button
              onClick={() => setShowResetDialog(true)}
              className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-card-hover transition-colors rounded-lg text-left"
            >
              <span className="text-sm text-destructive">Reset everything</span>
              <ChevronRight size={14} className="text-destructive/60" />
            </button>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <div className="text-center pb-2">
        <p className="text-[10px] text-muted-foreground/60">v0.1.0 · Studio Drewskii</p>
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
