'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { isNull, defaults } from 'lodash';

import useAiCommon from './use-ai-common';
import browserUtils from '@/utils/browser-utils';

const Options: AILanguageModelCreateOptions = {
  topK: 3,
  temperature: 1,
  systemPrompt: '',
};

export default function useAiLanguageModel() {
  const [session, setSession] = useState<AILanguageModel | null>(null);
  const [options, setOptions] = useState(Options);

  const isApiSupported = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  const {
    availability,
    setAvailability,
    error,
    setError,
    downloadProgress,
    setDownloadProgress,
    hasCheckedAIStatus,
    shouldDownloadModel,
  } = useAiCommon({ isApiSupported });

  const initLanguageModel = async (
    monitor?: AICreateMonitorCallback | undefined
  ) => {
    if (!window.LanguageModel) return;
    try {
      const session = await window.LanguageModel.create({
        ...options,
        monitor,
      });
      setSession(session);
    } catch (_e) {
      setError(true);
    }
  };

  const updateLanguageModel = async (options: AILanguageModelCreateOptions) => {
    if (!window.LanguageModel) return;
    try {
      if (session) session?.destroy?.();
      setSession(null);
      await browserUtils.sleep(500);
      const newOptions = defaults(options, Options);
      const newSession = await window.LanguageModel.create(newOptions);
      setOptions(newOptions);
      setSession(newSession);
    } catch (_e) {
      setError(true);
    }
  };

  const resetModelWithCustomOptions = () => updateLanguageModel(options);

  const createMonitorCallback: AICreateMonitorCallback = (monitor) => {
    setDownloadProgress(0);
    monitor.addEventListener('downloadprogress', (e) => {
      setDownloadProgress(e.loaded);
      if (e.loaded === 1) {
        setTimeout(() => setDownloadProgress(null), 1000);
      }
    });
  };

  const downloadModel = async () => {
    await initLanguageModel(createMonitorCallback);
    const availability = await window.LanguageModel?.availability?.();
    setAvailability(availability);
  };

  useEffect(() => {
    if (
      !isApiSupported ||
      typeof window === 'undefined' ||
      !window.LanguageModel
    )
      return;

    window.LanguageModel.availability?.().then((avail) => {
      setAvailability(avail);
      if (avail === 'available') {
        window.LanguageModel?.create(options)
          .then((newSession) => setSession(newSession))
          .catch(() => setError(true));
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isApiSupported, setAvailability, setError]);

  useEffect(() => {
    return () => {
      session?.destroy?.();
    };
  }, [session]);

  const prompt = async (text: string): Promise<string | null> => {
    if (!session) return null;
    try {
      const result = await session.prompt(text);
      return result;
    } catch (e) {
      console.log('prompt error:', e);
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
    } catch (e) {
      console.log('prompt streaming error:', e);
      return null;
    }
  };

  const resetError = () => setError(false);

  return {
    hasCheckedAIStatus,
    isApiSupported,
    availability,
    error,
    options,
    isOptionUpdating: isNull(session),
    session,
    prompt,
    promptStreaming,
    updateLanguageModel,
    resetModelWithCustomOptions,
    shouldDownloadModel,
    downloadModel,
    downloadProgress,
    resetError,
  };
}

function subscribe() {
  return () => {};
}

function getSnapshot() {
  return typeof window !== 'undefined' && 'LanguageModel' in window;
}

function getServerSnapshot() {
  return null;
}
