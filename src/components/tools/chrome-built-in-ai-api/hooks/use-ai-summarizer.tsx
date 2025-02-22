'use client';

import { useEffect, useState } from 'react';
import { SummarizerInstance, WindowAi } from '../types/types';

export default function useAiSummarizer({ createInstance = true } = {}) {
  const [isSupported, setIsSupported] = useState<boolean | null>(null);
  const [isPartialUnsupported, setIsPartialUnsupported] = useState<
    boolean | null
  >(null);
  const [summarizer, setSummarizer] = useState<SummarizerInstance | null>(null);

  useEffect(() => {
    checkCapability();
  }, []);

  useEffect(() => {
    if (!isSupported || !createInstance) return;
    initSummarizer();

    return () => {
      summarizer?.destroy?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      try {
        const summarizer = await _window.ai.summarizer.create();
        setSummarizer(summarizer);
        setIsPartialUnsupported(false);
      } catch (_e) {
        setIsPartialUnsupported(true);
      }
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
    isPartialUnsupported,
    summarize,
  };
}
