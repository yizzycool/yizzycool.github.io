'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { defaults, isNull, startsWith, size } from 'lodash';

import useAiCommon from './use-ai-common';
import browserUtils from '@/utils/browser-utils';

const Options: AIRewriterCreateOptions = {
  sharedContext: '',
  tone: 'as-is',
  format: 'as-is',
  length: 'as-is',
};

export default function useAiRewriter() {
  const [rewriter, setRewriter] = useState<AIRewriter | null>(null);
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

  const initRewriter = async (
    monitor?: AICreateMonitorCallback | undefined
  ) => {
    if (!window.Rewriter) return;
    try {
      const rewriter = await window.Rewriter.create({ ...options, monitor });
      setRewriter(rewriter);
    } catch (_e) {
      setError(true);
    }
  };

  const updateRewriter = async (options: AIRewriterCreateOptions) => {
    if (window.Rewriter) {
      try {
        if (rewriter) rewriter?.destroy?.();
        setRewriter(null);
        await browserUtils.sleep(500);
        const newOptions = defaults(options, Options);
        const newRewriter = await window.Rewriter.create(newOptions);
        setOptions(newOptions);
        setRewriter(newRewriter);
      } catch (_e) {
        setError(true);
      }
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
    await initRewriter(createMonitorCallback);
    const availability = await window.Rewriter?.availability?.();
    setAvailability(availability);
  };

  useEffect(() => {
    if (!isApiSupported || typeof window === 'undefined' || !window.Rewriter)
      return;

    window.Rewriter.availability?.().then((avail) => {
      setAvailability(avail);
      if (avail === 'available') {
        window.Rewriter?.create(options)
          .then((inst) => setRewriter(inst))
          .catch(() => setError(true));
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isApiSupported, setAvailability, setError]);

  useEffect(() => {
    return () => {
      rewriter?.destroy?.();
    };
  }, [rewriter]);

  const rewrite = async (text: string): Promise<string | null> => {
    if (!rewriter) return null;
    try {
      const result = await rewriter.rewrite(text);
      return result;
    } catch (e) {
      console.log('rewrite error:', e);
      return null;
    }
  };

  const rewriteStreaming = async (
    text: string,
    callback: (chunk: string) => void
  ): Promise<string | null> => {
    if (!rewriter) return null;
    try {
      let results = '';
      let prevChunk = '';
      const stream = await rewriter.rewriteStreaming(text);
      for await (const chunk of stream) {
        const filteredChunk = startsWith(chunk, prevChunk)
          ? chunk.substring(size(prevChunk))
          : chunk;
        callback(filteredChunk);
        results += filteredChunk;
        prevChunk = chunk;
      }
      return results;
    } catch (e) {
      console.log('rewrite streaming error:', e);
      return null;
    }
  };

  return {
    hasCheckedAIStatus,
    isApiSupported,
    availability,
    options,
    isOptionUpdating: isNull(rewriter),
    rewrite,
    rewriteStreaming,
    updateRewriter,
    shouldDownloadModel,
    downloadModel,
    downloadProgress,
  };
}

function subscribe() {
  return () => {};
}

function getSnapshot() {
  return typeof window !== 'undefined' && 'Rewriter' in window;
}

function getServerSnapshot() {
  return null;
}
