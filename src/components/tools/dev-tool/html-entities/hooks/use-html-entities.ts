'use client';

import type { ChangeEvent } from 'react';
import type {
  HtmlEntitiesMode,
  EntityScope,
  HtmlEntitiesHistoryData,
} from '../types';

import { useState, useCallback, useRef, useMemo } from 'react';

import { useToolHistory } from '@/hooks/tools/use-tool-history';
import useToolHotkeys from '@/hooks/tools/use-tool-hotkeys';
import toast from '@/utils/toast';

import {
  TAB_ITEMS,
  SAMPLE_TEXT_TO_ENCODE,
  SAMPLE_ENTITIES_TO_DECODE,
} from '../constants';
import {
  encodeHtmlEntities,
  decodeHtmlEntities,
} from '../utils/html-entities-core';

export default function useHtmlEntities() {
  const [tab, setTab] = useState<HtmlEntitiesMode>(TAB_ITEMS[0]);
  const [scope, setScope] = useState<EntityScope>('special');
  const [input, setInput] = useState<string>('');
  const [output, setOutput] = useState<string>('');
  const [doubleEscaped, setDoubleEscaped] = useState<boolean>(false);

  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Hook into tool history store (defaults to 10 items)
  const {
    historyList,
    isLoading: isLoadingHistory,
    addHistory,
    renameHistory,
    removeHistory,
    clearHistory,
  } = useToolHistory<HtmlEntitiesHistoryData>('html-entities');

  // Process text based on mode and scope (fixed to Named format)
  const processText = useCallback(
    (
      currentTab: HtmlEntitiesMode = tab,
      currentScope: EntityScope = scope,
      currentInput: string = input
    ) => {
      const textToProcess = currentInput;
      if (!textToProcess) {
        setOutput('');
        setDoubleEscaped(false);
        return;
      }

      if (currentTab === 'Encode') {
        const encoded = encodeHtmlEntities(
          textToProcess,
          'named',
          currentScope
        );
        setOutput(encoded);
        setDoubleEscaped(false);

        addHistory(textToProcess, {
          input: textToProcess,
          output: encoded,
          mode: currentTab,
          format: 'named',
          scope: currentScope,
        });

        toast.success('HTML Entities Encoded!');
      } else {
        const { result, doubleEscaped: isDouble } =
          decodeHtmlEntities(textToProcess);
        setOutput(result);
        setDoubleEscaped(isDouble);

        addHistory(textToProcess, {
          input: textToProcess,
          output: result,
          mode: currentTab,
          format: 'named',
          scope: currentScope,
        });

        toast.success('HTML Entities Decoded!');
      }
    },
    [addHistory, input, scope, tab]
  );

  // Handle Input text change
  const onInputChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setInput(val);
    setDoubleEscaped(false);
  }, []);

  // Paste Action
  const onPaste = useCallback((val: string) => {
    setInput(val);
    setDoubleEscaped(false);
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
    const sample =
      tab === 'Encode' ? SAMPLE_TEXT_TO_ENCODE : SAMPLE_ENTITIES_TO_DECODE;
    setInput(sample);
    setDoubleEscaped(false);
  }, [tab]);

  // Clear Input & Output
  const onClear = useCallback(() => {
    setInput('');
    setOutput('');
    setDoubleEscaped(false);
  }, []);

  // Swap Input and Output
  const onSwap = useCallback(() => {
    if (!input && !output) return;
    const oldInput = input;
    const oldOutput = output;
    setInput(oldOutput);
    setOutput(oldInput);
    setDoubleEscaped(false);

    // Switch mode: Encode -> Decode, Decode -> Encode
    const nextTab: HtmlEntitiesMode = tab === 'Encode' ? 'Decode' : 'Encode';
    setTab(nextTab);
    toast.success(`Swapped to ${nextTab} mode!`);
  }, [input, output, tab]);

  // Handle Tab Switch
  const onTabChanged = useCallback((newTab: string) => {
    const targetTab = newTab as HtmlEntitiesMode;
    setTab(targetTab);
    setDoubleEscaped(false);
  }, []);

  // Handle Scope Switch
  const onScopeChanged = useCallback(
    (newScope: EntityScope) => {
      setScope(newScope);
      if (tab === 'Encode' && input.trim()) {
        const encoded = encodeHtmlEntities(input, 'named', newScope);
        setOutput(encoded);
      }
    },
    [input, tab]
  );

  // Quick fix for double-escaped entities
  const onDecodeAgain = useCallback(() => {
    if (!output) return;
    const { result, doubleEscaped: isStillDouble } = decodeHtmlEntities(output);
    setOutput(result);
    setDoubleEscaped(isStillDouble);
    toast.success('Decoded second layer of HTML entities!');
  }, [output]);

  // Restore from history
  const onRestoreHistory = useCallback((data: HtmlEntitiesHistoryData) => {
    setTab(data.mode);
    if (data.scope) setScope(data.scope);
    setInput(data.input);
    setOutput(data.output);
    setDoubleEscaped(false);
    toast.success('Restored from history');
  }, []);

  // Dynamic label for Execute Button
  const executeButtonLabel = useMemo(() => {
    return tab === 'Encode' ? 'Encode HTML Entities' : 'Decode HTML Entities';
  }, [tab]);

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
    scope,
    input,
    output,
    doubleEscaped,
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
    onScopeChanged,
    onDecodeAgain,
    onRestoreHistory,
    renameHistory,
    removeHistory,
    clearHistory,
  };
}
