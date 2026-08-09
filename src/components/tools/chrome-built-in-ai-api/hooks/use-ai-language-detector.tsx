'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';

import useAiCommon from './use-ai-common';

export default function useAiLanguageDetector() {
  const [detector, setDetector] = useState<AILanguageDetector | null>(null);

  const isApiSupported = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  const {
    availability,
    setAvailability,
    error,
    setError,
    downloadProgress,
    setDownloadProgress,
    hasCheckedAIStatus,
    shouldDownloadModel,
  } = useAiCommon({ isApiSupported });

  const initLanguageDetector = async (
    monitor?: AICreateMonitorCallback | undefined
  ) => {
    if (!window.LanguageDetector) return;
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
    const avail = await window.LanguageDetector?.availability?.();
    setAvailability(avail);
  };

  useEffect(() => {
    if (
      !isApiSupported ||
      typeof window === 'undefined' ||
      !window.LanguageDetector
    )
      return;

    window.LanguageDetector.availability?.().then((avail) => {
      setAvailability(avail);
      if (avail === 'available') {
        window.LanguageDetector?.create()
          .then((instance) => setDetector(instance))
          .catch(() => setError(true));
      }
    });
  }, [isApiSupported, setAvailability, setError]);

  useEffect(() => {
    return () => {
      detector?.destroy?.();
    };
  }, [detector]);

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

function subscribe() {
  return () => {};
}

function getSnapshot() {
  return typeof window !== 'undefined' && 'LanguageDetector' in window;
}

function getServerSnapshot() {
  return null;
}
