import { useCallback, useMemo, useState } from 'react';
import toast from '@/utils/toast';

import { SAMPLE_JWT } from '../constants';
import { parseJwt } from '../utils/jwt-parser';

export function useJwtDebugger() {
  const [tokenInput, setTokenInput] = useState<string>('');

  // Parse token
  const parsed = useMemo(() => parseJwt(tokenInput), [tokenInput]);

  const handleInputChange = useCallback((value: string) => {
    setTokenInput(value);
  }, []);

  const handleLoadSample = useCallback(() => {
    setTokenInput(SAMPLE_JWT);
    toast.success('Loaded sample JWT');
  }, []);

  const handleClear = useCallback(() => {
    setTokenInput('');
  }, []);

  const handleCopyPayload = useCallback(async () => {
    if (!parsed.status.isValid) return;
    try {
      await navigator.clipboard.writeText(
        JSON.stringify(parsed.payload, null, 2)
      );
      toast.success('Payload JSON copied to clipboard');
    } catch {
      toast.error('Failed to copy to clipboard');
    }
  }, [parsed.status.isValid, parsed.payload]);

  const handleCopyHeader = useCallback(async () => {
    if (!parsed.status.isValid) return;
    try {
      await navigator.clipboard.writeText(
        JSON.stringify(parsed.header, null, 2)
      );
      toast.success('Header JSON copied to clipboard');
    } catch {
      toast.error('Failed to copy to clipboard');
    }
  }, [parsed.status.isValid, parsed.header]);

  const handleCopyToken = useCallback(async () => {
    if (!tokenInput.trim()) return;
    try {
      await navigator.clipboard.writeText(tokenInput.trim());
      toast.success('Token copied to clipboard');
    } catch {
      toast.error('Failed to copy to clipboard');
    }
  }, [tokenInput]);

  return {
    tokenInput,
    parsed,
    handleInputChange,
    handleLoadSample,
    handleClear,
    handleCopyPayload,
    handleCopyHeader,
    handleCopyToken,
  };
}
