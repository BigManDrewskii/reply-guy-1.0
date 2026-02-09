import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type MessageLength = 'short' | 'medium' | 'long';

interface AppState {
  // API Key
  apiKey: string | null;
  setApiKey: (key: string) => void;
  clearApiKey: () => void;

  // UI State
  activeScreen: 'outreach' | 'history' | 'settings';
  setActiveScreen: (screen: 'outreach' | 'history' | 'settings') => void;

  // Appearance
  persistentGlow: boolean;
  setPersistentGlow: (enabled: boolean) => void;

  // Message preferences
  messageLength: MessageLength;
  setMessageLength: (length: MessageLength) => void;

  // Model preference
  preferredModel: string | null;
  setPreferredModel: (model: string | null) => void;

  // Error handling
  lastError: string | null;
  setLastError: (error: string | null) => void;
  clearError: () => void;

  // Offline state
  isOnline: boolean;
  setIsOnline: (online: boolean) => void;

  // Voice profile
  voiceProfileLoaded: boolean;
  setVoiceProfileLoaded: (loaded: boolean) => void;

  // Pending actions (for offline queue)
  pendingActions: Array<{
    type: 'analyze' | 'generate' | 'log';
    data: any;
    timestamp: number;
  }>;
  addPendingAction: (action: { type: string; data: any }) => void;
  clearPendingActions: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      // API Key
      apiKey: null,
      setApiKey: (key) => set({ apiKey: key }),
      clearApiKey: () => set({ apiKey: null }),

      // UI State
      activeScreen: 'outreach',
      setActiveScreen: (screen) => set({ activeScreen: screen }),

      // Appearance
      persistentGlow: false,
      setPersistentGlow: (enabled) => set({ persistentGlow: enabled }),

      // Message preferences
      messageLength: 'medium',
      setMessageLength: (length) => set({ messageLength: length }),

      // Model preference
      preferredModel: null,
      setPreferredModel: (model) => set({ preferredModel: model }),

      // Error handling
      lastError: null,
      setLastError: (error) => set({ lastError: error }),
      clearError: () => set({ lastError: null }),

      // Offline state
      isOnline: navigator.onLine,
      setIsOnline: (online) => set({ isOnline: online }),

      // Voice profile
      voiceProfileLoaded: false,
      setVoiceProfileLoaded: (loaded) => set({ voiceProfileLoaded: loaded }),

      // Pending actions
      pendingActions: [],
      addPendingAction: (action) =>
        set((state) => ({
          pendingActions: [
            ...state.pendingActions,
            { ...action, timestamp: Date.now() },
          ],
        })),
      clearPendingActions: () => set({ pendingActions: [] }),
    }),
    {
      name: 'reply-guy-storage',
      partialize: (state) => ({
        // Only persist these fields
        apiKey: state.apiKey,
        activeScreen: state.activeScreen,
        persistentGlow: state.persistentGlow,
        messageLength: state.messageLength,
        preferredModel: state.preferredModel,
        voiceProfileLoaded: state.voiceProfileLoaded,
        // Don't persist: lastError, isOnline, pendingActions
      }),
      storage: {
        getItem: (name) => {
          return new Promise((resolve) => {
            chrome.storage.local.get([name], (result) => {
              resolve(result[name]);
            });
          });
        },
        setItem: (name, value) => {
          return new Promise((resolve) => {
            chrome.storage.local.set({ [name]: value }, () => {
              resolve();
            });
          });
        },
        removeItem: (name) => {
          return new Promise((resolve) => {
            chrome.storage.local.remove([name], () => {
              resolve();
            });
          });
        },
      },
    }
  )
);
