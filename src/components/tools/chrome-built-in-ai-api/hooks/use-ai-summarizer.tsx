'use client';

import { useEffect, useState } from 'react';
import browserUtils from '@/utils/browser-utils';
import _defaults from 'lodash/defaults';
import _isNull from 'lodash/isNull';
import useAiCommon from './use-ai-common';

const Options: AISummarizerCreateOptions = {
  sharedContext: '',
  type: 'key-points',
  format: 'markdown',
  length: 'medium',
};

export default function useAiSummarizer() {
  const [summarizer, setSummarizer] = useState<AISummarizer | null>(null);
  const [options, setOptions] = useState(Options);

  const {
    isApiSupported,
    setIsApiSupported,
    availability,
    setAvailability,
    error,
    setError,
    downloadProgress,
    setDownloadProgress,
    hasCheckedAIStatus,
    shouldDownloadModel,
  } = useAiCommon();

  useEffect(() => {
    // Check if API is supported on the device
    const apiExist = !!window.Summarizer;
    setIsApiSupported(apiExist);
    if (!apiExist) return;
    checkAvailability();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      summarizer?.destroy?.();
    };
  }, [summarizer]);

  // To check if summarizer is supported
  const checkAvailability = async () => {
    // Check API availability (unavailable / downloadable / downloading / available)
    const availability = await window.Summarizer?.availability?.();
    setAvailability(availability);
    if (availability === 'available') {
      initSummarizer();
    }
  };

  const initSummarizer = async (
    monitor?: AICreateMonitorCallback | undefined
  ) => {
    if (!window.Summarizer) {
      setIsApiSupported(false);
      return;
    }
    try {
      const summarizer = await window.Summarizer.create({
        ...options,
        monitor,
      });
      setSummarizer(summarizer);
    } catch (_e) {
      setError(true);
    }
  };

  const updateSummarizer = async (options: AISummarizerCreateOptions) => {
    if (!window.Summarizer) {
      setIsApiSupported(false);
      return;
    }
    try {
      if (summarizer) summarizer?.destroy?.();
      setSummarizer(null);
      await browserUtils.sleep(500);
      const newOptions = _defaults(options, Options);
      const newSummarizer = await window.Summarizer.create(newOptions);
      setOptions(newOptions);
      setSummarizer(newSummarizer);
    } catch (_e) {
      setError(true);
    }
  };

  const createMonitorCallback: AICreateMonitorCallback = (monitor) => {
    setDownloadProgress(0);
    monitor.addEventListener('downloadprogress', (e) => {
      setDownloadProgress(e.loaded);
      if (e.loaded === 1) {
        setTimeout(() => setDownloadProgress(null), 1000);
      }
    });
  };

  const downloadModel = async () => {
    await initSummarizer(createMonitorCallback);
    // Check API availability (unavailable / downloadable / downloading / available)
    const availability = await window.Summarizer?.availability?.();
    setAvailability(availability);
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

  const resetError = () => setError(false);

  return {
    hasCheckedAIStatus,
    isApiSupported,
    availability,
    error,
    options,
    isOptionUpdating: _isNull(summarizer),
    summarize,
    summarizeStreaming,
    updateSummarizer,
    shouldDownloadModel,
    downloadModel,
    downloadProgress,
    resetError,
  };
}
