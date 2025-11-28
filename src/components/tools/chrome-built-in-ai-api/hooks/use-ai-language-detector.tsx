'use client';

import { useEffect, useState } from 'react';
import useAiCommon from './use-ai-common';

export default function useAiLanguageDetector() {
  const [detector, setDetector] = useState<AILanguageDetector | null>(null);

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
    const apiExist = !!window.LanguageDetector;
    setIsApiSupported(apiExist);
    if (!apiExist) return;
    checkAvailability();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      detector?.destroy?.();
    };
  }, [detector]);

  // To check if language detector is supported
  const checkAvailability = async () => {
    // Check API availability (unavailable / downloadable / downloading / available)
    const availability = await window.LanguageDetector?.availability?.();
    setAvailability(availability);
    if (availability === 'available') {
      initLanguageDetector();
    }
  };

  const initLanguageDetector = async (
    monitor?: AICreateMonitorCallback | undefined
  ) => {
    if (!window.LanguageDetector) {
      setIsApiSupported(false);
      return;
    }
    try {
      const detector = await window.LanguageDetector.create({ monitor });
      setDetector(detector);
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
    await initLanguageDetector(createMonitorCallback);
    // Check API availability (unavailable / downloadable / downloading / available)
    const availability = await window.LanguageDetector?.availability?.();
    setAvailability(availability);
  };

  const detect = async (
    text: string
  ): Promise<Array<LanguageDetectionResult> | null> => {
    if (!detector) return null;
    const results = await detector.detect(text);
    return results;
  };

  const resetError = () => setError(false);

  return {
    hasCheckedAIStatus,
    isApiSupported,
    availability,
    error,
    detect,
    shouldDownloadModel,
    downloadModel,
    downloadProgress,
    resetError,
  };
}
