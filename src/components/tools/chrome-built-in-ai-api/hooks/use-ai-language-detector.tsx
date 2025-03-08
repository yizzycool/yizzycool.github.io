'use client';

import { useEffect, useState } from 'react';

export default function useAiLanguageDetector({ createInstance = true } = {}) {
  const [isSupported, setIsSupported] = useState<boolean | null>(null);
  const [isPartialUnsupported, setIsPartialUnsupported] = useState<
    boolean | null
  >(null);
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
  const checkCapability = () => {
    const languageDetector = window.ai?.languageDetector;
    setIsSupported(!!languageDetector?.capabilities);
  };

  const initLanguageDetector = async () => {
    if (window.ai?.languageDetector) {
      try {
        const detector = await window.ai.languageDetector.create();
        setDetector(detector);
        setIsPartialUnsupported(false);
      } catch (_e) {
        setIsPartialUnsupported(true);
      }
    }
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
    detect,
  };
}
