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
  const [output, setOutput] = useState<string>('');
  const [parsedObject, setParsedObject] = useState<
    object | Array<unknown> | null
  >(null);

  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Hook into tool history store
  const {
    historyList,
    isLoading: isLoadingHistory,
    addHistory,
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
        setOutput('');
        setParsedObject(null);
        return;
      }

      try {
        const obj = JSON.parse(jsonString);
        setParsedObject(obj);

        if (currentTab === 'Format') {
          setOutput(JSON.stringify(obj, null, 2));
        } else if (currentTab === 'Minify') {
          setOutput(JSON.stringify(obj));
        } else if (currentTab === 'YAML') {
          setOutput(jsonToYaml(obj));
        } else if (currentTab === 'CSV') {
          setOutput(jsonToCsv(obj));
        } else if (currentTab === 'Tree View') {
          setOutput(JSON.stringify(obj, null, 2));
        }

        if (shouldSaveHistory) {
          addHistory(jsonString, { input: jsonString, tab: currentTab });
        }

        toast.success(successMessages[currentTab] || 'JSON processed!');
      } catch (err) {
        toast.error((err as Error).message || 'Invalid JSON format');
        setParsedObject(null);
      }
    },
    [addHistory, input, tab]
  );

  const onJsonStringChanged = useCallback(
    (event: ChangeEvent<HTMLTextAreaElement>) => {
      setInput(event.target.value);
    },
    []
  );

  const onPaste = useCallback((value: string) => {
    setInput(value);
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
  }, []);

  const onClear = useCallback(() => {
    setInput('');
    setOutput('');
    setParsedObject(null);
  }, []);

  const onTabChanged = useCallback(
    (newTab: string) => {
      setTab(newTab);
      if (input.trim()) {
        processJson(input, newTab);
      }
    },
    [input, processJson]
  );

  const onRestoreHistory = useCallback(
    (data: JsonHistoryData) => {
      setInput(data.input);
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
