'use client';

import { useState, useCallback } from 'react';
import toast from '@/utils/toast';

type Props = {
  isApiSupported: boolean | null;
};

export default function useAiCommon({ isApiSupported }: Props) {
  const [availability, setAvailability] = useState<AIAvailability | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);

  const setError = useCallback((err: boolean | string) => {
    if (!err) return;
    const msg =
      typeof err === 'string'
        ? err
        : 'Something went wrong! Please try again later.';
    toast.error(msg);
  }, []);

  const hasCheckedAIStatus =
    isApiSupported === null ? false : !isApiSupported || availability !== null;

  const shouldDownloadModel = ['downloadable', 'downloading'].includes(
    availability ?? ''
  );

  return {
    availability,
    setAvailability,
    setError,
    downloadProgress,
    setDownloadProgress,
    hasCheckedAIStatus,
    shouldDownloadModel,
  };
}
