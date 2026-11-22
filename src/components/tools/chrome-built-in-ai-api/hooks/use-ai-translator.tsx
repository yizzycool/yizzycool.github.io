'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import useAiCommon from './use-ai-common';

const Options: AITranslatorCreateOptions = {
  sourceLanguage: 'zh-Hant',
  targetLanguage: 'en',
};

const destroyedTranslators = new WeakSet<AITranslator>();

function safeDestroyTranslator(instance: AITranslator | null | undefined) {
  if (!instance || destroyedTranslators.has(instance)) return;
  destroyedTranslators.add(instance);
  try {
    instance.destroy?.();
  } catch {
    // Ignore destroy errors from already-disposed instances
  }
}

export default function useAiTranslator() {
  const [translator, setTranslator] = useState<AITranslator | null>(null);
  const [options, setOptions] = useState(Options);

  const translatorRef = useRef<AITranslator | null>(null);
  const initRequestIdRef = useRef(0);

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

  const createMonitorCallback: AICreateMonitorCallback = useCallback(
    (monitor) => {
      setDownloadProgress(0);
      monitor.addEventListener('downloadprogress', (e) => {
        setDownloadProgress(e.loaded);
      });
    },
    [setDownloadProgress]
  );

  const setTranslatorLang = useCallback(
    async (
      sourceLanguage = Options.sourceLanguage,
      targetLanguage = Options.targetLanguage
    ) => {
      if (typeof window === 'undefined' || !window.Translator) return;

      const requestId = ++initRequestIdRef.current;

      safeDestroyTranslator(translatorRef.current);
      translatorRef.current = null;
      setTranslator(null);
      setOptions({
        sourceLanguage,
        targetLanguage,
      });

      try {
        const nextAvailability = await window.Translator.availability({
          sourceLanguage,
          targetLanguage,
        });
        if (initRequestIdRef.current !== requestId) return;

        setAvailability(nextAvailability);
        if (nextAvailability === 'unavailable') return;

        const monitor =
          nextAvailability === 'available' ? undefined : createMonitorCallback;
        const newTranslator = await window.Translator.create({
          sourceLanguage,
          targetLanguage,
          monitor,
        });

        if (initRequestIdRef.current !== requestId) {
          safeDestroyTranslator(newTranslator);
          return;
        }

        translatorRef.current = newTranslator;
        setTranslator(newTranslator);

        const finalAvailability = await window.Translator.availability({
          sourceLanguage,
          targetLanguage,
        });
        if (initRequestIdRef.current === requestId) {
          setAvailability(finalAvailability);
        }
      } catch (_e) {
        if (initRequestIdRef.current !== requestId) return;
        console.log('error:', _e);
        setAvailability('unavailable');
        setError(true);
      }
    },
    [createMonitorCallback, setAvailability, setError]
  );

  const downloadModel = useCallback(async () => {
    await setTranslatorLang(options.sourceLanguage, options.targetLanguage);
  }, [options.sourceLanguage, options.targetLanguage, setTranslatorLang]);

  useEffect(() => {
    if (!isApiSupported || typeof window === 'undefined' || !window.Translator)
      return;

    const requestId = ++initRequestIdRef.current;

    window.Translator.availability?.({
      sourceLanguage: Options.sourceLanguage,
      targetLanguage: Options.targetLanguage,
    })
      .then((avail) => {
        if (initRequestIdRef.current !== requestId) return;
        setAvailability(avail);
        if (avail === 'available') {
          window.Translator?.create({
            sourceLanguage: Options.sourceLanguage,
            targetLanguage: Options.targetLanguage,
          })
            .then((inst) => {
              if (initRequestIdRef.current !== requestId) {
                safeDestroyTranslator(inst);
                return;
              }
              translatorRef.current = inst;
              setTranslator(inst);
            })
            .catch(() => {
              if (initRequestIdRef.current !== requestId) return;
              setError(true);
              setAvailability('unavailable');
            });
        }
      })
      .catch(() => {
        if (initRequestIdRef.current !== requestId) return;
        setError(true);
        setAvailability('unavailable');
      });
  }, [isApiSupported, setAvailability, setError]);

  useEffect(() => {
    return () => {
      safeDestroyTranslator(translator);
    };
  }, [translator]);

  const translate = useCallback(
    async (text: string): Promise<string> => {
      const activeTranslator = translatorRef.current ?? translator;
      if (!activeTranslator) return '';
      return activeTranslator.translate(text);
    },
    [translator]
  );

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
