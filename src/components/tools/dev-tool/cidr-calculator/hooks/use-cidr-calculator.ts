'use client';

import type { ChangeEvent } from 'react';
import type {
  CidrCalculationResult,
  CidrHistoryData,
  SubnetSplitItem,
} from '../types';

import { useState, useCallback, useMemo, useRef } from 'react';

import { useToolHistory } from '@/hooks/tools/use-tool-history';
import useToolHotkeys from '@/hooks/tools/use-tool-hotkeys';
import toast from '@/utils/toast';

import { calculateCidr, splitSubnet } from '../utils/cidr-engine';

export default function useCidrCalculator() {
  const [input, setInput] = useState<string>('');
  const [result, setResult] = useState<CidrCalculationResult | null>(null);
  const [splitPrefix, setSplitPrefix] = useState<number>(25);

  const inputRef = useRef<HTMLInputElement>(null);

  // Derived effective split prefix to ensure it stays valid without cascading renders
  const effectiveSplitPrefix = useMemo(() => {
    if (!result || !result.isValid) return splitPrefix;
    if (result.prefix >= 32) return 32;
    if (splitPrefix <= result.prefix) {
      return Math.min(32, result.prefix + 1);
    }
    return splitPrefix;
  }, [result, splitPrefix]);

  // Subnet split calculation
  const splitResults: SubnetSplitItem[] = useMemo(() => {
    if (
      !result ||
      !result.isValid ||
      result.prefix >= 32 ||
      effectiveSplitPrefix <= result.prefix
    ) {
      return [];
    }
    return splitSubnet(
      result.networkAddress,
      result.prefix,
      effectiveSplitPrefix
    );
  }, [result, effectiveSplitPrefix]);

  // Tool History integration
  const {
    historyList,
    isLoading: isLoadingHistory,
    addHistoryWithToast,
    renameHistory,
    removeHistory,
    clearHistory,
  } = useToolHistory<CidrHistoryData>('cidr-calculator');

  // Execute / Calculate on button click or hotkey Mod+Enter
  const handleExecute = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed) {
      toast.warning('Please enter an IP address or CIDR block');
      return;
    }

    const calculated = calculateCidr(trimmed);
    if (!calculated.isValid) {
      toast.error(calculated.error || 'Invalid CIDR format');
      return;
    }

    setResult(calculated);

    toast.success(`Calculated: ${calculated.cidr}`);

    const title = `${calculated.cidr} (${calculated.scopeLabel})`;
    addHistoryWithToast(title, {
      input: trimmed,
      cidr: calculated.cidr,
      usableRange: calculated.usableHostRange,
      timestamp: Date.now(),
    });
  }, [input, addHistoryWithToast]);

  // Clear input and reset result
  const handleClear = useCallback(() => {
    setInput('');
    setResult(null);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Copy primary result (CIDR + Usable Range)
  const handleCopyMain = useCallback(() => {
    if (!result || !result.isValid) {
      toast.warning('Nothing to copy. Please calculate a subnet first');
      return;
    }
    const textToCopy = `CIDR: ${result.cidr}\nNetmask: ${result.netmask}\nRange: ${result.usableHostRange}\nUsable Hosts: ${result.usableHosts.toLocaleString()}`;
    navigator.clipboard.writeText(textToCopy);
    toast.success('Copied network summary to clipboard');
  }, [result]);

  // Restore from history
  const handleRestoreHistory = useCallback((data: CidrHistoryData) => {
    if (data?.input) {
      setInput(data.input);
      const calculated = calculateCidr(data.input);
      if (calculated.isValid) {
        setResult(calculated);
      }
      toast.info(`Restored: ${data.input}`);
    }
  }, []);

  // Load sample CIDR
  const handleLoadSample = useCallback(() => {
    setInput('192.168.1.0/24');
  }, []);

  // Update input text
  const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  }, []);

  // Paste action
  const handlePaste = useCallback(
    async (eventOrText?: string | KeyboardEvent) => {
      if (typeof eventOrText === 'string') {
        setInput(eventOrText.trim());
        return;
      }
      // Fallback for keyboard shortcut Mod+V
      try {
        const text = await navigator.clipboard.readText();
        if (text) {
          setInput(text.trim());
          toast.success('Pasted from clipboard');
        }
      } catch {
        toast.error('Unable to access clipboard');
      }
    },
    []
  );

  // Keyboard shortcuts integration
  useToolHotkeys({
    onExecute: handleExecute,
    onCopy: handleCopyMain,
    onClear: handleClear,
    onPaste: handlePaste,
  });

  return {
    input,
    setInput,
    result,
    splitPrefix: effectiveSplitPrefix,
    setSplitPrefix,
    splitResults,
    inputRef,
    // History
    historyList,
    isLoadingHistory,
    renameHistory,
    removeHistory,
    clearHistory,
    handleRestoreHistory,
    // Actions
    handleExecute,
    handleClear,
    handleCopyMain,
    handleLoadSample,
    handleInputChange,
    handlePaste,
  };
}
