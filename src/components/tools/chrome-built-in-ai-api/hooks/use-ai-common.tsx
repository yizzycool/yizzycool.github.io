'use client';

import { useState } from 'react';
import _isNull from 'lodash/isNull';

export default function useAiCommon() {
  const [isApiSupported, setIsApiSupported] = useState<boolean | null>(null);
  const [availability, setAvailability] = useState<AIAvailability | null>(null);
  const [error, setError] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);

  const hasCheckedAIStatus = !(
    _isNull(isApiSupported) ||
    (isApiSupported && _isNull(availability))
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
    downloadProgress,
    setDownloadProgress,
    hasCheckedAIStatus,
    shouldDownloadModel,
  };
}
