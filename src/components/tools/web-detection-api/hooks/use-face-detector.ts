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

  const { setError, isProcessing, setIsProcessing, hasCheckedApiStatus } =
    useApiCommon({ isApiSupported });

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
      setError('Face detection failed! Please try again with another image.');
      setIsProcessing(false);
      return null;
    }
  };

  return {
    hasCheckedApiStatus,
    isApiSupported,
    isProcessing,
    detect,
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
