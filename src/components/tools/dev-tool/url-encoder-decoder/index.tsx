'use client';

import type { UrlEncoderDecoderHistoryData } from './hooks/use-url-encoder-decoder';

import { Code, Link2, Wand2, ArrowRightLeft, FileClock } from 'lucide-react';
import { isEmpty } from 'lodash';

import {
  DeleteAction,
  CopyAction,
  SwapAction,
  PasteAction,
  SampleAction,
} from '@/components/shared/action-button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Tabs } from '@/components/ui/tabs';
import { TOOL_HOTKEYS } from '@/hooks/tools/use-tool-hotkeys';
import useUrlEncoderDecoder from './hooks/use-url-encoder-decoder';
import { TAB_ITEMS, TAB_ICONS } from './constants';

import HeaderBlock from '../../common/header-block';
import SectionGap from '../../common/section-gap';
import ExecuteBar from '../../common/execute-bar';
import LabelBar from '../../common/label-bar';
import QueryParamsTable from './query-params-table';

export default function UrlEncoderDecoder() {
  const {
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
  } = useUrlEncoderDecoder();

  return (
    <>
      <HeaderBlock<UrlEncoderDecoderHistoryData>
        historyList={historyList}
        isLoadingHistory={isLoadingHistory}
        onRestoreHistory={onRestoreHistory}
        onRenameHistory={renameHistory}
        onRemoveHistory={removeHistory}
        onClearHistory={clearHistory}
        customShortcuts={[
          { ...TOOL_HOTKEYS.process, label: 'Execute' },
          { ...TOOL_HOTKEYS.swap, label: 'Swap Input & Output' },
          TOOL_HOTKEYS.paste,
          { ...TOOL_HOTKEYS.copy, label: 'Copy Result' },
          { ...TOOL_HOTKEYS.clear, label: 'Clear' },
          TOOL_HOTKEYS.help,
          TOOL_HOTKEYS.history,
        ]}
      />

      <SectionGap />

      {/* Mode Tabs */}
      <Tabs
        tabs={[...TAB_ITEMS]}
        tabIcons={[...TAB_ICONS]}
        activeTab={tab}
        onChange={onTabChanged}
        className="text-nowrap"
      />

      {/* Input Section */}
      <LabelBar
        className="mt-6"
        label={
          tab === 'Query Params'
            ? 'Deconstruct URL or Query String'
            : `URL to ${tab}`
        }
        icon={Link2}
        htmlFor="url-input-textarea"
      >
        <SampleAction onClick={onLoadSample} />
        <PasteAction onClick={onPaste} />
        <DeleteAction onClick={onClear} disabled={isEmpty(input)} />
      </LabelBar>

      <Textarea
        ref={inputRef}
        id="url-input-textarea"
        value={input}
        onChange={onInputChange}
        rows={6}
        placeholder={
          tab === 'Encode'
            ? 'Paste the URL or text you want to encode...'
            : tab === 'Decode'
              ? 'Paste the encoded URL or text you want to decode...'
              : 'Paste a full URL to break down into query parameters...'
        }
      />

      {/* Query Params Visual Editor Table (Only shown in 'Query Params' tab) */}
      {tab === 'Query Params' && (
        <div className="mt-6">
          <QueryParamsTable
            baseUrl={baseUrl}
            onBaseUrlChange={handleBaseUrlChange}
            params={queryParams}
            onParamsChange={handleParamsChange}
          />
        </div>
      )}

      {tab !== 'Query Params' && (
        <ExecuteBar
          label={executeButtonLabel}
          icon={Wand2}
          disabled={isEmpty(input)}
          onClick={() => processUrl()}
          text={input}
          hotkeyLabel="Process"
        />
      )}

      <SectionGap />

      {/* Result Section */}
      <LabelBar
        label={`Result (${tab})`}
        icon={Code}
        htmlFor="url-output-textarea"
      >
        {tab !== 'Query Params' && (
          <SwapAction
            display="icon-label"
            onClick={onSwap}
            disabled={isEmpty(input) || isEmpty(output)}
          />
        )}
        <CopyAction content={output} disabled={isEmpty(output)} />
      </LabelBar>

      {!!output ? (
        <Textarea
          id="url-output-textarea"
          value={output}
          placeholder="The processed results will be displayed here..."
          rows={6}
          readOnly
        />
      ) : (
        <Card className="flex h-48 flex-col items-center justify-center gap-4 text-xs text-slate-500 dark:text-slate-400">
          <ArrowRightLeft size={20} className="text-slate-400" />
          <span>
            Waiting for Input or click &quot;{executeButtonLabel}&quot;...
          </span>
        </Card>
      )}

      {tab === 'Query Params' && (
        <ExecuteBar
          label={executeButtonLabel}
          icon={FileClock}
          disabled={isEmpty(input)}
          onClick={() => processUrl()}
          text={input}
          hotkeyLabel="Save to History"
        />
      )}
    </>
  );
}
