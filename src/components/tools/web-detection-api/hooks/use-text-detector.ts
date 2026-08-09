'use client';

import { useState, useSyncExternalStore } from 'react';

import useApiCommon from './use-api-common';

export default function useTextDetector() {
  const [detector] = useState<TextDetectorInstance | null>(() => {
    if (typeof window === 'undefined' || !window.TextDetector) return null;
    try {
      return new window.TextDetector();
    } catch (_e) {
      return null;
    }
  });

  const isApiSupported = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  const {
    error,
    setError,
    isProcessing,
    setIsProcessing,
    hasCheckedApiStatus,
  } = useApiCommon({ isApiSupported });

  const detect = async (
    image: HTMLImageElement | HTMLCanvasElement
  ): Promise<TextDetectionResults | null> => {
    try {
      if (!detector) return null;
      setIsProcessing(true);
      const results = await detector.detect(image);
      setIsProcessing(false);
      return results;
    } catch (_e) {
      setError(true);
      setIsProcessing(false);
      return null;
    }
  };

  const resetError = () => setError(false);

  return {
    hasCheckedApiStatus,
    isApiSupported,
    isProcessing,
    error,
    detect,
    resetError,
  };
}

function subscribe() {
  return () => {};
}

function getSnapshot() {
  return typeof window !== 'undefined' && 'TextDetector' in window;
}

function getServerSnapshot() {
  return null;
}
