'use client';

import { useState, useSyncExternalStore } from 'react';

import useApiCommon from './use-api-common';

export default function useFaceDetector() {
  const [detector] = useState<FaceDetectorInstance | null>(() => {
    if (typeof window === 'undefined' || !window.FaceDetector) return null;
    try {
      return new window.FaceDetector();
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
  ): Promise<FaceDetectionResults | null> => {
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
  return typeof window !== 'undefined' && 'FaceDetector' in window;
}

function getServerSnapshot() {
  return null;
}
