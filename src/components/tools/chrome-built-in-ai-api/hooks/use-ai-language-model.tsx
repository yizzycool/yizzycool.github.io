'use client';

import { useEffect, useState } from 'react';
import {
  LanguageModelInstance,
  LanguageModelParams,
  WindowAi,
} from '../types/types';
import browserUtils from '@/utils/browser-utils';
import _isNull from 'lodash/isNull';
import _defaults from 'lodash/defaults';

const Options: LanguageModelParams = {
  topK: 3,
  temperature: 1,
  systemPrompt: '',
};

export default function useAiLanguageModel({ createInstance = true } = {}) {
  const [isSupported, setIsSupported] = useState<boolean | null>(null);
  const [isPartialUnsupported, setIsPartialUnsupported] = useState<
    boolean | null
  >(null);
  const [session, setSession] = useState<LanguageModelInstance | null>(null);
  const [options, setOptions] = useState(Options);

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

  const updateLanguageModel = async (options: LanguageModelParams) => {
    const _window = window as unknown as WindowAi;
    if (_window.ai?.languageModel) {
      try {
        if (session) session?.destroy?.();
        setSession(null);
        await browserUtils.sleep(500);
        const newOptions = _defaults(options, Options);
        const newSession = await _window.ai.languageModel.create(newOptions);
        setOptions(newOptions);
        setSession(newSession);
        setIsPartialUnsupported(false);
      } catch (_e) {
        setIsPartialUnsupported(true);
      }
    }
  };

  const clearLanguageModel = () => updateLanguageModel(options);

  const prompt = async (text: string): Promise<string | null> => {
    if (!session) return null;
    try {
      const result = await session.prompt(text);
      return result;
    } catch (_e) {
      return null;
    }
  };

  const promptStreaming = async (
    text: string,
    callback: (chunk: string) => void
  ): Promise<string | null> => {
    if (!session) return null;
    try {
      let results = '';
      const stream = await session.promptStreaming(text);
      for await (const chunk of stream) {
        callback(chunk);
        results += chunk;
      }
      return results;
    } catch (_e) {
      return null;
    }
  };

  return {
    isSupported,
    isPartialUnsupported,
    options,
    isOptionUpdating: _isNull(session),
    prompt,
    promptStreaming,
    updateLanguageModel,
    clearLanguageModel,
  };
}
