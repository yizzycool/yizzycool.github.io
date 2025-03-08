'use client';

import { useEffect, useState } from 'react';

export default function useAiTranslator({ createInstance = true } = {}) {
  const [isSupported, setIsSupported] = useState<boolean | null>(null);
  const [params, setParams] = useState<AITranslatorCreateCoreOptions>({
    sourceLanguage: 'zh-Hant',
    targetLanguage: 'en',
  });
  const [translator, setTranslator] = useState<AITranslator | null>(null);
  const [isPartialUnsupported, setIsPartialUnsupported] = useState<
    boolean | null
  >(null);
  const [canTranslate, setCanTranslate] = useState<AICapability | ''>('');

  useEffect(() => {
    checkCapability();
  }, []);

  // Init translator lang
  useEffect(() => {
    if (!isSupported || !createInstance) return;
    setTranslatorLang();

    return () => {
      translator?.destroy?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSupported]);

  // To check if translator is supported
  const checkCapability = () => {
    const translator = window.ai?.translator;
    setIsSupported(!!translator?.capabilities);
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
    if (window.ai?.translator) {
      try {
        // If window.ai.translator exists
        console.log('[Translator: ai.translator]');
        const translator = await window.ai.translator.create({
          sourceLanguage,
          targetLanguage,
        });
        setTranslator(translator);
        setIsPartialUnsupported(false);
        loopCheckIfLanguagePairIsSupported(sourceLanguage, targetLanguage);
      } catch (_e) {
        setIsPartialUnsupported(true);
      }
    }
  };

  const isLanguagePairSupported = async (
    sourceLanguage = '',
    targetLanguage = ''
  ): Promise<AICapability | ''> => {
    let canTranslate: AICapability | '' = '';
    if (window.ai?.translator) {
      // If window.ai.translator exists
      const capabilities = await window.ai.translator.capabilities();
      canTranslate = capabilities.languagePairAvailable(
        sourceLanguage,
        targetLanguage
      );
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
    isPartialUnsupported,
    translate,
    params,
    setTranslatorLang,
    canTranslate,
  };
}
