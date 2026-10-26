'use client';

import type { ChangeEvent } from 'react';
import type { TabItem } from '../constants';

import { useState, useMemo, useCallback, useRef } from 'react';

import { useToolHistory } from '@/hooks/tools/use-tool-history';
import { jsonToYaml, jsonToCsv } from '@/utils/tools/json-converter';
import { TAB_ITEMS, SAMPLE_JSON } from '../constants';
import useToolHotkeys from '@/hooks/tools/use-tool-hotkeys';
import toast from '@/utils/toast';

export const successMessages: Record<string, string> = {
  Format: 'JSON formatted successfully!',
  Minify: 'Minified successfully!',
  YAML: 'Converted to YAML!',
  CSV: 'Converted to CSV!',
  'Tree View': 'Tree view generated!',
};

export type JsonHistoryData = {
  input: string;
  tab?: string;
};

export default function useJsonFormatter() {
  const [tab, setTab] = useState<string>(TAB_ITEMS[0]);
  const [input, setInput] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [parsedObject, setParsedObject] = useState<
    object | Array<unknown> | null
  >(null);

  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Hook into tool history store
  const {
    historyList,
    isLoading: isLoadingHistory,
    addHistoryWithToast,
    renameHistory,
    removeHistory,
    clearHistory,
  } = useToolHistory<JsonHistoryData>('json-formatter');

  const processJson = useCallback(
    (
      jsonString: string = input,
      currentTab: string = tab,
      shouldSaveHistory = true
    ) => {
      if (!jsonString.trim()) {
        setParsedObject(null);
        setError(null);
        return;
      }

      try {
        const obj = JSON.parse(jsonString);
        setParsedObject(obj);
        setError(null);

        toast.success(successMessages[currentTab] || 'JSON processed!');

        if (shouldSaveHistory) {
          addHistoryWithToast(jsonString, {
            input: jsonString,
            tab: currentTab,
          });
        }
      } catch (err) {
        const errorMsg = (err as Error).message || 'Invalid JSON format';
        setError(errorMsg);
        toast.error(errorMsg);
        setParsedObject(null);
      }
    },
    [addHistoryWithToast, input, tab]
  );

  // Derive output dynamically from parsedObject and active tab
  const output = useMemo(() => {
    if (!parsedObject) return '';
    try {
      if (tab === 'Format' || tab === 'Tree View') {
        return JSON.stringify(parsedObject, null, 2);
      }
      if (tab === 'Minify') {
        return JSON.stringify(parsedObject);
      }
      if (tab === 'YAML') {
        return jsonToYaml(parsedObject);
      }
      if (tab === 'CSV') {
        return jsonToCsv(parsedObject);
      }
      return '';
    } catch {
      return '';
    }
  }, [parsedObject, tab]);

  const onJsonStringChanged = useCallback(
    (event: ChangeEvent<HTMLTextAreaElement>) => {
      setInput(event.target.value);
      setError(null);
    },
    []
  );

  const onPaste = useCallback((value: string) => {
    setInput(value);
    setError(null);
  }, []);

  const onGlobalPaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      onPaste(text);
    } catch (err) {
      toast.error((err as Error).message || 'Something went wrong!');
    }
  }, [onPaste]);

  const onCopyResult = useCallback(async () => {
    try {
      if (!output) return;

      await navigator.clipboard.writeText(output);
      toast.success('Copied to clipboard!');
    } catch (err) {
      toast.error((err as Error).message || 'Something went wrong!');
    }
  }, [output]);

  const onLoadSample = useCallback(() => {
    setInput(SAMPLE_JSON);
    setError(null);
  }, []);

  const onClear = useCallback(() => {
    setInput('');
    setParsedObject(null);
    setError(null);
  }, []);

  const onTabChanged = useCallback((newTab: string) => {
    setTab(newTab);
    setError(null);
  }, []);

  const onRestoreHistory = useCallback(
    (data: JsonHistoryData) => {
      setInput(data.input);
      setError(null);
      if (data.tab) {
        setTab(data.tab);
      }
      processJson(data.input, data.tab || tab, false);
    },
    [processJson, tab]
  );

  // Language mode for syntax highlighting
  const syntaxLanguage = useMemo(() => {
    if (tab === 'YAML') return 'yaml';
    if (tab === 'CSV') return 'csv';
    return 'json';
  }, [tab]);

  // Dynamic execute button label
  const executeButtonLabel = useMemo(() => {
    switch (tab as TabItem) {
      case 'Format':
        return 'Format JSON';
      case 'Minify':
        return 'Minify JSON';
      case 'Tree View':
        return 'Build Tree View';
      case 'YAML':
        return 'Convert to YAML';
      case 'CSV':
        return 'Convert to CSV';
      default:
        return 'Process JSON';
    }
  }, [tab]);

  useToolHotkeys(
    {
      onExecute: () => processJson(),
      onClear,
      onPaste: onGlobalPaste,
      onCopy: onCopyResult,
    },
    { target: inputRef }
  );

  return {
    tab,
    input,
    output,
    error,
    parsedObject,
    syntaxLanguage,
    executeButtonLabel,
    historyList,
    isLoadingHistory,
    inputRef,
    processJson,
    onJsonStringChanged,
    onPaste,
    onLoadSample,
    onClear,
    onTabChanged,
    onRestoreHistory,
    renameHistory,
    removeHistory,
    clearHistory,
  };
}
