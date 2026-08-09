'use client';

import { useState } from 'react';

type Props = {
  isApiSupported: boolean | null;
};

export default function useApiCommon({ isApiSupported }: Props) {
  const [error, setError] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const hasCheckedApiStatus = isApiSupported !== null;

  return {
    error,
    setError,
    isProcessing,
    setIsProcessing,
    hasCheckedApiStatus,
  };
}
