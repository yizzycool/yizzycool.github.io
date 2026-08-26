'use client';

import type { ChangeEvent } from 'react';

import { useMemo, useState } from 'react';
import {
  Braces,
  CodeXml,
  FileBraces,
  FileCode,
  FileSpreadsheet,
  FileText,
  Info,
  Maximize2,
  Minimize2,
  Network,
  Wand2,
} from 'lucide-react';
import { isEmpty, size } from 'lodash';

import { useToolHotkeys } from '@/hooks/tools/use-tool-hotkeys';
import { cn } from '@/utils/cn';
import { jsonToYaml, jsonToCsv } from '@/utils/tools/json-converter';
import HeaderBlock from '../../header-block';
import DeleteAction from '@/components/common/action-button/delete';
import Textarea from '@/components/common/textarea';
import PasteAction from '@/components/common/action-button/paste';
import SectionGap from '../../section-gap';
import Snackbar from '@/components/common/snackbar';
import Label from '@/components/common/label';
import HotkeyBadge from '@/components/common/hotkey-badge';
import Button from '@/components/common/button';
import BaseTabs from '@/components/common/tabs/base';
import JsonTreeView from './json-tree-view';
import ProseMarkdown from '@/components/common/markdown/prose-markdown';

const tabItems = ['Format', 'Minify', 'Tree View', 'YAML', 'CSV'];
const tabIcons = [Maximize2, Minimize2, Network, FileCode, FileSpreadsheet];

const SAMPLE_JSON = JSON.stringify(
  {
    id: 1,
    name: 'John Doe',
    email: 'john.doe@example.com',
    isActive: true,
    age: 30,
    address: {
      street: '123 Main Street',
      city: 'New York',
      zipcode: '10001',
    },
    hobbies: ['reading', 'hiking', 'coding'],
  },
  null,
  2
);

export default function JsonFormatter() {
  const [tab, setTab] = useState(tabItems[0]);
  const [input, setInput] = useState<string>('');
  const [output, setOutput] = useState<string>('');
  const [parsedObject, setParsedObject] = useState<
    object | Array<unknown> | null
  >(null);
  const [error, setError] = useState<string | null>(null);

  const processJson = (jsonString: string, currentTab = tab) => {
    if (!jsonString.trim()) {
      setOutput('');
      setParsedObject(null);
      return;
    }

    try {
      const obj = JSON.parse(jsonString);
      setParsedObject(obj);
      setError(null);

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
    } catch (err) {
      setError((err as Error).message || 'Invalid JSON format');
      setParsedObject(null);
    }
  };

  const onJsonStringChanged = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setError(null);
    setInput(event.target.value);
  };

  const onPaste = (value: string) => {
    setError(null);
    setInput(value as string);
    processJson(value as string);
  };

  const onLoadSample = () => {
    setError(null);
    setInput(SAMPLE_JSON);
    processJson(SAMPLE_JSON);
  };

  const onClear = () => {
    setInput('');
    setOutput('');
    setParsedObject(null);
    setError(null);
  };

  const onTabChanged = (newTab: string) => {
    setTab(newTab);
    if (input.trim()) {
      processJson(input, newTab);
    }
  };

  // Language mode for syntax highlighting
  const syntaxLanguage = useMemo(() => {
    if (tab === 'YAML') return 'yaml';
    if (tab === 'CSV') return 'csv';
    return 'json';
  }, [tab]);

  // Register hotkeys: Cmd/Ctrl + Enter (Process), Esc (Clear)
  const { hotkeySymbols } = useToolHotkeys({
    onExecute: () => processJson(input),
    onClear: onClear,
  });

  return (
    <>
      <HeaderBlock />

      <SectionGap />

      {/* Tabs */}
      <BaseTabs tabs={tabItems} tabIcons={tabIcons} onChange={onTabChanged} />

      {/* Textarea block */}
      <div className="mb-3 mt-8 flex flex-col-reverse items-start justify-between gap-2 sm:flex-row sm:items-center">
        <Label htmlFor="json-string-textarea" icon={FileText}>
          Paste JSON below
        </Label>
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Button
            variant="ghost"
            size="xs"
            rounded="lg"
            icon={FileBraces}
            onClick={onLoadSample}
            className="text-xs text-sky-600 hover:text-sky-700 dark:text-sky-400"
          >
            Sample
          </Button>
          <PasteAction onClick={onPaste} />
          <DeleteAction onClick={onClear} disabled={isEmpty(input)} />
        </div>
      </div>
      <Textarea
        id="json-string-textarea"
        value={input}
        onChange={onJsonStringChanged}
        rows={10}
        placeholder="Paste your JSON string here..."
      />

      {/* Action button & Char count / Hotkey hints block */}
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="blue"
            size="sm"
            rounded="lg"
            icon={Wand2}
            disabled={isEmpty(input)}
            onClick={() => processJson(input)}
          >
            {tab === 'Format' && 'Format JSON'}
            {tab === 'Minify' && 'Minify JSON'}
            {tab === 'Tree View' && 'Build Tree View'}
            {tab === 'YAML' && 'Convert to YAML'}
            {tab === 'CSV' && 'Convert to CSV'}
          </Button>
          <HotkeyBadge
            items={[
              {
                symbol: hotkeySymbols.executeSymbol,
                label: 'Process',
              },
              { symbol: hotkeySymbols.clearSymbol, label: 'Clear' },
            ]}
          />
        </div>
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
        /* Render Syntax Highlighted Output for Format / Minify / YAML / CSV  */
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
          <CodeXml className="" size={40} />
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
