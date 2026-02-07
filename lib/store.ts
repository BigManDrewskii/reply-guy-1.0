// Reply Guy - Zustand Store
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Profile data (from scraper)
export interface ProfileData {
  name: string;
  handle: string;
  bio: string;
  location?: string;
  followers?: number;
  verified: boolean;
  recentPosts?: any[];
}

// Analysis result
export interface ProfileAnalysis {
  summary: string;
  painPoints: string[];
  outreachAngles: any[];
  confidence: number;
}

// Generated message
export interface GeneratedMessage {
  id: string;
  angle: string;
  content: string;
  voiceMatchScore: number;
  whyItWorks: string;
}

// UI state
export interface UIState {
  selectedTab: string;
  isGenerating: boolean;
  error: string | null;
}

// Store state
interface ReplyGuyState {
  // Current profile
  currentProfile: ProfileData | null;
  setCurrentProfile: (profile: ProfileData | null) => void;

  // Profile analysis
  profileAnalysis: ProfileAnalysis | null;
  setProfileAnalysis: (analysis: ProfileAnalysis | null) => void;

  // Generated messages
  generatedMessages: GeneratedMessage[];
  setGeneratedMessages: (messages: GeneratedMessage[]) => void;
  addMessage: (message: GeneratedMessage) => void;

  // Voice profile
  voiceProfile: any | null;
  setVoiceProfile: (profile: any | null) => void;

  // UI state
  ui: UIState;
  setSelectedTab: (tab: string) => void;
  setIsGenerating: (isGenerating: boolean) => void;
  setError: (error: string | null) => void;
}

export const useReplyGuyStore = create<ReplyGuyState>()(
  persist(
    (set) => ({
      // Current profile
      currentProfile: null,
      setCurrentProfile: (profile) => set({ currentProfile: profile }),

      // Profile analysis
      profileAnalysis: null,
      setProfileAnalysis: (analysis) => set({ profileAnalysis: analysis }),

      // Generated messages
      generatedMessages: [],
      setGeneratedMessages: (messages) => set({ generatedMessages: messages }),
      addMessage: (message) =>
        set((state) => ({
          generatedMessages: [...state.generatedMessages, message]
        })),

      // Voice profile
      voiceProfile: null,
      setVoiceProfile: (profile) => set({ voiceProfile: profile }),

      // UI state
      ui: {
        selectedTab: 'service',
        isGenerating: false,
        error: null,
      },
      setSelectedTab: (tab) =>
        set((state) => ({
          ui: { ...state.ui, selectedTab: tab }
        })),
      setIsGenerating: (isGenerating) =>
        set((state) => ({
          ui: { ...state.ui, isGenerating }
        })),
      setError: (error) =>
        set((state) => ({
          ui: { ...state.ui, error }
        })),
    }),
    {
      name: 'reply-guy-storage',
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
