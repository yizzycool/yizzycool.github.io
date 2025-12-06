'use client';

import { useEffect, useState } from 'react';
import useApiCommon from './use-api-common';

export default function useFaceDetector() {
  const [detector, setDetector] = useState<FaceDetectorInstance | null>(null);

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
    initFaceDetector();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isApiSupported]);

  // To check if face detector is supported
  const checkCapability = () => {
    setIsApiSupported(!!window.FaceDetector);
  };

  const initFaceDetector = async () => {
    if (window.FaceDetector) {
      try {
        const detector = await new window.FaceDetector();
        setDetector(detector);
      } catch (_e) {
        setError(true);
      }
    }
  };

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
