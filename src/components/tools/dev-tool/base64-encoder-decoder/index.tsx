'use client';

import type { Base64EncoderDecoderHistoryData } from './types';

import { Code, Binary, Wand2, ArrowRightLeft } from 'lucide-react';
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
import useBase64EncoderDecoder from './hooks/use-base64-encoder-decoder';
import { TAB_ITEMS, TAB_ICONS } from './constants';

import HeaderBlock from '../../common/header-block';
import SectionGap from '../../common/section-gap';
import ExecuteBar from '../../common/execute-bar';
import LabelBar from '../../common/label-bar';
import FormatBar from './format-bar';

export default function Base64EncoderDecoder() {
  const {
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
  } = useBase64EncoderDecoder();

  return (
    <>
      <HeaderBlock<Base64EncoderDecoderHistoryData>
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

      <SectionGap size="xs" />

      {/* Format Selector Bar with Base64 vs Base64URL InfoTooltip */}
      <FormatBar format={format} onChangeFormat={onFormatChanged} />

      {/* Input Section */}
      <LabelBar
        className="mt-6"
        label={
          tab === 'Encode' ? 'Text to Encode' : 'Base64 / Base64URL to Decode'
        }
        icon={Binary}
        htmlFor="base64-input-textarea"
      >
        <SampleAction onClick={onLoadSample} />
        <PasteAction onClick={onPaste} />
        <DeleteAction onClick={onClear} disabled={isEmpty(input)} />
      </LabelBar>

      <Textarea
        ref={inputRef}
        id="base64-input-textarea"
        value={input}
        onChange={onInputChange}
        rows={6}
        errorMessage={error}
        placeholder={
          tab === 'Encode'
            ? 'Type or paste the text you want to encode (supports full UTF-8, Chinese, Emoji)...'
            : 'Paste the Base64 or Base64URL string you want to decode...'
        }
      />

      <ExecuteBar
        label={executeButtonLabel}
        icon={Wand2}
        disabled={isEmpty(input)}
        onClick={() => processText()}
        text={input}
        hotkeyLabel="Process"
      />

      <SectionGap />

      {/* Result Section */}
      <LabelBar
        label={`Result (${tab} as ${format === 'base64url' ? 'Base64URL' : 'Standard Base64'})`}
        icon={Code}
        htmlFor="base64-output-textarea"
      >
        <SwapAction
          display="icon-label"
          onClick={onSwap}
          disabled={isEmpty(input) || isEmpty(output)}
        />
        <CopyAction
          content={output}
          disabled={isEmpty(output)}
          successToast="Output copied to clipboard"
        />
      </LabelBar>

      {!!output ? (
        <Textarea
          id="base64-output-textarea"
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
    </>
  );
}
