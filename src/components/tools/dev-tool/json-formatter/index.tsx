'use client';

import {
  Braces,
  CodeXml,
  FileBraces,
  FileText,
  Info,
  Wand2,
} from 'lucide-react';
import { isEmpty, size } from 'lodash';
import { useRef } from 'react';

import useToolHotkeys from '@/hooks/tools/use-tool-hotkeys';
import useJsonFormatter from './hooks/use-json-formatter';
import { TAB_ITEMS, TAB_ICONS } from './constants';
import { cn } from '@/utils/cn';
import HeaderBlock from '../../common/header-block';
import SectionGap from '../../common/section-gap';
import DeleteAction from '@/components/common/action-button/delete';
import Textarea from '@/components/common/textarea';
import PasteAction from '@/components/common/action-button/paste';
import Snackbar from '@/components/common/snackbar';
import Label from '@/components/common/label';
import Button from '@/components/common/button';
import BaseTabs from '@/components/common/tabs/base';
import ProseMarkdown from '@/components/common/markdown/prose-markdown';
import JsonTreeView from './json-tree-view';

export default function JsonFormatter() {
  const inputRef = useRef<HTMLElement>(null);

  const {
    tab,
    input,
    output,
    parsedObject,
    error,
    setError,
    syntaxLanguage,
    executeButtonLabel,
    historyList,
    isLoadingHistory,
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

  useToolHotkeys(
    {
      onExecute: () => processJson(),
      onClear,
    },
    { target: inputRef }
  );

  return (
    <>
      <HeaderBlock
        historyList={historyList}
        isLoadingHistory={isLoadingHistory}
        onRestoreHistory={onRestoreHistory}
        onRenameHistory={renameHistory}
        onRemoveHistory={removeHistory}
        onClearHistory={clearHistory}
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
      <div className="mb-3 mt-8 flex flex-col-reverse items-start justify-between gap-2 sm:flex-row sm:items-center">
        <Label htmlFor="json-string-textarea" icon={FileText}>
          Paste JSON below
        </Label>
        <div className="flex items-center gap-2 self-end sm:self-auto">
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
        </div>
      </div>
      <Textarea
        ref={inputRef}
        id="json-string-textarea"
        value={input}
        onChange={onJsonStringChanged}
        rows={10}
        placeholder="Paste your JSON string here..."
      />

      <div
        className={cn(
          'mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'
        )}
      >
        <Button
          variant="blue"
          size="sm"
          rounded="lg"
          icon={Wand2}
          disabled={isEmpty(input)}
          onClick={() => processJson()}
        >
          {executeButtonLabel}
        </Button>
        <div className="text-right text-xs text-slate-400 dark:text-slate-500">
          {size(input)} chars
        </div>
      </div>

      <SectionGap />

      {/* Result block */}
      <div className="mb-3 flex w-full flex-col-reverse items-start justify-between gap-2 sm:flex-row sm:items-center">
        <Label htmlFor="output" icon={Braces}>
          Result {tab !== 'Format' && `(${tab})`}
        </Label>
      </div>

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
    </>
  );
}
