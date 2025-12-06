'use client';

import { useEffect, useState } from 'react';
import useApiCommon from './use-api-common';

export default function useTextDetector() {
  const [detector, setDetector] = useState<TextDetectorInstance | null>(null);

  const {
    isApiSupported,
    setIsApiSupported,
    error,
    setError,
    isProcessing,
    setIsProcessing,
    hasCheckedApiStatus,
  } = useApiCommon();

  useEffect(() => {
    checkCapability();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isApiSupported) return;
    initTextDetector();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isApiSupported]);

  // To check if text detector is supported
  const checkCapability = () => {
    setIsApiSupported(!!window.TextDetector);
  };

  const initTextDetector = async () => {
    if (window.TextDetector) {
      try {
        const detector = await new window.TextDetector();
        setDetector(detector);
      } catch (_e) {
        setError(true);
      }
    }
  };

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
