'use client';

import type { ChangeEvent } from 'react';
import type {
  TabItem,
  Base64Format,
  Base64EncoderDecoderHistoryData,
} from '../types';

import { useState, useCallback, useRef, useMemo } from 'react';
import { useToolHistory } from '@/hooks/tools/use-tool-history';
import useToolHotkeys from '@/hooks/tools/use-tool-hotkeys';
import toast from '@/utils/toast';
import {
  TAB_ITEMS,
  SAMPLE_TEXT_TO_ENCODE,
  SAMPLE_BASE64_TO_DECODE,
  SAMPLE_BASE64URL_TO_DECODE,
} from '../constants';
import { encodeBase64, decodeBase64 } from '../utils/base64-core';

export default function useBase64EncoderDecoder() {
  const [tab, setTab] = useState<TabItem>(TAB_ITEMS[0]);
  const [format, setFormat] = useState<Base64Format>('standard');
  const [input, setInput] = useState<string>('');
  const [output, setOutput] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Hook into tool history store
  const {
    historyList,
    isLoading: isLoadingHistory,
    addHistory,
    renameHistory,
    removeHistory,
    clearHistory,
  } = useToolHistory<Base64EncoderDecoderHistoryData>('base64-encoder-decoder');

  // Process text based on mode and format
  const processText = useCallback(
    (
      currentTab: TabItem = tab,
      currentFormat: Base64Format = format,
      currentInput: string = input
    ) => {
      const textToProcess = currentInput;
      if (!textToProcess) {
        setOutput('');
        setError(null);
        return;
      }

      setError(null);

      if (currentTab === 'Encode') {
        try {
          const encoded = encodeBase64(textToProcess, currentFormat);
          setOutput(encoded);

          addHistory(textToProcess, {
            input: textToProcess,
            output: encoded,
            mode: currentTab,
            format: currentFormat,
          });

          toast.success(
            currentFormat === 'base64url'
              ? 'Base64URL Encoded!'
              : 'Base64 Encoded!'
          );
        } catch (err) {
          const msg = (err as Error).message || 'Encoding Error';
          setError(msg);
          toast.error(msg);
        }
      } else {
        const {
          success,
          result,
          error: decodeError,
        } = decodeBase64(textToProcess);
        if (success) {
          setOutput(result);
          addHistory(textToProcess, {
            input: textToProcess,
            output: result,
            mode: currentTab,
            format: currentFormat,
          });
          toast.success('Base64 Decoded!');
        } else {
          const msg = decodeError || 'Invalid Base64 or Base64URL string';
          setError(msg);
          toast.error(msg);
        }
      }
    },
    [addHistory, format, input, tab]
  );

  // Handle Input text change
  const onInputChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setInput(val);
    setError(null);
  }, []);

  // Paste Action
  const onPaste = useCallback((val: string) => {
    setInput(val);
    setError(null);
  }, []);

  const onGlobalPaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      onPaste(text);
      if (inputRef.current) {
        inputRef.current.focus();
      }
    } catch (_err) {
      toast.error('Failed to paste from clipboard');
    }
  }, [onPaste]);

  const onCopyResult = useCallback(async () => {
    try {
      if (!output) return;
      await navigator.clipboard.writeText(output);
      toast.success('Copied result to clipboard!');
    } catch (_err) {
      toast.error('Failed to copy');
    }
  }, [output]);

  // Load Sample Preset
  const onLoadSample = useCallback(() => {
    let sample = SAMPLE_TEXT_TO_ENCODE;
    if (tab === 'Decode') {
      sample =
        format === 'base64url'
          ? SAMPLE_BASE64URL_TO_DECODE
          : SAMPLE_BASE64_TO_DECODE;
    }
    setInput(sample);
    setError(null);
  }, [format, tab]);

  // Clear Input & Output
  const onClear = useCallback(() => {
    setInput('');
    setOutput('');
    setError(null);
  }, []);

  // Swap Input and Output
  const onSwap = useCallback(() => {
    if (!input && !output) return;
    const oldInput = input;
    const oldOutput = output;
    setInput(oldOutput);
    setOutput(oldInput);
    setError(null);

    // Switch mode: Encode -> Decode, Decode -> Encode
    const nextTab = tab === 'Encode' ? 'Decode' : 'Encode';
    setTab(nextTab);
    toast.success(`Swapped to ${nextTab} mode!`);
  }, [input, output, tab]);

  // Handle Tab Switch
  const onTabChanged = useCallback((newTab: string) => {
    const targetTab = newTab as TabItem;
    setTab(targetTab);
    setError(null);
  }, []);

  // Handle Format Switch (Standard vs Base64URL)
  const onFormatChanged = useCallback(
    (newFormat: Base64Format) => {
      setFormat(newFormat);
      setError(null);
      // Auto re-encode with new format if currently in Encode mode with input
      if (tab === 'Encode' && input.trim()) {
        try {
          const encoded = encodeBase64(input, newFormat);
          setOutput(encoded);
        } catch (_err) {
          // ignore
        }
      }
    },
    [input, tab]
  );

  // Restore from history
  const onRestoreHistory = useCallback(
    (data: Base64EncoderDecoderHistoryData) => {
      setTab(data.mode);
      if (data.format) setFormat(data.format);
      setInput(data.input);
      setOutput(data.output);
      setError(null);
      toast.success('Restored from history');
    },
    []
  );

  // Dynamic label for Execute Button
  const executeButtonLabel = useMemo(() => {
    if (tab === 'Encode') {
      return format === 'base64url'
        ? 'Encode to Base64URL'
        : 'Encode to Base64';
    }
    return 'Decode Base64';
  }, [format, tab]);

  // Hook hotkeys
  useToolHotkeys(
    {
      onExecute: () => processText(),
      onClear,
      onPaste: onGlobalPaste,
      onCopy: onCopyResult,
      onSwap,
    },
    { target: inputRef }
  );

  return {
    tab,
    format,
    input,
    output,
    error,
    executeButtonLabel,
    historyList,
    isLoadingHistory,
    inputRef,
    processText,
    onInputChange,
    onPaste,
    onLoadSample,
    onClear,
    onSwap,
    onTabChanged,
    onFormatChanged,
    onRestoreHistory,
    renameHistory,
    removeHistory,
    clearHistory,
  };
}
