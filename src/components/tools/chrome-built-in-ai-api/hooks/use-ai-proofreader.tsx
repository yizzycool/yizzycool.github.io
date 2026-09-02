'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { defaults, isNull } from 'lodash';

import useAiCommon from './use-ai-common';
import browserUtils from '@/utils/browser-utils';

const Options: AIProofreaderCreateOptions = {
  includeCorrectionTypes: true,
  includeCorrectionExplanations: true,
  correctionExplanationLanguage: 'en',
  expectedInputLanguages: ['en'],
};

export default function useAiProofreader() {
  const [proofreader, setProofreader] = useState<AIProofreader | null>(null);
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

  const initProofreader = async (
    monitor?: AICreateMonitorCallback | undefined
  ) => {
    if (!window.Proofreader) return;
    try {
      const proofreader = await window.Proofreader.create({
        ...options,
        monitor,
      });
      setProofreader(proofreader);
    } catch (_e) {
      setError(true);
    }
  };

  const updateProofreader = async (options: AIProofreaderCreateOptions) => {
    if (window.Proofreader) {
      try {
        if (proofreader) proofreader?.destroy?.();
        setProofreader(null);
        await browserUtils.sleep(500);
        const newOptions = defaults(options, Options);
        const newProofreader = await window.Proofreader.create(newOptions);
        setOptions(newOptions);
        setProofreader(newProofreader);
      } catch (_e) {
        setError(true);
      }
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
    await initProofreader(createMonitorCallback);
    const availability = await window.Proofreader?.availability?.();
    setAvailability(availability);
  };

  useEffect(() => {
    if (!isApiSupported || typeof window === 'undefined' || !window.Proofreader)
      return;

    window.Proofreader.availability?.().then((avail) => {
      setAvailability(avail);
      if (avail === 'available') {
        window.Proofreader?.create(options)
          .then((inst) => setProofreader(inst))
          .catch(() => setError(true));
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isApiSupported, setAvailability, setError]);

  useEffect(() => {
    return () => {
      proofreader?.destroy?.();
    };
  }, [proofreader]);

  const proofread = async (text: string): Promise<ProofreadResult | null> => {
    if (!proofreader) return null;
    try {
      const result = await proofreader.proofread(text);
      return result;
    } catch (e) {
      console.log('proofread error:', e);
      const msg = (e as Error).message;
      setError(msg);
      return null;
    }
  };

  return {
    hasCheckedAIStatus,
    isApiSupported,
    availability,
    options,
    isOptionUpdating: isNull(proofreader),
    proofread,
    updateProofreader,
    shouldDownloadModel,
    downloadModel,
    downloadProgress,
  };
}

function subscribe() {
  return () => {};
}

function getSnapshot() {
  return typeof window !== 'undefined' && 'Proofreader' in window;
}

function getServerSnapshot() {
  return null;
}
