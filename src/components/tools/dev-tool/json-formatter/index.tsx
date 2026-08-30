'use client';

import type { JsonHistoryData } from './hooks/use-json-formatter';

import {
  Braces,
  CodeXml,
  FileBraces,
  FileText,
  Info,
  Wand2,
} from 'lucide-react';
import { isEmpty } from 'lodash';

import { TOOL_HOTKEYS } from '@/hooks/tools/use-tool-hotkeys';
import useJsonFormatter from './hooks/use-json-formatter';
import { TAB_ITEMS, TAB_ICONS } from './constants';
import { cn } from '@/utils/cn';
import HeaderBlock from '../../common/header-block';
import SectionGap from '../../common/section-gap';
import ExecuteBar from '../../common/execute-bar';
import LabelBar from '../../common/label-bar';
import DeleteAction from '@/components/common/action-button/delete';
import Textarea from '@/components/common/textarea';
import PasteAction from '@/components/common/action-button/paste';
import Snackbar from '@/components/common/snackbar';
import Button from '@/components/common/button';
import BaseTabs from '@/components/common/tabs/base';
import ProseMarkdown from '@/components/common/markdown/prose-markdown';
import JsonTreeView from './json-tree-view';

export default function JsonFormatter() {
  const {
    tab,
    input,
    output,
    parsedObject,
    success,
    setSuccess,
    error,
    setError,
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

      {/* Tabs */}
      <BaseTabs
        tabs={[...TAB_ITEMS]}
        tabIcons={[...TAB_ICONS]}
        onChange={onTabChanged}
        className="text-nowrap"
      />

      {/* Textarea block */}
      <LabelBar
        className="mt-8"
        label="Paste JSON below"
        icon={FileText}
        htmlFor="json-string-textarea"
      >
        <Button
          variant="ghost-sky"
          size="xs"
          rounded="lg"
          icon={FileBraces}
          onClick={onLoadSample}
        >
          Sample
        </Button>
        <PasteAction onClick={onPaste} />
        <DeleteAction onClick={onClear} disabled={isEmpty(input)} />
      </LabelBar>
      <Textarea
        ref={inputRef}
        id="json-string-textarea"
        value={input}
        onChange={onJsonStringChanged}
        rows={10}
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

      <SectionGap />

      {/* Result block */}
      <LabelBar
        label={`Result ${tab !== 'Format' ? `(${tab})` : ''}`}
        icon={Braces}
        htmlFor="output"
      />

      {/* Render Tree View Tab */}
      {tab === 'Tree View' && parsedObject ? (
        <JsonTreeView data={parsedObject} />
      ) : output ? (
        /* Render Syntax Highlighted Output for Format / Minify / YAML / CSV */
        <ProseMarkdown className="[&_pre>div>div:nth-child(2)]:max-h-[500px]">{`\`\`\`${syntaxLanguage}\n${output}\n\`\`\``}</ProseMarkdown>
      ) : null}

      {!output && !parsedObject && (
        <div
          className={cn(
            'flex h-80 flex-col items-center justify-center gap-2 rounded-lg border',
            'border-neutral-200 dark:border-neutral-700',
            'bg-white/40 dark:bg-neutral-900/40',
            'text-slate-700 dark:text-slate-200'
          )}
        >
          <CodeXml size={40} />
          Waiting for Input...
        </div>
      )}

      {/* Error dialog */}
      <Snackbar
        variant="error"
        open={!!error}
        icon={Info}
        onClose={() => setError(null)}
        content={error || 'Invalid JSON format'}
      />

      {/* Success dialog */}
      <Snackbar
        variant="success"
        open={!!success}
        icon={Info}
        onClose={() => setSuccess(null)}
        content={success || ''}
      />
    </>
  );
}
