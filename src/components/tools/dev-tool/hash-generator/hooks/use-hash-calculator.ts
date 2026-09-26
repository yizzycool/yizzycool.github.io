'use client';

import type {
  FileMetadata,
  HashCaseMode,
  HashEncoding,
  HashInputMode,
  HashResultItem,
  HmacKeyEncoding,
} from '../types';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { DEFAULT_SAMPLE_TEXT } from '../constants';
import { computeAllHashes } from '../utils/crypto-engine';
import { hexToBytes, stringToUtf8Bytes } from '../utils/formatters';

export function useHashCalculator() {
  const [inputMode, setInputMode] = useState<HashInputMode>('text');
  const [textInput, setTextInput] = useState<string>(DEFAULT_SAMPLE_TEXT);
  const [file, setFile] = useState<File | null>(null);

  const [encoding, setEncoding] = useState<HashEncoding>('hex');
  const [caseMode, setCaseMode] = useState<HashCaseMode>('lower');

  const [isHmac, setIsHmac] = useState<boolean>(false);
  const [hmacKey, setHmacKey] = useState<string>('');
  const [hmacKeyEncoding, setHmacKeyEncoding] =
    useState<HmacKeyEncoding>('utf-8');

  const [isComputing, setIsComputing] = useState<boolean>(false);
  const [results, setResults] = useState<HashResultItem[]>([]);

  // Calculation sequence tracker to prevent out-of-order race conditions
  const calculationIdRef = useRef<number>(0);

  const fileMeta = useMemo<FileMetadata | null>(() => {
    if (!file) return null;
    return {
      name: file.name,
      size: file.size,
      type: file.type || 'application/octet-stream',
    };
  }, [file]);

  const textStats = useMemo(() => {
    const bytes = stringToUtf8Bytes(textInput);
    const lines = textInput ? textInput.split(/\r\n|\r|\n/).length : 0;
    return {
      charCount: textInput.length,
      byteCount: bytes.length,
      lineCount: lines,
    };
  }, [textInput]);

  const hmacKeyBytes = useMemo<Uint8Array>(() => {
    if (!isHmac || !hmacKey) return new Uint8Array(0);
    return hmacKeyEncoding === 'hex'
      ? hexToBytes(hmacKey)
      : stringToUtf8Bytes(hmacKey);
  }, [isHmac, hmacKey, hmacKeyEncoding]);

  const executeCalculation = useCallback(async () => {
    const currentId = ++calculationIdRef.current;
    setIsComputing(true);

    try {
      let dataBytes: Uint8Array;

      if (inputMode === 'text') {
        dataBytes = stringToUtf8Bytes(textInput);
      } else if (file) {
        const buffer = await file.arrayBuffer();
        dataBytes = new Uint8Array(buffer);
      } else {
        dataBytes = new Uint8Array(0);
      }

      const computedResults = await computeAllHashes(
        dataBytes,
        isHmac,
        hmacKeyBytes
      );

      // Only update state if this is still the latest calculation
      if (currentId === calculationIdRef.current) {
        setResults(computedResults);
      }
    } catch (_err) {
      if (currentId === calculationIdRef.current) {
        setResults([]);
      }
    } finally {
      if (currentId === calculationIdRef.current) {
        setIsComputing(false);
      }
    }
  }, [inputMode, textInput, file, isHmac, hmacKeyBytes]);

  // Debounced auto-recalculation when text, file, or HMAC configuration changes
  useEffect(() => {
    const timer = setTimeout(() => {
      executeCalculation();
    }, 150);

    return () => clearTimeout(timer);
  }, [executeCalculation]);

  const handleClear = useCallback(() => {
    if (inputMode === 'text') {
      setTextInput('');
    } else {
      setFile(null);
    }
  }, [inputMode]);

  const handlePaste = useCallback((pastedText: string) => {
    setTextInput(pastedText);
  }, []);

  const handleResetSample = useCallback(() => {
    setInputMode('text');
    setTextInput(DEFAULT_SAMPLE_TEXT);
    setFile(null);
  }, []);

  return {
    inputMode,
    setInputMode,
    textInput,
    setTextInput,
    file,
    setFile,
    fileMeta,
    textStats,

    encoding,
    setEncoding,
    caseMode,
    setCaseMode,

    isHmac,
    setIsHmac,
    hmacKey,
    setHmacKey,
    hmacKeyEncoding,
    setHmacKeyEncoding,

    isComputing,
    results,

    onClear: handleClear,
    onPaste: handlePaste,
    onResetSample: handleResetSample,
  };
}

export default useHashCalculator;
