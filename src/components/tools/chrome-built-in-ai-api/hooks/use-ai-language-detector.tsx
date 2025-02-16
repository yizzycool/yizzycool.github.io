'use client';

import { useEffect, useState } from 'react';
import { WindowAi } from '../types/types';

export default function useAiLanguageDetector() {
  const [isSupported, setIsSupported] = useState<boolean | null>(null);

  useEffect(() => {
    checkCapability();
  }, []);

  // To check if language detector is supported
  const checkCapability = () => {
    const _window = window as unknown as WindowAi;
    const languageDetector = _window.ai?.languageDetector;
    setIsSupported(!!languageDetector);
  };

  return {
    isSupported,
  };
}
