'use client';

import { useEffect, useState } from 'react';

export default function useAiLanguageDetector({ createInstance = true } = {}) {
  const [isSupported, setIsSupported] = useState<boolean | null>(null);
  const [isPartialUnsupported, setIsPartialUnsupported] = useState<
    boolean | null
  >(null);
  const [isUserDownloadRequired, setIsUserDownloadRequired] = useState<
    boolean | null
  >(false);
  const [detector, setDetector] = useState<AILanguageDetector | null>(null);

  useEffect(() => {
    checkCapability();
  }, []);

  useEffect(() => {
    if (!isSupported || !createInstance) return;
    initLanguageDetector();

    return () => {
      detector?.destroy?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSupported]);

  // To check if language detector is supported
  const checkCapability = async () => {
    const availability = await window.LanguageDetector?.availability?.();
    if (availability === 'downloadable' || availability === 'downloading') {
      setIsUserDownloadRequired(true);
      setIsSupported(false);
    } else if (availability === 'available') {
      setIsSupported(true);
    } else {
      setIsSupported(false);
    }
  };

  const initLanguageDetector = async () => {
    if (window.LanguageDetector) {
      try {
        const detector = await window.LanguageDetector.create();
        setDetector(detector);
        setIsPartialUnsupported(false);
      } catch (_e) {
        setIsPartialUnsupported(true);
      }
    }
  };

  const triggerUserDownload = async () => {
    setIsUserDownloadRequired(false);
    setIsSupported(true);
  };

  const detect = async (
    text: string
  ): Promise<Array<LanguageDetectionResult> | null> => {
    if (!detector) return null;
    const results = await detector.detect(text);
    return results;
  };

  return {
    isSupported,
    isPartialUnsupported,
    isUserDownloadRequired,
    detect,
    triggerUserDownload,
  };
}
