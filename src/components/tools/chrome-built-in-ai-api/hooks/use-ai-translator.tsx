'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import useAiCommon from './use-ai-common';

const Options: AITranslatorCreateOptions = {
  sourceLanguage: 'zh-Hant',
  targetLanguage: 'en',
};

export default function useAiTranslator() {
  const [translator, setTranslator] = useState<AITranslator | null>(null);
  const [options, setOptions] = useState(Options);

  const isApiSupported = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  const {
    availability,
    setAvailability,
    setError,
    downloadProgress,
    setDownloadProgress,
    hasCheckedAIStatus,
    shouldDownloadModel,
  } = useAiCommon({ isApiSupported });

  const checkAvailability = async (
    sourceLanguage = Options.sourceLanguage,
    targetLanguage = Options.targetLanguage
  ) => {
    const availability = await window.Translator?.availability?.({
      sourceLanguage,
      targetLanguage,
    });
    setAvailability(availability);
    return availability;
  };

  const createMonitorCallback: AICreateMonitorCallback = (monitor) => {
    setDownloadProgress(0);
    monitor.addEventListener('downloadprogress', (e) => {
      setDownloadProgress(e.loaded);
    });
  };

  const setTranslatorLang = async (
    sourceLanguage = Options.sourceLanguage,
    targetLanguage = Options.targetLanguage
  ) => {
    if (!window.Translator) return;
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
      setAvailability('unavailable');
      setError(true);
    }
  };

  const downloadModel = async () => {
    await setTranslatorLang();
  };

  useEffect(() => {
    if (!isApiSupported || typeof window === 'undefined' || !window.Translator)
      return;

    window.Translator.availability?.({
      sourceLanguage: Options.sourceLanguage,
      targetLanguage: Options.targetLanguage,
    }).then((avail) => {
      console.log(avail);
      setAvailability(avail);
      if (avail === 'available') {
        window.Translator?.create({
          sourceLanguage: Options.sourceLanguage,
          targetLanguage: Options.targetLanguage,
        })
          .then((inst) => setTranslator(inst))
          .catch(() => {
            setError(true);
            setAvailability('unavailable');
          });
      }
    });
  }, [isApiSupported, setAvailability, setError]);

  useEffect(() => {
    return () => {
      translator?.destroy?.();
    };
  }, [translator]);

  const translate = async (text: string): Promise<string> => {
    if (!translator) return '';
    const result = await translator.translate(text);
    return result;
  };

  return {
    hasCheckedAIStatus,
    isApiSupported,
    availability,
    options,
    translator,
    translate,
    setTranslatorLang,
    shouldDownloadModel,
    downloadModel,
    downloadProgress,
  };
}

function subscribe() {
  return () => {};
}

function getSnapshot() {
  return typeof window !== 'undefined' && 'Translator' in window;
}

function getServerSnapshot() {
  return null;
}
