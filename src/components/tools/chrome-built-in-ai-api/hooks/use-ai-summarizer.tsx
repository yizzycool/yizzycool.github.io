'use client';

import { useEffect, useState } from 'react';
import browserUtils from '@/utils/browser-utils';
import { SummarizerInstance, SummarizerParams, WindowAi } from '../types/types';
import _defaults from 'lodash/defaults';
import _isNull from 'lodash/isNull';

const Options: SummarizerParams = {
  sharedContext: '',
  type: 'key-points',
  format: 'markdown',
  length: 'medium',
};

export default function useAiSummarizer({ createInstance = true } = {}) {
  const [isSupported, setIsSupported] = useState<boolean | null>(null);
  const [isPartialUnsupported, setIsPartialUnsupported] = useState<
    boolean | null
  >(null);
  const [summarizer, setSummarizer] = useState<SummarizerInstance | null>(null);
  const [options, setOptions] = useState(Options);

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
        const summarizer = await _window.ai.summarizer.create(options);
        setSummarizer(summarizer);
        setIsPartialUnsupported(false);
      } catch (_e) {
        setIsPartialUnsupported(true);
      }
    }
  };

  const updateSummarizer = async (options: SummarizerParams) => {
    const _window = window as unknown as WindowAi;
    if (_window.ai?.summarizer) {
      try {
        if (summarizer) summarizer?.destroy?.();
        setSummarizer(null);
        await browserUtils.sleep(500);
        const newOptions = _defaults(options, Options);
        const newSummarizer = await _window.ai.summarizer.create(newOptions);
        setOptions(newOptions);
        setSummarizer(newSummarizer);
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
    options,
    isOptionUpdating: _isNull(summarizer),
    summarize,
    updateSummarizer,
  };
}
