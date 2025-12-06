'use client';

import { useState } from 'react';
import _isNull from 'lodash/isNull';

export default function useApiCommon() {
  const [isApiSupported, setIsApiSupported] = useState<boolean | null>(null);
  const [error, setError] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const hasCheckedApiStatus = !_isNull(isApiSupported);

  return {
    isApiSupported,
    setIsApiSupported,
    error,
    setError,
    isProcessing,
    setIsProcessing,
    hasCheckedApiStatus,
  };
}
