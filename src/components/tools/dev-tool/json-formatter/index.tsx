'use client';

import type { ChangeEvent } from 'react';

import { useState } from 'react';
import {
  Braces,
  CodeXml,
  FileText,
  Info,
  Maximize2,
  Minimize2,
  Wand2,
} from 'lucide-react';
import { isNull, isEmpty, size } from 'lodash';

import { useToolHotkeys } from '@/hooks/tools/use-tool-hotkeys';
import HeaderBlock from '../../header-block';
import DeleteAction from '@/components/common/action-button/delete';
import Textarea from '@/components/common/textarea';
import PasteAction from '@/components/common/action-button/paste';
import CopyAction from '@/components/common/action-button/copy';
import SectionGap from '../../section-gap';
import Snackbar from '@/components/common/snackbar';
import Label from '@/components/common/label';
import HotkeyBadge from '@/components/common/hotkey-badge';
import Button from '@/components/common/button';
import BaseTabs from '@/components/common/tabs/base';

const tabItems = ['Format', 'Minify'];

export default function JsonFormatter() {
  const [tab, setTab] = useState(tabItems[0]);
  const [input, setInput] = useState<string>('');
  const [output, setOutput] = useState<string>('');
  const [error, setError] = useState(false);

  const processJson = (jsonString: string) => {
    if (!jsonString.trim()) return;
    if (tab === tabItems[0]) {
      handleFormat(jsonString);
    } else {
      handleMinify(jsonString);
    }
  };

  // Handle format
  const handleFormat = (jsonString: string) => {
    try {
      const obj = JSON.parse(jsonString);
      const formatted = JSON.stringify(obj, null, 2);
      setOutput(formatted);
    } catch (_e) {
      setError(true);
    }
  };

  // Handle minify
  const handleMinify = (jsonString: string) => {
    try {
      const obj = JSON.parse(jsonString);
      const minified = JSON.stringify(obj);
      setOutput(minified);
    } catch (_e) {
      setError(true);
    }
  };

  const onJsonStringChanged = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setError(false);
    setInput(event.target.value);
  };

  const onPaste = (value: string) => {
    setError(false);
    setInput(value as string);
  };

  const onClear = () => {
    setInput('');
    setOutput('');
    setError(false);
  };

  const onTabChanged = (newTab: string) => {
    setTab(newTab);
  };

  // Register hotkeys: Cmd/Ctrl + Enter (Format/Minify), Cmd/Ctrl + Shift + C (Copy), Esc (Clear)
  const { hotkeySymbols } = useToolHotkeys({
    onExecute: () => processJson(input),
    onClear: onClear,
  });

  return (
    <>
      <HeaderBlock />

      <SectionGap />

      {/* Tabs */}
      <BaseTabs
        tabs={tabItems}
        tabIcons={[Maximize2, Minimize2]}
        onChange={onTabChanged}
      />

      {/* Textarea block */}
      <div className="mb-3 mt-8 flex flex-col-reverse items-start justify-between gap-2 sm:flex-row sm:items-center">
        <Label htmlFor="json-string-textarea" icon={FileText}>
          Paste JSON below
        </Label>
        <div className="flex items-center gap-2 self-end sm:self-auto">
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
            {tab === 'Format' ? 'Format JSON' : 'Minify JSON'}
          </Button>
          <HotkeyBadge
            items={[
              {
                symbol: hotkeySymbols.executeSymbol,
                label: tab === 'Format' ? 'Format' : 'Minify',
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
          Result
        </Label>
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <CopyAction
            content={output}
            disabled={isNull(output) || isEmpty(output)}
          />
        </div>
      </div>
      <div className="relative">
        <Textarea id="output" value={output} rows={10} readOnly />
        {!output && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-lg font-bold text-slate-500">
            <CodeXml className="" size={40} />
            Waiting for Input...
          </div>
        )}
      </div>

      {/* Error dialog */}
      <Snackbar
        variant="error"
        open={!!error}
        icon={Info}
        onClose={() => setError(false)}
        content="Invalid JSON format"
      />
    </>
  );
}
