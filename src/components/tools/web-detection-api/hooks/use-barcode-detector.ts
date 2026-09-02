'use client';

import { useState, useSyncExternalStore } from 'react';

import useApiCommon from './use-api-common';

export default function useBarcodeDetector() {
  const [detector] = useState<BarcodeDetectorInstance | null>(() => {
    if (typeof window === 'undefined' || !window.BarcodeDetector) return null;
    try {
      return new window.BarcodeDetector();
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
  ): Promise<BarcodeDetectionResults | null> => {
    try {
      if (!detector) return null;
      setIsProcessing(true);
      const results = await detector.detect(image);
      setIsProcessing(false);
      return results;
    } catch (_e) {
      setError(
        'Barcode detection failed! Please check the image format and try again.'
      );
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
  return typeof window !== 'undefined' && 'BarcodeDetector' in window;
}

function getServerSnapshot() {
  return null;
}
