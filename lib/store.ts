import { create } from 'zustand';
import type {
  Tab,
  ScrapedData,
  Analysis,
  GeneratedMessage,
  VoiceProfile,
  OutreachAngle,
  Toast,
} from '../types';

interface AppState {
  // UI State
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;

  // Onboarding
  hasApiKey: boolean;
  setHasApiKey: (has: boolean) => void;

  // Page Data
  pageData: ScrapedData | null;
  setPageData: (data: ScrapedData | null) => void;

  // Analysis
  analysis: Analysis | null;
  setAnalysis: (analysis: Analysis | null) => void;
  isAnalyzing: boolean;
  setIsAnalyzing: (is: boolean) => void;

  // Messages
  messages: GeneratedMessage[];
  setMessages: (messages: GeneratedMessage[]) => void;
  activeAngle: OutreachAngle['angle'] | null;
  setActiveAngle: (angle: OutreachAngle['angle'] | null) => void;

  // Voice Profile
  voiceProfile: VoiceProfile | null;
  setVoiceProfile: (profile: VoiceProfile | null) => void;

  // Toasts
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

export const useStore = create<AppState>((set) => ({
  // UI State
  activeTab: 'outreach',
  setActiveTab: (tab) => set({ activeTab: tab }),

  // Onboarding
  hasApiKey: false,
  setHasApiKey: (has) => set({ hasApiKey: has }),

  // Page Data
  pageData: null,
  setPageData: (data) => set({ pageData: data }),

  // Analysis
  analysis: null,
  setAnalysis: (analysis) => set({ analysis }),
  isAnalyzing: false,
  setIsAnalyzing: (is) => set({ isAnalyzing: is }),

  // Messages
  messages: [],
  setMessages: (messages) => set({ messages }),
  activeAngle: null,
  setActiveAngle: (angle) => set({ activeAngle: angle }),

  // Voice Profile
  voiceProfile: null,
  setVoiceProfile: (profile) => set({ voiceProfile: profile }),

  // Toasts
  toasts: [],
  addToast: (toast) => set((state) => ({
    toasts: [
      ...state.toasts,
      { ...toast, id: crypto.randomUUID() },
    ],
  })),
  removeToast: (id) => set((state) => ({
    toasts: state.toasts.filter((t) => t.id !== id),
  })),
}));
