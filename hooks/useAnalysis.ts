import { useState, useCallback, useRef } from 'react';
import { useStore } from '@/lib/store';
import { getAnalysisPrompt } from '@/lib/prompts';
import {
  streamCompletion,
  getCachedAnalysis,
  setCachedAnalysis,
  extractJsonFromResponse,
} from '@/lib/openrouter';
import type { PageData, AnalysisResult } from '@/types';

interface UseAnalysisResult {
  analysis: AnalysisResult | null;
  isAnalyzing: boolean;
  isDebouncing: boolean;
  debounceCountdown: number;
  error: string | null;
  analyzePage: (pageData: PageData) => Promise<void>;
  cancelAnalysis: () => void;
}

export function useAnalysis(): UseAnalysisResult {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDebouncing, setIsDebouncing] = useState(false);
  const [debounceCountdown, setDebounceCountdown] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const apiKey = useStore((state) => state.apiKey);

  // Refs to track debounced calls and abort
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const currentUrlRef = useRef<string | null>(null);
  const pageDataRef = useRef<PageData | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const MAX_RETRIES = 3;

  const cancelAnalysis = useCallback(() => {
    // Abort any in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    // Clear debounce timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
      debounceTimeoutRef.current = null;
    }

    // Clear countdown interval
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }

    // Reset states
    setIsDebouncing(false);
    setDebounceCountdown(0);
    setIsAnalyzing(false);
    currentUrlRef.current = null;
  }, []);

  const analyzePage = useCallback(async (pageData: PageData) => {
    if (!apiKey) {
      setError('No API key configured');
      return;
    }

    // Prevent duplicate calls for the same URL
    if (currentUrlRef.current === pageData.url && (isAnalyzing || isDebouncing)) {
      return;
    }

    // Cancel any pending analysis
    cancelAnalysis();

    // Set current URL
    currentUrlRef.current = pageData.url;
    pageDataRef.current = pageData;

    // Start debouncing
    setIsDebouncing(true);
    setDebounceCountdown(1);
    setError(null);

    // Countdown timer
    let countdown = 1;
    countdownIntervalRef.current = setInterval(() => {
      countdown--;
      setDebounceCountdown(countdown);
      if (countdown <= 0) {
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
        }
      }
    }, 1000);

    // Debounce delay (1 second)
    debounceTimeoutRef.current = setTimeout(async () => {
      setIsDebouncing(false);
      setIsAnalyzing(true);
      setAnalysis(null);

      try {
        // Check Dexie cache first
        const cached = await getCachedAnalysis(pageData.url);
        if (cached) {
          setAnalysis(cached);
          setIsAnalyzing(false);
          currentUrlRef.current = null;
          return;
        }

        // Create AbortController for this request
        const controller = new AbortController();
        abortControllerRef.current = controller;

        const prompt = getAnalysisPrompt(pageData);
        let fullResponse = '';

        await streamCompletion(
          [
            { role: 'system', content: 'You are a helpful assistant that analyzes webpages for outreach purposes.' },
            { role: 'user', content: prompt }
          ],
          apiKey,
          {
            signal: controller.signal,
            onChunk: (chunk) => {
              fullResponse += chunk;
              try {
                const jsonStr = extractJsonFromResponse(fullResponse);
                const parsed = JSON.parse(jsonStr);
                if (parsed.confidence) {
                  setAnalysis(parsed);
                }
              } catch {
                // Partial JSON, not parseable yet — wait for more chunks
              }
            },
            onComplete: async (finalText) => {
              try {
                const jsonStr = extractJsonFromResponse(finalText);
                const parsed = JSON.parse(jsonStr);
                setAnalysis(parsed);

                // Cache the result in Dexie
                await setCachedAnalysis(pageData.url, parsed);
                setRetryCount(0);
              } catch {
                setError('Failed to parse analysis response');
              }
              setIsAnalyzing(false);
              currentUrlRef.current = null;
              abortControllerRef.current = null;
            },
            onError: (err) => {
              // Don't report abort errors
              if (err instanceof DOMException && err.name === 'AbortError') {
                return;
              }

              const errorMessage = err instanceof Error ? err.message : 'Analysis failed';
              const isRetryable =
                errorMessage.includes('network') ||
                errorMessage.includes('timeout') ||
                errorMessage.includes('503') ||
                errorMessage.includes('502');

              if (isRetryable && retryCount < MAX_RETRIES) {
                setRetryCount((prev) => prev + 1);

                const backoffDelay = Math.pow(2, retryCount) * 1000;
                setTimeout(() => {
                  if (pageDataRef.current) {
                    analyzePage(pageDataRef.current);
                  }
                }, backoffDelay);
              } else {
                setError(errorMessage);
                setIsAnalyzing(false);
                currentUrlRef.current = null;
                abortControllerRef.current = null;
                setRetryCount(0);
              }
            }
          }
        );
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          return;
        }
        setError(err instanceof Error ? err.message : 'Analysis failed');
        setIsAnalyzing(false);
        currentUrlRef.current = null;
        abortControllerRef.current = null;
      }
    }, 1000);
  }, [apiKey, isAnalyzing, isDebouncing, cancelAnalysis, retryCount]);

  return {
    analysis,
    isAnalyzing,
    isDebouncing,
    debounceCountdown,
    error,
    analyzePage,
    cancelAnalysis
  };
}
