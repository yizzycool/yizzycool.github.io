'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { isNull, defaults } from 'lodash';

import { getLanguageDisplayName } from '../data/language-options';
import useAiCommon from './use-ai-common';
import browserUtils from '@/utils/browser-utils';

const Options: AILanguageModelCreateOptions = {
  topK: 3,
  temperature: 1,
  systemPrompt: '',
  outputLanguage: 'auto',
};

function buildLanguageModelOptions(
  opts: AILanguageModelCreateOptions,
  monitor?: AICreateMonitorCallback
): AILanguageModelCreateOptions {
  let sysPrompt = opts.systemPrompt?.trim() || '';
  if (opts.outputLanguage && opts.outputLanguage !== 'auto') {
    const langName = getLanguageDisplayName(opts.outputLanguage);
    if (langName) {
      const directive = `Please respond exclusively in ${langName}.`;
      if (!sysPrompt.includes(directive)) {
        sysPrompt = sysPrompt ? `${sysPrompt}\n\n${directive}` : directive;
      }
    }
  }

  return {
    ...opts,
    systemPrompt: sysPrompt || undefined,
    monitor,
  };
}

export default function useAiLanguageModel(
  initialOptions?: Partial<AILanguageModelCreateOptions>
) {
  const [session, setSession] = useState<AILanguageModel | null>(null);
  const [options, setOptions] = useState<AILanguageModelCreateOptions>(() =>
    defaults({}, initialOptions, Options)
  );

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

  const initLanguageModel = async (
    monitor?: AICreateMonitorCallback | undefined
  ) => {
    if (!window.LanguageModel) return;
    try {
      const session = await window.LanguageModel.create(
        buildLanguageModelOptions(options, monitor)
      );
      setSession(session);
    } catch (_e) {
      setError(true);
    }
  };

  const updateLanguageModel = async (
    newOptionsInput: Partial<AILanguageModelCreateOptions>
  ) => {
    if (!window.LanguageModel) return;
    try {
      if (session) session?.destroy?.();
      setSession(null);
      await browserUtils.sleep(500);
      const newOptions = defaults({}, newOptionsInput, options, Options);
      const newSession = await window.LanguageModel.create(
        buildLanguageModelOptions(newOptions)
      );
      setOptions(newOptions);
      setSession(newSession);
    } catch (_e) {
      setError(true);
    }
  };

  const resetModelWithCustomOptions = (custom?: AILanguageModelCreateOptions) =>
    updateLanguageModel(custom || options);

  const restoreSessionWithPrompts = async (
    messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
    customOptions?: AILanguageModelCreateOptions
  ): Promise<boolean> => {
    if (!window.LanguageModel) return false;
    try {
      if (session) session?.destroy?.();
      setSession(null);
      await browserUtils.sleep(200);

      const targetOptions = defaults(customOptions, options, Options);
      const resolvedOptions = buildLanguageModelOptions(targetOptions);

      const initialPrompts: AILanguageModelPromptDict[] = messages
        .filter((m) => m.content && m.content.trim().length > 0)
        .map((m) => ({
          role: m.role as AILanguageModelPromptRole,
          content: m.content,
        }));

      let newSession: AILanguageModel | null = null;
      try {
        newSession = await window.LanguageModel.create({
          ...resolvedOptions,
          initialPrompts:
            initialPrompts.length > 0 ? initialPrompts : undefined,
        });
      } catch (promptErr) {
        console.warn(
          'Initial prompts load failed, falling back to recent context:',
          promptErr
        );
        const recentPrompts = initialPrompts.slice(-6);
        try {
          newSession = await window.LanguageModel.create({
            ...resolvedOptions,
            initialPrompts:
              recentPrompts.length > 0 ? recentPrompts : undefined,
          });
        } catch {
          newSession = await window.LanguageModel.create(resolvedOptions);
        }
      }

      setOptions(targetOptions);
      setSession(newSession);
      return true;
    } catch (_e) {
      setError(true);
      return false;
    }
  };

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
        window.LanguageModel?.create(buildLanguageModelOptions(options))
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

  return {
    hasCheckedAIStatus,
    isApiSupported,
    availability,
    options,
    isOptionUpdating: isNull(session),
    session,
    prompt,
    promptStreaming,
    updateLanguageModel,
    resetModelWithCustomOptions,
    restoreSessionWithPrompts,
    shouldDownloadModel,
    downloadModel,
    downloadProgress,
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
