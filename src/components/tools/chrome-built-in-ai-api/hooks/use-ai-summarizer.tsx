'use client';

import { useEffect, useState } from 'react';
import browserUtils from '@/utils/browser-utils';
import _defaults from 'lodash/defaults';
import _isNull from 'lodash/isNull';

const Options: AISummarizerCreateOptions = {
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
  const [summarizer, setSummarizer] = useState<AISummarizer | null>(null);
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

  // To check if summarizer is supported
  const checkCapability = () => {
    const summarizer = window.ai?.summarizer;
    setIsSupported(!!summarizer?.capabilities);
  };

  const initSummarizer = async () => {
    if (window.ai?.summarizer) {
      try {
        const summarizer = await window.ai.summarizer.create(options);
        setSummarizer(summarizer);
        setIsPartialUnsupported(false);
      } catch (_e) {
        setIsPartialUnsupported(true);
      }
    }
  };

  const updateSummarizer = async (options: AISummarizerCreateOptions) => {
    if (window.ai?.summarizer) {
      try {
        if (summarizer) summarizer?.destroy?.();
        setSummarizer(null);
        await browserUtils.sleep(500);
        const newOptions = _defaults(options, Options);
        const newSummarizer = await window.ai.summarizer.create(newOptions);
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

  const summarizeStreaming = async (
    text: string,
    callback: (chunk: string) => void
  ): Promise<string | null> => {
    if (!summarizer) return null;
    try {
      let results = '';
      const stream = await summarizer.summarizeStreaming(text);
      for await (const chunk of stream) {
        callback(chunk);
        results += chunk;
      }
      return results;
    } catch (e) {
      console.log('summarize streaming error:', e);
      return null;
    }
  };

  return {
    isSupported,
    isPartialUnsupported,
    options,
    isOptionUpdating: _isNull(summarizer),
    summarize,
    summarizeStreaming,
    updateSummarizer,
  };
}
