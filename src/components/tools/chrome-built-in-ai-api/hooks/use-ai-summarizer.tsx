'use client';

import { useEffect, useState } from 'react';
import { SummarizerInstance, WindowAi } from '../types/types';

export default function useAiSummarizer() {
  const [isSupported, setIsSupported] = useState<boolean | null>(null);
  const [summarizer, setSummarizer] = useState<SummarizerInstance | null>(null);

  useEffect(() => {
    checkCapability();
  }, []);

  useEffect(() => {
    if (!isSupported) return;
    initSummarizer();
  }, [isSupported]);

  // To check if language detector is supported
  const checkCapability = () => {
    const _window = window as unknown as WindowAi;
    const summarizer = _window.ai?.summarizer;
    setIsSupported(!!summarizer && !!summarizer?.capabilities);
  };

  const initSummarizer = async () => {
    const _window = window as unknown as WindowAi;
    if (_window.ai?.summarizer) {
      const summarizer = await _window.ai.summarizer.create();
      setSummarizer(summarizer);
    }
  };

  const summarize = async (text: string): Promise<string | null> => {
    if (!summarizer) return null;
    try {
      const result = await summarizer.summarize(text);
      return result;
    } catch (e) {
      console.log('summarize error:', e);
      return null;
    }
  };

  return {
    isSupported,
    summarize,
  };
}
