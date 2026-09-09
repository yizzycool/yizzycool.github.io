'use client';

import type { JsonHistoryData } from './hooks/use-json-formatter';

import { Braces, CodeXml, FileBraces, FileText, Wand2 } from 'lucide-react';
import { isEmpty } from 'lodash';

import { TOOL_HOTKEYS } from '@/hooks/tools/use-tool-hotkeys';
import useJsonFormatter from './hooks/use-json-formatter';
import { TAB_ITEMS, TAB_ICONS } from './constants';
import HeaderBlock from '../../common/header-block';
import SectionGap from '../../common/section-gap';
import ExecuteBar from '../../common/execute-bar';
import LabelBar from '../../common/label-bar';
import {
  DeleteAction,
  PasteAction,
  CopyAction,
  SampleAction,
} from '@/components/shared/action-button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Tabs } from '@/components/ui/tabs';
import { ProseMarkdown } from '@/components/shared/markdown';

import JsonTreeView from './json-tree-view';

export default function JsonFormatter() {
  const {
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
  } = useJsonFormatter();

  return (
    <>
      <HeaderBlock<JsonHistoryData>
        historyList={historyList}
        isLoadingHistory={isLoadingHistory}
        onRestoreHistory={onRestoreHistory}
        onRenameHistory={renameHistory}
        onRemoveHistory={removeHistory}
        onClearHistory={clearHistory}
        customShortcuts={[
          { ...TOOL_HOTKEYS.process, label: 'Execute' },
          TOOL_HOTKEYS.paste,
          TOOL_HOTKEYS.copy,
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

      {/* Responsive Layout:
          - Screens (< xl): Natural flow (1. Input + Execute -> 2. Result)
          - Large Desktop (xl:): 2-Column Split Dashboard (Left: Col 1-6 Input & Action, Right: Col 7-12 Sticky Output / Tree)
      */}
      <div className="mt-8 flex flex-col gap-8 xl:grid xl:grid-cols-12 xl:items-start xl:gap-8">
        {/* 1. Input Section & Action (Desktop: Col 1-6) */}
        <div className="space-y-4 text-left xl:col-span-6">
          <LabelBar
            label="Paste JSON below"
            icon={FileText}
            htmlFor="json-string-textarea"
          >
            <SampleAction icon={FileBraces} onClick={onLoadSample} />
            <PasteAction onClick={onPaste} />
            <DeleteAction onClick={onClear} disabled={isEmpty(input)} />
          </LabelBar>

          <Textarea
            ref={inputRef}
            id="json-string-textarea"
            value={input}
            onChange={onJsonStringChanged}
            rows={10}
            className="min-h-[280px] xl:h-[480px]"
            placeholder="Paste your JSON string here..."
          />

          <ExecuteBar
            label={executeButtonLabel}
            icon={Wand2}
            disabled={isEmpty(input)}
            onClick={() => processJson()}
            text={input}
            hotkeyLabel="Process"
          />
        </div>

        {/* 2. Output Section (Desktop: Col 7-12, Sticky) */}
        <div className="space-y-4 text-left xl:col-span-6">
          <LabelBar
            label={`Result ${tab !== 'Format' ? `(${tab})` : ''}`}
            icon={Braces}
            htmlFor="output"
          >
            {!!output && (
              <CopyAction content={output} disabled={isEmpty(output)} />
            )}
          </LabelBar>

          {/* Render Tree View Tab */}
          {tab === 'Tree View' && parsedObject ? (
            <JsonTreeView data={parsedObject} />
          ) : output ? (
            /* Render Syntax Highlighted Output for Format / Minify / YAML / CSV */
            <ProseMarkdown className="[&_pre>div>div:nth-child(2)]:max-h-[540px]">{`\`\`\`${syntaxLanguage}\n${output}\n\`\`\``}</ProseMarkdown>
          ) : (
            <Card className="flex h-80 flex-col items-center justify-center gap-4 text-xs text-slate-500 xl:h-[540px] dark:text-slate-400">
              <CodeXml size={28} className="text-slate-400" />
              <span>
                Waiting for Input or click &quot;{executeButtonLabel}&quot;...
              </span>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
