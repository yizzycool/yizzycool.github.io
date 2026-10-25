'use client';

import type { ChangeEvent } from 'react';
import type {
  FormatOptions,
  HexBinaryHistoryData,
  HexBinaryResult,
  InputMode,
} from '../types';

import { useState, useCallback, useRef } from 'react';

import { useToolHistory } from '@/hooks/tools/use-tool-history';
import useToolHotkeys from '@/hooks/tools/use-tool-hotkeys';
import toast from '@/utils/toast';

import { DEFAULT_FORMAT_OPTIONS, SAMPLE_INPUTS } from '../constants';
import {
  convertPayload,
  formatBinary,
  formatCArray,
  formatDecimal,
  formatHex,
  formatPythonBytes,
} from '../utils/hex-binary-core';

const EMPTY_RESULT: HexBinaryResult = {
  bytes: new Uint8Array(0),
  text: '',
  hex: '',
  binary: '',
  decimal: '',
  cArray: '{ }',
  pythonBytes: 'b""',
  byteLength: 0,
  bitLength: 0,
  charCount: 0,
};

export default function useHexBinaryConverter() {
  const [input, setInput] = useState<string>('');
  const [inputMode, setInputMode] = useState<InputMode>('text');
  const [options, setOptionsState] = useState<FormatOptions>(
    DEFAULT_FORMAT_OPTIONS
  );
  const [result, setResult] = useState<HexBinaryResult>(EMPTY_RESULT);

  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Hook into tool history store (defaults to 10 items)
  const {
    historyList,
    isLoading: isLoadingHistory,
    addHistory,
    renameHistory,
    removeHistory,
    clearHistory,
  } = useToolHistory<HexBinaryHistoryData>('hex-binary-converter');

  // Delimiter & Case options change (re-format existing result if present)
  const setOptions = useCallback((newOptions: FormatOptions) => {
    setOptionsState(newOptions);
    setResult((prev) => {
      if (prev.byteLength === 0) return prev;
      return {
        ...prev,
        hex: formatHex(prev.bytes, newOptions),
        binary: formatBinary(prev.bytes, newOptions),
        decimal: formatDecimal(prev.bytes, newOptions),
        cArray: formatCArray(prev.bytes, newOptions.hexCase),
        pythonBytes: formatPythonBytes(prev.bytes, newOptions.hexCase),
      };
    });
  }, []);

  // Execute action (converts payload and adds to history)
  const handleExecute = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed) {
      toast.warning('Please enter an input payload');
      return;
    }

    const converted = convertPayload(input, inputMode, options);
    if (converted.byteLength === 0) {
      toast.error('Invalid format: could not parse any valid bytes');
      return;
    }

    setResult(converted);

    const title = `[${inputMode.toUpperCase()}] ${trimmed.slice(0, 32)}`;
    addHistory(title, {
      input,
      inputMode,
      preview: converted.hex.slice(0, 48),
      byteLength: converted.byteLength,
    });
    toast.success('Converted & saved to history!');
  }, [input, inputMode, options, addHistory]);

  // Clear input and current result
  const handleClear = useCallback(() => {
    setInput('');
    setResult(EMPTY_RESULT);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Load sample based on current input mode
  const handleLoadSample = useCallback(() => {
    const sample = SAMPLE_INPUTS[inputMode];
    setInput(sample);
    toast.success(`Loaded sample for ${inputMode.toUpperCase()}`);
  }, [inputMode]);

  // Input change handler
  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      setInput(e.target.value);
    },
    []
  );

  // Direct paste handler
  const handlePaste = useCallback((text: string) => {
    setInput(text);
  }, []);

  // Global clipboard paste
  const handleGlobalPaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setInput(text);
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }
    } catch {
      toast.error('Failed to read from clipboard');
    }
  }, []);

  // Copy primary hex result
  const handleCopyHex = useCallback(async () => {
    if (!result.hex) return;
    try {
      await navigator.clipboard.writeText(result.hex);
      toast.success('Hex copied to clipboard!');
    } catch {
      toast.error('Failed to copy to clipboard');
    }
  }, [result.hex]);

  // Restore from history
  const handleRestoreHistory = useCallback(
    (data: HexBinaryHistoryData) => {
      setInput(data.input);
      setInputMode(data.inputMode);
      const converted = convertPayload(data.input, data.inputMode, options);
      setResult(converted);
      toast.success('Loaded from history');
    },
    [options]
  );

  // Keyboard Shortcuts
  useToolHotkeys(
    {
      onExecute: handleExecute,
      onClear: handleClear,
      onPaste: handleGlobalPaste,
      onCopy: handleCopyHex,
    },
    { target: inputRef }
  );

  return {
    input,
    setInput,
    inputMode,
    setInputMode,
    options,
    setOptions,
    result,
    inputRef,
    // History
    historyList,
    isLoadingHistory,
    addHistory,
    renameHistory,
    removeHistory,
    clearHistory,
    handleRestoreHistory,
    // Actions
    handleExecute,
    handleClear,
    handleLoadSample,
    handleInputChange,
    handlePaste,
    handleCopyHex,
  };
}
