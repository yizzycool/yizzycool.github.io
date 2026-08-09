'use client';

import { useState } from 'react';

type Props = {
  isApiSupported: boolean | null;
};

export default function useAiCommon({ isApiSupported }: Props) {
  const [availability, setAvailability] = useState<AIAvailability | null>(null);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);

  const hasCheckedAIStatus =
    isApiSupported === null ? false : !isApiSupported || availability !== null;

  const shouldDownloadModel = ['downloadable', 'downloading'].includes(
    availability ?? ''
  );

  return {
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
  };
}
