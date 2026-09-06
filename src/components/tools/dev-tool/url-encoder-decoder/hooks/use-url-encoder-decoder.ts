'use client';

import type { ChangeEvent } from 'react';
import type { TabItem } from '../constants';
import type { QueryParamItem } from '../query-params-table';

import { useState, useCallback, useRef, useMemo } from 'react';
import { useToolHistory } from '@/hooks/tools/use-tool-history';
import useToolHotkeys from '@/hooks/tools/use-tool-hotkeys';
import browserUtils from '@/utils/browser-utils';
import toast from '@/utils/toast';
import {
  TAB_ITEMS,
  SAMPLE_URL_TO_ENCODE,
  SAMPLE_URL_TO_DECODE,
  SAMPLE_URL_WITH_PARAMS,
} from '../constants';

export type UrlEncoderDecoderHistoryData = {
  input: string;
  output: string;
  mode: TabItem;
  encodeMode?: 'component' | 'uri';
  decodeMode?: 'component' | 'uri';
  baseUrl?: string;
  params?: QueryParamItem[];
};

export default function useUrlEncoderDecoder() {
  const [tab, setTab] = useState<TabItem>(TAB_ITEMS[0]);
  const [input, setInput] = useState<string>('');
  const [rawOutput, setOutput] = useState<string>('');

  // Query Params visual editor states
  const [baseUrl, setBaseUrl] = useState<string>('');
  const [queryParams, setQueryParams] = useState<QueryParamItem[]>([]);

  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Hook into tool history store
  const {
    historyList,
    isLoading: isLoadingHistory,
    addHistory,
    renameHistory,
    removeHistory,
    clearHistory,
  } = useToolHistory<UrlEncoderDecoderHistoryData>('url-encoder-decoder');

  // Parse URL to Base URL and Params
  const parseUrlToParams = useCallback(
    (urlStr: string) => {
      if (!urlStr.trim()) {
        setBaseUrl('');
        setQueryParams([]);
        return;
      }

      try {
        // Split base and query string
        const [base, rest = ''] = urlStr.split('?');
        const [queryString] = rest.split('#');

        setBaseUrl(base);

        if (!queryString) {
          setQueryParams([]);
          return;
        }

        const searchParams = new URLSearchParams(queryString);
        const items: QueryParamItem[] = [];

        searchParams.forEach((val, key) => {
          items.push({
            id: `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            key,
            value: val,
            enabled: true,
          });
        });

        setQueryParams(items);
      } catch (_err) {
        // Fallback
        setBaseUrl(urlStr);
        setQueryParams([]);
      }
    },
    [setBaseUrl, setQueryParams]
  );

  // Rebuild URL string from Base URL and query params
  const rebuildUrl = useCallback(
    (base: string = baseUrl, params: QueryParamItem[] = queryParams) => {
      if (!base && params.length === 0) {
        return '';
      }

      const activeParams = params.filter((p) => p.enabled && p.key.trim());
      if (activeParams.length === 0) {
        return base;
      }

      const searchParams = new URLSearchParams();
      activeParams.forEach((p) => {
        searchParams.append(p.key, p.value);
      });

      const delimiter = base.includes('?') ? '&' : '?';
      return `${base}${delimiter}${searchParams.toString()}`;
    },
    [baseUrl, queryParams]
  );

  // Derived output for Query Params tab, or raw stored output for Encode/Decode tabs
  const output = useMemo(() => {
    if (tab === 'Query Params') {
      return rebuildUrl(baseUrl, queryParams);
    }
    return rawOutput;
  }, [tab, baseUrl, queryParams, rebuildUrl, rawOutput]);

  // Main Processing function
  const processUrl = useCallback(
    (
      currentInput: string = input,
      currentTab: TabItem = tab,
      shouldSaveHistory = true
    ) => {
      if (currentTab === 'Query Params') {
        const rebuilt = rebuildUrl();
        setOutput(rebuilt);
        if (shouldSaveHistory && (baseUrl || queryParams.length > 0)) {
          addHistory(rebuilt, {
            input: currentInput,
            output: rebuilt,
            mode: currentTab,
            baseUrl,
            params: queryParams,
          });
          toast.success('Saved to history!');
        }
        return;
      }

      if (!currentInput) {
        setOutput('');
        return;
      }

      let res = '';
      try {
        if (currentTab === 'Encode') {
          res = browserUtils.encodeURI(currentInput);
        } else if (currentTab === 'Decode') {
          res = browserUtils.decodeURI(currentInput);
        }

        setOutput(res);

        if (shouldSaveHistory) {
          addHistory(currentInput, {
            input: currentInput,
            output: res,
            mode: currentTab,
          });
        }

        toast.success(
          currentTab === 'Encode' ? 'URL Encoded!' : 'URL Decoded!'
        );
      } catch (err) {
        toast.error((err as Error).message || 'Processing Error');
      }
    },
    [addHistory, baseUrl, input, queryParams, rebuildUrl, setOutput, tab]
  );

  // Handle Input text change
  const onInputChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      const val = e.target.value;
      setInput(val);
      if (tab === 'Query Params') {
        parseUrlToParams(val);
      }
    },
    [parseUrlToParams, setInput, tab]
  );

  // Paste Action
  const onPaste = useCallback(
    (val: string) => {
      setInput(val);
      if (tab === 'Query Params') {
        parseUrlToParams(val);
      }
    },
    [parseUrlToParams, setInput, tab]
  );

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
    let sample = SAMPLE_URL_TO_ENCODE;
    if (tab === 'Decode') {
      sample = SAMPLE_URL_TO_DECODE;
    } else if (tab === 'Query Params') {
      sample = SAMPLE_URL_WITH_PARAMS;
      parseUrlToParams(sample);
    }
    setInput(sample);
  }, [parseUrlToParams, setInput, tab]);

  // Clear Input & Output
  const onClear = useCallback(() => {
    setInput('');
    setOutput('');
    setBaseUrl('');
    setQueryParams([]);
  }, [setBaseUrl, setInput, setOutput, setQueryParams]);

  // Swap Input and Output
  const onSwap = useCallback(() => {
    if (!input && !output) return;
    const oldInput = input;
    const oldOutput = output;
    setInput(oldOutput);
    setOutput(oldInput);

    if (tab === 'Encode') {
      setTab('Decode');
    } else if (tab === 'Decode') {
      setTab('Encode');
    }
    toast.success('Swapped Input and Output!');
  }, [input, output, setInput, setOutput, setTab, tab]);

  // Tab Change Handler
  const onTabChanged = useCallback(
    (newTab: string) => {
      const tabItem = newTab as TabItem;
      setTab(tabItem);

      if (tabItem === 'Query Params' && input.trim()) {
        parseUrlToParams(input);
      }
    },
    [input, parseUrlToParams, setTab]
  );

  // Handle Params Update in Query Params mode
  const handleBaseUrlChange = useCallback(
    (newBaseUrl: string) => {
      setBaseUrl(newBaseUrl);
    },
    [setBaseUrl]
  );

  const handleParamsChange = useCallback(
    (newParams: QueryParamItem[]) => {
      setQueryParams(newParams);
    },
    [setQueryParams]
  );

  // Restore from History
  const onRestoreHistory = useCallback(
    (data: UrlEncoderDecoderHistoryData) => {
      setInput(data.input || '');
      setOutput(data.output || '');
      if (data.mode) {
        setTab(data.mode);
      }
      if (data.baseUrl !== undefined) {
        setBaseUrl(data.baseUrl);
      }
      if (data.params) {
        setQueryParams(data.params);
      }
      toast.success('History restored!');
    },
    [setBaseUrl, setInput, setOutput, setQueryParams, setTab]
  );

  // Dynamic execute button label
  const executeButtonLabel = useMemo(() => {
    switch (tab) {
      case 'Encode':
        return 'Encode URL';
      case 'Decode':
        return 'Decode URL';
      case 'Query Params':
        return 'Save to History';
      default:
        return 'Process';
    }
  }, [tab]);

  // Hook hotkeys
  useToolHotkeys(
    {
      onExecute: () => processUrl(),
      onClear,
      onPaste: onGlobalPaste,
      onCopy: onCopyResult,
      onSwap,
    },
    { target: inputRef }
  );

  return {
    tab,
    input,
    output,
    baseUrl,
    queryParams,
    executeButtonLabel,
    historyList,
    isLoadingHistory,
    inputRef,
    processUrl,
    onInputChange,
    onPaste,
    onLoadSample,
    onClear,
    onSwap,
    onTabChanged,
    handleBaseUrlChange,
    handleParamsChange,
    onRestoreHistory,
    renameHistory,
    removeHistory,
    clearHistory,
  };
}
