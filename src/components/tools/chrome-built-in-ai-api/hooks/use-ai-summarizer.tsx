'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { defaults, isNull } from 'lodash';

import useAiCommon from './use-ai-common';
import browserUtils from '@/utils/browser-utils';

const Options: AISummarizerCreateOptions = {
  sharedContext: '',
  type: 'key-points',
  format: 'markdown',
  length: 'medium',
};

export default function useAiSummarizer() {
  const [summarizer, setSummarizer] = useState<AISummarizer | null>(null);
  const [options, setOptions] = useState(Options);

  const isApiSupported = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  const {
    availability,
    setAvailability,
    setError,
    downloadProgress,
    setDownloadProgress,
    hasCheckedAIStatus,
    shouldDownloadModel,
  } = useAiCommon({ isApiSupported });

  const initSummarizer = async (
    monitor?: AICreateMonitorCallback | undefined
  ) => {
    if (!window.Summarizer) return;
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
    if (!window.Summarizer) return;
    try {
      if (summarizer) summarizer?.destroy?.();
      setSummarizer(null);
      await browserUtils.sleep(500);
      const newOptions = defaults(options, Options);
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
    const availability = await window.Summarizer?.availability?.();
    setAvailability(availability);
  };

  useEffect(() => {
    if (!isApiSupported || typeof window === 'undefined' || !window.Summarizer)
      return;

    window.Summarizer.availability?.().then((avail) => {
      setAvailability(avail);
      if (avail === 'available') {
        window.Summarizer?.create(options)
          .then((inst) => setSummarizer(inst))
          .catch(() => setError(true));
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isApiSupported, setAvailability, setError]);

  useEffect(() => {
    return () => {
      summarizer?.destroy?.();
    };
  }, [summarizer]);

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
    hasCheckedAIStatus,
    isApiSupported,
    availability,
    options,
    isOptionUpdating: isNull(summarizer),
    summarize,
    summarizeStreaming,
    updateSummarizer,
    shouldDownloadModel,
    downloadModel,
    downloadProgress,
  };
}

function subscribe() {
  return () => {};
}

function getSnapshot() {
  return typeof window !== 'undefined' && 'Summarizer' in window;
}

function getServerSnapshot() {
  return null;
}
