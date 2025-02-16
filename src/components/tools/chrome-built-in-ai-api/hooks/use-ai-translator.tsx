'use client';

import {
  AiTranslatorCapilitiesResult,
  TranslatorInstance,
  TranslatorParams,
  WindowAi,
} from '../types/types';
import { useEffect, useState } from 'react';

export default function useAiTranslator() {
  const [isSupported, setIsSupported] = useState<boolean | null>(null);
  const [params, setParams] = useState<TranslatorParams>({
    sourceLanguage: 'zh-Hant',
    targetLanguage: 'en',
  });
  const [translator, setTranslator] = useState<TranslatorInstance | null>(null);
  const [canTranslate, setCanTranslate] =
    useState<AiTranslatorCapilitiesResult>('');

  useEffect(() => {
    checkCapability();
  }, []);

  // Init translator lang
  useEffect(() => {
    if (!isSupported) return;
    setTranslatorLang();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSupported]);

  // To check if translator is supported
  const checkCapability = () => {
    const _window = window as unknown as WindowAi;
    const translator = _window.ai?.translator || _window.translation;
    setIsSupported(!!translator);
  };

  const resetTranslator = () => {
    setCanTranslate('');
    setTranslator(null);
  };

  const setTranslatorLang = async (
    sourceLanguage = 'zh-Hant',
    targetLanguage = 'en'
  ) => {
    resetTranslator();
    // Destroy previous translator before get the new one
    if (translator) translator.destroy?.();
    setParams({ sourceLanguage, targetLanguage });
    // If cannot translate for source-target pair, do nothing
    const canTranslate = await isLanguagePairSupported(
      sourceLanguage,
      targetLanguage
    );
    if (canTranslate === 'no') return;
    // Create new translator
    const _window = window as unknown as WindowAi;
    if (_window.ai?.translator) {
      // If window.ai.translator exists
      console.log('[Translator: ai.translator]');
      const translator = await _window.ai.translator.create({
        sourceLanguage,
        targetLanguage,
      });
      setTranslator(translator);
      loopCheckIfLanguagePairIsSupported(sourceLanguage, targetLanguage);
    } else if (_window.translation) {
      // If window.translation exists
      console.log('[Translator: translation]');
      const translator = await _window.translation.createTranslator({
        sourceLanguage,
        targetLanguage,
      });
      setTranslator(translator);
      loopCheckIfLanguagePairIsSupported(sourceLanguage, targetLanguage);
    }
  };

  const isLanguagePairSupported = async (
    sourceLanguage = '',
    targetLanguage = ''
  ): Promise<AiTranslatorCapilitiesResult> => {
    const _window = window as unknown as WindowAi;
    let canTranslate: AiTranslatorCapilitiesResult = '';
    if (_window.ai?.translator) {
      // If window.ai.translator exists
      const capabilities = await _window.ai.translator.capabilities();
      canTranslate = capabilities.languagePairAvailable(
        sourceLanguage,
        targetLanguage
      );
    } else if (_window.translation) {
      // If window.translation exists
      canTranslate = await _window.translation.canTranslate({
        sourceLanguage,
        targetLanguage,
      });
    }
    if (canTranslate !== 'readily') {
      setCanTranslate(canTranslate);
    }
    return canTranslate;
  };

  const loopCheckIfLanguagePairIsSupported = async (
    sourceLanguage = '',
    targetLanguage = ''
  ): Promise<void> => {
    const canTranslate = await isLanguagePairSupported(
      sourceLanguage,
      targetLanguage
    );
    setCanTranslate(canTranslate);
    if (canTranslate === 'after-download') {
      setTimeout(() => {
        loopCheckIfLanguagePairIsSupported(sourceLanguage, targetLanguage);
      }, 1000);
    }
  };

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
    canTranslate,
  };
}
