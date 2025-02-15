'use client';

import {
  TranslatorInstance,
  TranslatorParams,
  WindowAi,
} from '../../types/types';
import { useEffect, useState } from 'react';

export default function useAiTranslator() {
  const [isSupported, setIsSupported] = useState<boolean | null>(null);
  const [params, setParams] = useState<TranslatorParams>({
    sourceLanguage: '',
    targetLanguage: '',
  });
  const [translator, setTranslator] = useState<TranslatorInstance | null>(null);
  // const [canTranslate, setCanTranslate] = useState<
  //   'readily' | 'after-download' | 'no' | ''
  // >('');

  useEffect(() => {
    checkCapability();
  }, []);

  // Init translator lang
  useEffect(() => {
    if (!isSupported) return;
    setTranslatorLang();
  }, [isSupported]);

  // To check if translator is supported
  const checkCapability = () => {
    const _window = window as unknown as WindowAi;
    const translator = _window.ai?.translator || _window.translation;
    setIsSupported(!!translator);
  };

  const setTranslatorLang = async (
    sourceLanguage = 'zh-Hant',
    targetLanguage = 'en'
  ) => {
    // Destroy previous translator before get the new one
    if (translator) {
      translator.destroy?.();
    }
    setParams({ sourceLanguage, targetLanguage });
    const _window = window as unknown as WindowAi;
    if (_window.ai?.translator) {
      // If window.ai.translator exists
      const translator = await _window.ai.translator.create({
        sourceLanguage,
        targetLanguage,
      });
      setTranslator(translator);
    } else if (_window.translation) {
      // If window.translation exists
      const translator = await _window.translation.createTranslator({
        sourceLanguage,
        targetLanguage,
      });
      setTranslator(translator);
    }
  };

  // const detectLanguageSupported = async (
  //   sourceLanguage = '',
  //   targetLanguage = ''
  // ) => {
  //   const _window = window as unknown as WindowAi;
  //   const translator = _window.ai?.translator || _window.translation;
  //   const canTranslate = await _window.translation.canTranslate({
  //     sourceLanguage,
  //     targetLanguage,
  //   });
  //   setCanTranslate(canTranslate);
  //   return canTranslate;
  // };

  const translate = async (text: string): Promise<string> => {
    if (!translator) return '';
    const result = await translator.translate(text);
    return result;
  };

  return {
    isSupported,
    translate,
    params,
    setTranslatorLang,
  };
}
