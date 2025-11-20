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
  const [canTranslate, setCanTranslate] = useState<AIAvailability | ''>('');
  const [isUserDownloadRequired, setIsUserDownloadRequired] = useState(false);

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
  const checkCapability = async () => {
    const availability = await window.Translator?.availability?.({
      sourceLanguage: params.sourceLanguage,
      targetLanguage: params.targetLanguage,
    });
    if (availability === 'downloadable' || availability === 'downloading') {
      setIsUserDownloadRequired(true);
      setIsSupported(false);
    } else if (availability === 'available') {
      setIsSupported(true);
    } else {
      setIsSupported(false);
    }
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
    if (canTranslate === 'unavailable') return;
    // Create new translator
    if (window.Translator) {
      try {
        const translator = await window.Translator.create({
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
  ): Promise<AIAvailability | ''> => {
    let canTranslate: AIAvailability | '' = '';
    if (window.Translator) {
      // If window.Translator exists
      canTranslate = await window.Translator.availability({
        sourceLanguage,
        targetLanguage,
      });
    }
    if (canTranslate !== 'available') {
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
    if (canTranslate === 'downloadable' || canTranslate === 'downloading') {
      setTimeout(() => {
        loopCheckIfLanguagePairIsSupported(sourceLanguage, targetLanguage);
      }, 1000);
    }
  };

  const triggerUserDownload = async () => {
    setIsUserDownloadRequired(false);
    setIsSupported(true);
  };

  const translate = async (text: string): Promise<string> => {
    if (!translator) return '';
    const result = await translator.translate(text);
    return result;
  };

  return {
    isSupported,
    isPartialUnsupported,
    isUserDownloadRequired,
    translate,
    params,
    setTranslatorLang,
    canTranslate,
    triggerUserDownload,
  };
}
