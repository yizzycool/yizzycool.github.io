'use client';

import type { HtmlEntitiesHistoryData } from './types';

import {
  CodeXml,
  Binary,
  Wand2,
  ArrowRightLeft,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
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
import { Button } from '@/components/ui/button';
import { Tabs } from '@/components/ui/tabs';
import { TOOL_HOTKEYS } from '@/hooks/tools/use-tool-hotkeys';

import HeaderBlock from '../../common/header-block';
import SectionGap from '../../common/section-gap';
import ExecuteBar from '../../common/execute-bar';
import LabelBar from '../../common/label-bar';
import FormatBar from './format-bar';
import useHtmlEntities from './hooks/use-html-entities';
import { TAB_ITEMS, TAB_ICONS } from './constants';

export default function HtmlEntities() {
  const {
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
  } = useHtmlEntities();

  return (
    <>
      <HeaderBlock<HtmlEntitiesHistoryData>
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

      {/* Scope Selector Bar (Only in Encode mode) */}
      {tab === 'Encode' && (
        <>
          <SectionGap size="xs" />
          <FormatBar scope={scope} onChangeScope={onScopeChanged} />
        </>
      )}

      {/* Input Section */}
      <LabelBar
        className="mt-6"
        label={
          tab === 'Encode' ? 'Input Text / HTML' : 'HTML Entities to Decode'
        }
        icon={Binary}
        htmlFor="html-entities-input-textarea"
      >
        <SampleAction onClick={onLoadSample} />
        <PasteAction onClick={onPaste} />
        <DeleteAction onClick={onClear} disabled={isEmpty(input)} />
      </LabelBar>

      <Textarea
        ref={inputRef}
        id="html-entities-input-textarea"
        value={input}
        onChange={onInputChange}
        rows={6}
        placeholder={
          tab === 'Encode'
            ? 'Type or paste the HTML code or text you want to encode (e.g. <script>, "quotes", symbols & emojis)...'
            : 'Paste the string containing HTML entities (e.g. &lt;div&gt;, &#60;, &#x3C;)...'
        }
      />

      <ExecuteBar
        label={executeButtonLabel}
        icon={Wand2}
        disabled={isEmpty(input)}
        onClick={() => processText()}
        text={input}
      />

      <SectionGap />

      {/* Result Section */}
      <LabelBar
        label={
          tab === 'Encode' ? 'Result (HTML Entities)' : 'Result (Decoded Text)'
        }
        icon={CodeXml}
        htmlFor="html-entities-output-textarea"
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

      {/* Double Escaping Tip Banner */}
      {doubleEscaped && tab === 'Decode' && (
        <div className="mb-3 flex items-center justify-between rounded-lg border border-amber-300/60 bg-amber-50/80 px-3.5 py-2 text-xs text-amber-800 dark:border-amber-800/60 dark:bg-amber-950/30 dark:text-amber-300">
          <div className="flex items-center gap-2">
            <AlertCircle
              size={15}
              className="shrink-0 text-amber-600 dark:text-amber-400"
            />
            <span>
              Potential double-escaping detected (e.g. nested entities like{' '}
              <code className="font-mono font-semibold">&amp;lt;</code>).
            </span>
          </div>
          <Button
            variant="ghost"
            size="xs"
            onClick={onDecodeAgain}
            className="h-7 text-amber-800 hover:bg-amber-200/50 dark:text-amber-200 dark:hover:bg-amber-900/50"
            icon={Sparkles}
          >
            Decode Again
          </Button>
        </div>
      )}

      {!!output ? (
        <Textarea
          id="html-entities-output-textarea"
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
