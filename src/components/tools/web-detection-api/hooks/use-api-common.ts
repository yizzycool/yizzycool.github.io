'use client';

import { useState, useCallback } from 'react';
import toast from '@/utils/toast';

type Props = {
  isApiSupported: boolean | null;
};

export default function useApiCommon({ isApiSupported }: Props) {
  const [isProcessing, setIsProcessing] = useState(false);

  const setError = useCallback((err: boolean | string) => {
    if (!err) return;
    const msg =
      typeof err === 'string' ? err : 'Detection failed! Please try again.';
    toast.error(msg);
  }, []);

  const hasCheckedApiStatus = isApiSupported !== null;

  return {
    setError,
    isProcessing,
    setIsProcessing,
    hasCheckedApiStatus,
  };
}
