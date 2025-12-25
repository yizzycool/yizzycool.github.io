'use client';

import type { ChangeEvent } from 'react';
import { useRef, useState } from 'react';
import {
  Braces,
  CodeXml,
  FileText,
  Info,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import HeaderBlock from '../../components/header-block';
import DeleteAction from '@/components/common/action-button/delete';
import Textarea from '@/components/common/textarea';
import PasteAction from '@/components/common/action-button/paste';
import CopyAction from '@/components/common/action-button/copy';
import SectionGap from '../../components/section-gap';
import ButtonTabs from '@/components/common/button-tabs';
import Snackbar from '@/components/common/snackbar';
import Label from '@/components/common/label';
import _isNull from 'lodash/isNull';
import _isEmpty from 'lodash/isEmpty';
import _size from 'lodash/size';

const TabItems = ['Format', 'Minify'];

export default function JsonFormatter() {
  const [tab, setTab] = useState(TabItems[0]);
  const [input, setInput] = useState<string>('');
  const [output, setOutput] = useState<string>('');
  const [error, setError] = useState(false);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const processJson = (jsonString: string) => {
    if (tab === TabItems[0]) {
      handleFormat(jsonString);
    } else {
      handleMinify(jsonString);
    }
  };

  // Handle format
  const handleFormat = (jsonString: string) => {
    if (!jsonString.trim()) return;
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
    if (!jsonString.trim()) return;
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
    const jsonString = event.target.value;
    setInput(jsonString);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => processJson(jsonString), 500);
  };

  const onPaste = (value: string) => {
    setError(false);
    setInput(value as string);
    processJson(value as string);
  };

  const onClear = () => {
    setInput('');
    setOutput('');
    setError(false);
  };

  const onTabChanged = (newTab: string) => {
    setTab(newTab);
    if (newTab === TabItems[0]) {
      handleFormat(input);
    } else {
      handleMinify(input);
    }
  };

  return (
    <>
      <HeaderBlock />

      <SectionGap />

      {/* Tabs */}
      <ButtonTabs
        tabs={TabItems}
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
          <DeleteAction onClick={onClear} disabled={_isEmpty(input)} />
        </div>
      </div>
      <Textarea
        id="json-string-textarea"
        value={input}
        onChange={onJsonStringChanged}
        rows={10}
        placeholder="Paste your JSON string here..."
        autoFocus
      />
      {/* Char count block */}
      <div className="mt-3 w-full text-right text-xs text-neutral-400 dark:text-neutral-600">
        {_size(input)} chars
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
            disabled={_isNull(output) || _isEmpty(output)}
          />
        </div>
      </div>
      <div className="relative">
        <Textarea id="output" value={output} rows={10} readOnly />
        {!output && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-lg font-bold text-neutral-500">
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
