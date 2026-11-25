'use client';

import type { ChangeEvent } from 'react';
import type { TabItem } from '../constants';

import { useCallback, useMemo, useRef, useState } from 'react';

import { useToolHistory } from '@/hooks/tools/use-tool-history';
import useToolHotkeys from '@/hooks/tools/use-tool-hotkeys';
import toast from '@/utils/toast';
import { jsonToCsv, jsonToYaml } from '@/utils/tools/json-converter';

import { SAMPLE_COMPARE_JSON, SAMPLE_JSON, TAB_ITEMS } from '../constants';
import { computeJsonDiff } from '../utils/json-diff';
import { tryRepairJson } from '../utils/json-repair';
import {
  generateTypeScript,
  generateZodSchema,
} from '../utils/json-schema-gen';
import { computeJsonTelemetry } from '../utils/json-telemetry';

export const successMessages: Record<TabItem, string> = {
  Format: 'JSON formatted successfully!',
  Minify: 'Minified successfully!',
  'Tree View': 'Tree view generated!',
  Diff: 'Compared JSON snapshots!',
  TypeScript: 'TypeScript interfaces generated!',
  Zod: 'Zod schema generated!',
  YAML: 'Converted to YAML!',
  CSV: 'Converted to CSV!',
};

export type JsonHistoryData = {
  input: string;
  tab?: TabItem;
};

export default function useJsonFormatter() {
  const [tab, setTab] = useState<TabItem>(TAB_ITEMS[0]);
  const [input, setInput] = useState<string>('');
  const [compareInput, setCompareInput] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [parsedObject, setParsedObject] = useState<
    object | Array<unknown> | null
  >(null);

  const inputRef = useRef<HTMLTextAreaElement>(null);

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
      currentTab: TabItem = tab,
      shouldSaveHistory = true
    ) => {
      if (!jsonString.trim()) {
        setParsedObject(null);
        setError(null);
        return;
      }

      try {
        const obj = JSON.parse(jsonString) as object | Array<unknown>;
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

  // Live auto-repair suggestion whenever raw input fails JSON.parse
  const repairPreview = useMemo(() => {
    if (!error || !input.trim()) return null;
    return tryRepairJson(input);
  }, [error, input]);

  const onAutoRepair = useCallback(() => {
    const fixed = tryRepairJson(input);
    if (!fixed) {
      toast.error('Could not automatically repair this syntax error');
      return;
    }

    setInput(fixed.repaired);
    setParsedObject(fixed.parsed);
    setError(null);

    const summary =
      fixed.fixes.length > 0 ? ` (${fixed.fixes.join(', ')})` : '';
    toast.success(`Repaired JSON${summary}`);
  }, [input]);

  // Parse right-hand JSON for Diff comparison
  const { compareParsed, compareError } = useMemo(() => {
    if (!compareInput.trim()) {
      return { compareParsed: null, compareError: null };
    }
    try {
      const parsed = JSON.parse(compareInput) as unknown;
      return { compareParsed: parsed, compareError: null };
    } catch (err) {
      return {
        compareParsed: null,
        compareError: (err as Error).message || 'Invalid comparison JSON',
      };
    }
  }, [compareInput]);

  // Live left-side parse fallback when viewing Diff or live modes
  const liveLeftParsed = useMemo(() => {
    if (parsedObject) return parsedObject;
    if (!input.trim()) return null;
    try {
      return JSON.parse(input) as unknown;
    } catch {
      return null;
    }
  }, [input, parsedObject]);

  const diffEntries = useMemo(() => {
    if (tab !== 'Diff' || liveLeftParsed === null || compareParsed === null) {
      return [];
    }
    return computeJsonDiff(liveLeftParsed, compareParsed);
  }, [tab, liveLeftParsed, compareParsed]);

  const telemetry = useMemo(
    () => computeJsonTelemetry(input, parsedObject ?? liveLeftParsed),
    [input, parsedObject, liveLeftParsed]
  );

  // Derive output dynamically from parsedObject and active tab
  const output = useMemo(() => {
    const activeData = parsedObject ?? liveLeftParsed;
    if (!activeData) return '';
    try {
      if (tab === 'Format' || tab === 'Tree View') {
        return JSON.stringify(activeData, null, 2);
      }
      if (tab === 'Minify') {
        return JSON.stringify(activeData);
      }
      if (tab === 'TypeScript') {
        return generateTypeScript(activeData, 'RootData');
      }
      if (tab === 'Zod') {
        return generateZodSchema(activeData, 'RootData');
      }
      if (tab === 'YAML') {
        return jsonToYaml(activeData as object);
      }
      if (tab === 'CSV') {
        return jsonToCsv(activeData as object);
      }
      return '';
    } catch {
      return '';
    }
  }, [parsedObject, liveLeftParsed, tab]);

  const onJsonStringChanged = useCallback(
    (event: ChangeEvent<HTMLTextAreaElement>) => {
      setInput(event.target.value);
      setError(null);
    },
    []
  );

  const onCompareInputChanged = useCallback(
    (event: ChangeEvent<HTMLTextAreaElement>) => {
      setCompareInput(event.target.value);
    },
    []
  );

  const onClearCompareInput = useCallback(() => {
    setCompareInput('');
  }, []);

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

  const onDownloadOutput = useCallback(() => {
    if (!output) return;
    const ext =
      tab === 'TypeScript' || tab === 'Zod'
        ? 'ts'
        : tab === 'YAML'
          ? 'yaml'
          : tab === 'CSV'
            ? 'csv'
            : 'json';
    const mime =
      ext === 'json'
        ? 'application/json;charset=utf-8'
        : 'text/plain;charset=utf-8';
    const blob = new Blob([output], { type: mime });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `json-${tab.toLowerCase().replace(/\s+/g, '-')}.${ext}`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    toast.success(`Downloaded .${ext} file`);
  }, [output, tab]);

  const onLoadSample = useCallback(() => {
    setInput(SAMPLE_JSON);
    setError(null);
  }, []);

  const onLoadDiffSample = useCallback(() => {
    if (!input.trim()) {
      setInput(SAMPLE_JSON);
    }
    setCompareInput(SAMPLE_COMPARE_JSON);
    setError(null);
  }, [input]);

  const onClear = useCallback(() => {
    setInput('');
    setParsedObject(null);
    setError(null);
  }, []);

  const onTabChanged = useCallback((newTab: TabItem) => {
    setTab(newTab);
    setError(null);
  }, []);

  const onRestoreHistory = useCallback(
    (data: JsonHistoryData) => {
      setInput(data.input);
      setError(null);
      const nextTab = data.tab && TAB_ITEMS.includes(data.tab) ? data.tab : tab;
      if (data.tab && TAB_ITEMS.includes(data.tab)) {
        setTab(data.tab);
      }
      processJson(data.input, nextTab, false);
    },
    [processJson, tab]
  );

  const syntaxLanguage = useMemo(() => {
    if (tab === 'YAML') return 'yaml';
    if (tab === 'CSV') return 'csv';
    if (tab === 'TypeScript' || tab === 'Zod') return 'typescript';
    return 'json';
  }, [tab]);

  const executeButtonLabel = useMemo(() => {
    switch (tab) {
      case 'Format':
        return 'Format JSON';
      case 'Minify':
        return 'Minify JSON';
      case 'Tree View':
        return 'Build Tree View';
      case 'Diff':
        return 'Compare JSON';
      case 'TypeScript':
        return 'Generate TypeScript';
      case 'Zod':
        return 'Generate Zod Schema';
      case 'YAML':
        return 'Convert to YAML';
      case 'CSV':
        return 'Convert to CSV';
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
    compareInput,
    compareError,
    compareReady: compareParsed !== null && liveLeftParsed !== null,
    diffEntries,
    output,
    error,
    repairPreview,
    telemetry,
    parsedObject:
      parsedObject ?? (liveLeftParsed as object | Array<unknown> | null),
    syntaxLanguage,
    executeButtonLabel,
    historyList,
    isLoadingHistory,
    inputRef,
    processJson,
    onAutoRepair,
    onJsonStringChanged,
    onCompareInputChanged,
    onClearCompareInput,
    onPaste,
    onLoadSample,
    onLoadDiffSample,
    onClear,
    onDownloadOutput,
    onTabChanged,
    onRestoreHistory,
    renameHistory,
    removeHistory,
    clearHistory,
  };
}
