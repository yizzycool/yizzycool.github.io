'use client';

import { useEffect, useState } from 'react';
import useAiCommon from './use-ai-common';

const Options: AITranslatorCreateOptions = {
  sourceLanguage: 'zh-Hant',
  targetLanguage: 'en',
};

export default function useAiTranslator() {
  const [translator, setTranslator] = useState<AITranslator | null>(null);
  const [options, setOptions] = useState(Options);

  const {
    isApiSupported,
    setIsApiSupported,
    availability,
    setAvailability,
    error,
    setError,
    downloadProgress,
    setDownloadProgress,
    hasCheckedAIStatus,
    shouldDownloadModel,
  } = useAiCommon();

  useEffect(() => {
    initTranslator();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      translator?.destroy?.();
    };
  }, [translator]);

  const initTranslator = async () => {
    // Check if API is supported on the device
    const apiExist = !!window.Translator;
    setIsApiSupported(apiExist);
    if (!apiExist) return;
    const availability = await checkAvailability();
    if (availability === 'available') {
      setTranslatorLang();
    }
  };

  // To check if translator is supported
  const checkAvailability = async (
    sourceLanguage = Options.sourceLanguage,
    targetLanguage = Options.targetLanguage
  ) => {
    // Check API availability (unavailable / downloadable / downloading / available)
    const availability = await window.Translator?.availability?.({
      sourceLanguage,
      targetLanguage,
    });
    setAvailability(availability);
    return availability;
  };

  const setTranslatorLang = async (
    sourceLanguage = Options.sourceLanguage,
    targetLanguage = Options.targetLanguage
  ) => {
    if (!window.Translator) {
      setIsApiSupported(false);
      return;
    }
    try {
      if (translator) translator.destroy?.();
      const availability = await window.Translator.availability({
        sourceLanguage,
        targetLanguage,
      });
      setAvailability(availability);
      setOptions({
        sourceLanguage,
        targetLanguage,
      });
      if (availability === 'unavailable') return;
      const monitor =
        availability === 'available' ? undefined : createMonitorCallback;
      const newTranslator = await window.Translator.create({
        sourceLanguage,
        targetLanguage,
        monitor,
      });
      setTranslator(newTranslator);
      checkAvailability(sourceLanguage, targetLanguage);
    } catch (_e) {
      console.log('error:', _e);
      setError(true);
    }
  };

  const createMonitorCallback: AICreateMonitorCallback = (monitor) => {
    setDownloadProgress(0);
    monitor.addEventListener('downloadprogress', (e) => {
      setDownloadProgress(e.loaded);
    });
  };

  const downloadModel = async () => {
    await setTranslatorLang();
  };

  const translate = async (text: string): Promise<string> => {
    if (!translator) return '';
    const result = await translator.translate(text);
    return result;
  };

  const resetError = () => setError(false);

  return {
    hasCheckedAIStatus,
    isApiSupported,
    availability,
    error,
    options,
    translator,
    translate,
    setTranslatorLang,
    shouldDownloadModel,
    downloadModel,
    downloadProgress,
    resetError,
  };
}
