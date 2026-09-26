'use client';

import { useCallback, useRef } from 'react';

import useToolHotkeys, { TOOL_HOTKEYS } from '@/hooks/tools/use-tool-hotkeys';
import HeaderBlock from '../../common/header-block';
import SectionGap from '../../common/section-gap';
import toast from '@/utils/toast';

import useHashCalculator from './hooks/use-hash-calculator';
import useHashMatcher from './hooks/use-hash-matcher';
import { applyCaseMode } from './utils/formatters';
import ChecksumMatcherSection from './checksum-matcher-section';
import HashInputSection from './hash-input-section';
import HashResultsSection from './hash-results-section';

export default function HashGenerator() {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const {
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

    onClear,
    onPaste,
    onResetSample,
  } = useHashCalculator();

  const {
    targetHash,
    setTargetHash,
    hasTarget,
    isMatching,
    matchedAlgorithm,
    isMatchedAlgorithm,
    onClearTarget,
  } = useHashMatcher(results);

  // ----------------------------------------------------
  // Hotkeys Listener & Global Action Handlers
  // ----------------------------------------------------
  const handleCopyResults = useCallback(() => {
    const hasResults =
      results.length > 0 && results.some((r) => r.hex || r.base64);
    if (!hasResults) {
      toast.error('No hash results available to copy');
      return;
    }

    const textToCopy = results
      .map((item) => {
        const rawVal = encoding === 'hex' ? item.hex : item.base64;
        const val = rawVal ? applyCaseMode(rawVal, caseMode) : '';
        const label = isHmac ? `HMAC-${item.algorithm}` : item.algorithm;
        return `${label}: ${val}`;
      })
      .filter(Boolean)
      .join('\n');

    navigator.clipboard
      .writeText(textToCopy)
      .then(() => {
        toast.success('All hash results copied to clipboard');
      })
      .catch(() => {
        toast.error('Failed to copy hashes to clipboard');
      });
  }, [results, encoding, caseMode, isHmac]);

  const handleGlobalPaste = useCallback(async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      if (clipboardText) {
        onPaste(clipboardText);
        if (textareaRef.current) {
          textareaRef.current.focus();
        }
        toast.success('Pasted clipboard into input!');
      }
    } catch {
      toast.error('Failed to read from clipboard');
    }
  }, [onPaste]);

  useToolHotkeys(
    {
      onCopy: handleCopyResults,
      onPaste: handleGlobalPaste,
      onClear,
    },
    { target: textareaRef }
  );

  return (
    <>
      <HeaderBlock
        customShortcuts={[
          TOOL_HOTKEYS.paste,
          { ...TOOL_HOTKEYS.copy, label: 'Copy Results' },
          { ...TOOL_HOTKEYS.clear, label: 'Clear Payload' },
          TOOL_HOTKEYS.help,
        ]}
      />

      <SectionGap />

      {/* 1. Input Payload: Plain Text or Local File */}
      <HashInputSection
        inputMode={inputMode}
        setInputMode={setInputMode}
        textInput={textInput}
        setTextInput={setTextInput}
        file={file}
        setFile={setFile}
        fileMeta={fileMeta}
        textStats={textStats}
        inputRef={textareaRef}
        onClear={onClear}
        onPaste={onPaste}
        onResetSample={onResetSample}
      />

      <SectionGap />

      {/* 2. Results & Controls: Integrated format/case/HMAC controls + Calculated Hashes */}
      <HashResultsSection
        results={results}
        encoding={encoding}
        setEncoding={setEncoding}
        caseMode={caseMode}
        setCaseMode={setCaseMode}
        isHmac={isHmac}
        setIsHmac={setIsHmac}
        hmacKey={hmacKey}
        setHmacKey={setHmacKey}
        hmacKeyEncoding={hmacKeyEncoding}
        setHmacKeyEncoding={setHmacKeyEncoding}
        isComputing={isComputing}
        isMatchedAlgorithm={isMatchedAlgorithm}
        fileMeta={fileMeta}
        textInput={textInput}
        inputMode={inputMode}
      />

      <SectionGap />

      {/* 3. Verification: Target Checksum Comparison moved to bottom */}
      <ChecksumMatcherSection
        targetHash={targetHash}
        setTargetHash={setTargetHash}
        hasTarget={hasTarget}
        isMatching={isMatching}
        matchedAlgorithm={matchedAlgorithm}
        onClearTarget={onClearTarget}
      />
    </>
  );
}
