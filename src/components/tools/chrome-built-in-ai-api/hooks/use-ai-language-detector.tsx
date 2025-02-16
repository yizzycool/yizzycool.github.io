'use client';

import { useEffect, useState } from 'react';
import {
  LanguageDetectorInstance,
  LanguageDetectResults,
  WindowAi,
} from '../types/types';

export default function useAiLanguageDetector() {
  const [isSupported, setIsSupported] = useState<boolean | null>(null);
  const [detector, setDetector] = useState<LanguageDetectorInstance | null>(
    null
  );

  useEffect(() => {
    checkCapability();
  }, []);

  useEffect(() => {
    if (!isSupported) return;
    initLanguageDetector();
  }, [isSupported]);

  // To check if language detector is supported
  const checkCapability = () => {
    const _window = window as unknown as WindowAi;
    const languageDetector = _window.ai?.languageDetector;
    setIsSupported(!!languageDetector);
  };

  const initLanguageDetector = async () => {
    const _window = window as unknown as WindowAi;
    if (_window.ai?.languageDetector) {
      const detector = await _window.ai.languageDetector.create();
      setDetector(detector);
    }
  };

  const detect = async (
    text: string
  ): Promise<Array<LanguageDetectResults> | null> => {
    if (!detector) return null;
    const results = await detector.detect(text);
    return results;
  };

  return {
    isSupported,
    detect,
  };
}
