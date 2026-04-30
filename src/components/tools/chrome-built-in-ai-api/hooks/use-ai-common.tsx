'use client';

import { useState } from 'react';
import { isNull } from 'lodash';

export default function useAiCommon() {
  const [isApiSupported, setIsApiSupported] = useState<boolean | null>(null);
  const [availability, setAvailability] = useState<AIAvailability | null>(null);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);

  const hasCheckedAIStatus = !(
    isNull(isApiSupported) ||
    (isApiSupported && isNull(availability))
  );

  const shouldDownloadModel = ['downloadable', 'downloading'].includes(
    availability ?? ''
  );

  return {
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
  };
}
