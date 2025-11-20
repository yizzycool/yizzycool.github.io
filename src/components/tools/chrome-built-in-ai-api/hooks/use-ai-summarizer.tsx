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
  const [isUserDownloadRequired, setIsUserDownloadRequired] = useState<
    boolean | null
  >(false);
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
  const checkCapability = async () => {
    const availability = await window.Summarizer?.availability?.();
    if (availability === 'downloadable' || availability === 'downloading') {
      setIsUserDownloadRequired(true);
      setIsSupported(false);
    } else if (availability === 'available') {
      setIsSupported(true);
    } else {
      setIsSupported(false);
    }
  };

  const initSummarizer = async () => {
    if (window.Summarizer) {
      try {
        const summarizer = await window.Summarizer.create(options);
        setSummarizer(summarizer);
        setIsPartialUnsupported(false);
      } catch (_e) {
        setIsPartialUnsupported(true);
      }
    }
  };

  const updateSummarizer = async (options: AISummarizerCreateOptions) => {
    if (window.Summarizer) {
      try {
        if (summarizer) summarizer?.destroy?.();
        setSummarizer(null);
        await browserUtils.sleep(500);
        const newOptions = _defaults(options, Options);
        const newSummarizer = await window.Summarizer.create(newOptions);
        setOptions(newOptions);
        setSummarizer(newSummarizer);
        setIsPartialUnsupported(false);
      } catch (_e) {
        setIsPartialUnsupported(true);
      }
    }
  };

  const triggerUserDownload = async () => {
    setIsUserDownloadRequired(false);
    setIsSupported(true);
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
    isUserDownloadRequired,
    options,
    isOptionUpdating: _isNull(summarizer),
    summarize,
    summarizeStreaming,
    updateSummarizer,
    triggerUserDownload,
  };
}
