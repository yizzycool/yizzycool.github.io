'use client';

import { useEffect, useState } from 'react';
import { LanguageModelInstance, WindowAi } from '../types/types';

export default function useAiLanguageModel({ createInstance = true } = {}) {
  const [isSupported, setIsSupported] = useState<boolean | null>(null);
  const [isPartialUnsupported, setIsPartialUnsupported] = useState<
    boolean | null
  >(null);
  const [session, setSession] = useState<LanguageModelInstance | null>(null);

  useEffect(() => {
    checkCapability();
  }, []);

  useEffect(() => {
    if (!isSupported || !createInstance) return;
    initLanguageModel();

    return () => {
      session?.destroy?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSupported]);

  // To check if language detector is supported
  const checkCapability = () => {
    const _window = window as unknown as WindowAi;
    const languageModel = _window.ai?.languageModel;
    setIsSupported(!!languageModel);
  };

  const initLanguageModel = async () => {
    const _window = window as unknown as WindowAi;
    if (_window.ai?.languageModel) {
      try {
        const session = await _window.ai.languageModel.create({});
        setSession(session);
        setIsPartialUnsupported(false);
      } catch (_e) {
        setIsPartialUnsupported(true);
      }
    }
  };

  const prompt = async (text: string): Promise<string | null> => {
    if (!session) return null;
    const results = await session.prompt(text);
    return results;
  };

  return {
    isSupported,
    isPartialUnsupported,
    prompt,
  };
}
