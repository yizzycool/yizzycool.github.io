'use client';

import { useEffect, useState } from 'react';

import useAiCommon from './use-ai-common';
import browserUtils from '@/utils/browser-utils';

import _defaults from 'lodash/defaults';
import _isNull from 'lodash/isNull';
import _startsWith from 'lodash/startsWith';
import _size from 'lodash/size';

const Options: AIProofreaderCreateOptions = {
  includeCorrectionTypes: true,
  includeCorrectionExplanations: true,
  correctionExplanationLanguage: 'en',
  expectedInputLanguages: ['en'],
};

export default function useAiProofreader() {
  const [proofreader, setProofreader] = useState<AIProofreader | null>(null);
  const [options, setOptions] = useState(Options);

  const {
    isApiSupported,
    setIsApiSupported,
    availability,
    setAvailability,
    error,
    setError,
    errorMessage,
    setErrorMessage,
    downloadProgress,
    setDownloadProgress,
    hasCheckedAIStatus,
    shouldDownloadModel,
  } = useAiCommon();

  useEffect(() => {
    // Check if API is supported on the device
    const apiExist = !!window.Proofreader;
    setIsApiSupported(apiExist);
    if (!apiExist) return;
    checkAvailability();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      proofreader?.destroy?.();
    };
  }, [proofreader]);

  // To check if proofreader is supported
  const checkAvailability = async () => {
    // Check API availability (unavailable / downloadable / downloading / available)
    const availability = await window.Proofreader?.availability?.();
    setAvailability(availability);
    if (availability === 'available') {
      initProofreader();
    }
  };

  const initProofreader = async (
    monitor?: AICreateMonitorCallback | undefined
  ) => {
    if (!window.Proofreader) {
      setIsApiSupported(false);
      return;
    }
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
        const newOptions = _defaults(options, Options);
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
    // Check API availability (unavailable / downloadable / downloading / available)
    const availability = await window.Proofreader?.availability?.();
    setAvailability(availability);
  };

  const proofread = async (text: string): Promise<ProofreadResult | null> => {
    if (!proofreader) return null;
    try {
      const result = await proofreader.proofread(text);
      return result;
    } catch (e) {
      console.log('proofread error:', e);
      const msg = (e as Error).message;
      setError(true);
      setErrorMessage(msg);
      return null;
    }
  };

  const resetError = () => setError(false);

  return {
    hasCheckedAIStatus,
    isApiSupported,
    availability,
    error,
    errorMessage,
    options,
    isOptionUpdating: _isNull(proofreader),
    proofread,
    updateProofreader,
    shouldDownloadModel,
    downloadModel,
    downloadProgress,
    resetError,
  };
}
