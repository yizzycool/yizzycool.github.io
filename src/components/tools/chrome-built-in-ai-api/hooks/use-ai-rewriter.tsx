'use client';

import { useEffect, useState } from 'react';
import useAiCommon from './use-ai-common';
import browserUtils from '@/utils/browser-utils';
import _defaults from 'lodash/defaults';
import _isNull from 'lodash/isNull';
import _startsWith from 'lodash/startsWith';
import _size from 'lodash/size';

const Options: AIRewriterCreateOptions = {
  sharedContext: '',
  tone: 'as-is',
  format: 'as-is',
  length: 'as-is',
};

export default function useAiRewriter() {
  const [rewriter, setRewriter] = useState<AIRewriter | null>(null);
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
    const apiExist = !!window.Rewriter;
    setIsApiSupported(apiExist);
    if (!apiExist) return;
    checkAvailability();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      rewriter?.destroy?.();
    };
  }, [rewriter]);

  // To check if rewriter is supported
  const checkAvailability = async () => {
    // Check API availability (unavailable / downloadable / downloading / available)
    const availability = await window.Rewriter?.availability?.();
    setAvailability(availability);
    if (availability === 'available') {
      initRewriter();
    }
  };

  const initRewriter = async (
    monitor?: AICreateMonitorCallback | undefined
  ) => {
    if (!window.Rewriter) {
      setIsApiSupported(false);
      return;
    }
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
        const newOptions = _defaults(options, Options);
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
    // Check API availability (unavailable / downloadable / downloading / available)
    const availability = await window.Rewriter?.availability?.();
    setAvailability(availability);
  };

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
        const filteredChunk = _startsWith(chunk, prevChunk)
          ? chunk.substring(_size(prevChunk))
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

  const resetError = () => setError(false);

  return {
    hasCheckedAIStatus,
    isApiSupported,
    availability,
    error,
    options,
    isOptionUpdating: _isNull(rewriter),
    rewrite,
    rewriteStreaming,
    updateRewriter,
    shouldDownloadModel,
    downloadModel,
    downloadProgress,
    resetError,
  };
}
