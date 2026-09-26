'use client';

import type { ChangeEvent, RefObject } from 'react';
import type { FileMetadata, HashInputMode } from './types';

import { FileText, FileUp, Trash2 } from 'lucide-react';

import {
  DeleteAction,
  PasteAction,
  SampleAction,
} from '@/components/shared/action-button';
import LabelBar from '@/components/tools/common/label-bar';
import { Button } from '@/components/ui/button';
import { FilePicker } from '@/components/ui/file-picker';
import { PillTabs } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

import { HASH_INPUT_MODE_LABELS, HASH_INPUT_MODES } from './constants';
import { formatFileSize } from './utils/formatters';

type Props = {
  inputMode: HashInputMode;
  setInputMode: (mode: HashInputMode) => void;
  textInput: string;
  setTextInput: (text: string) => void;
  file: File | null;
  setFile: (file: File | null) => void;
  fileMeta: FileMetadata | null;
  textStats: {
    charCount: number;
    byteCount: number;
    lineCount: number;
  };
  inputRef?: RefObject<HTMLTextAreaElement | null>;
  onClear: () => void;
  onPaste: (text: string) => void;
  onResetSample: () => void;
};

export default function HashInputSection({
  inputMode,
  setInputMode,
  textInput,
  setTextInput,
  file: _file,
  setFile,
  fileMeta,
  textStats,
  inputRef,
  onClear,
  onPaste,
  onResetSample,
}: Props) {
  const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setTextInput(e.target.value);
  };

  const handleFileChange = (newFile: File) => {
    setFile(newFile);
  };

  return (
    <div className="w-full text-left">
      <LabelBar
        label={
          <div className="flex items-center gap-3">
            <span>
              {inputMode === 'text' ? 'Payload to Hash' : 'File to Hash'}
            </span>
            <PillTabs
              tabs={HASH_INPUT_MODES}
              activeTab={inputMode}
              onChange={setInputMode}
              tabLabels={HASH_INPUT_MODE_LABELS}
              variant="segment"
              size="xs"
              rounded="md"
            />
          </div>
        }
        icon={inputMode === 'text' ? FileText : FileUp}
        htmlFor="hash-text-input"
      >
        {inputMode === 'text' && (
          <>
            <SampleAction onClick={onResetSample} />
            <PasteAction onClick={onPaste} />
            <DeleteAction onClick={onClear} disabled={!textInput} />
          </>
        )}
      </LabelBar>

      {inputMode === 'text' ? (
        <div>
          <Textarea
            ref={inputRef}
            id="hash-text-input"
            value={textInput}
            onChange={handleTextChange}
            rows={6}
            placeholder="Type or paste text here to compute hashes in real-time..."
            className="font-mono text-sm leading-relaxed"
          />

          <div className="mt-2.5 flex items-center justify-end text-xs text-slate-400 dark:text-neutral-500">
            {textStats.charCount} chars
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <FilePicker
            title="Drag & drop any file here"
            desc="or click to browse from your device (computed 100% locally in browser memory)"
            accept="*/*"
            icon={FileUp}
            buttonText="Choose Local File"
            onFileChange={handleFileChange}
          />

          {fileMeta && (
            <div className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-slate-50/70 p-3.5 dark:border-neutral-800 dark:bg-neutral-900/60">
              <div className="min-w-0 flex-1 space-y-0.5">
                <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {fileMeta.name}
                </p>
                <p className="text-xs text-slate-500 dark:text-neutral-400">
                  Size: <strong>{formatFileSize(fileMeta.size)}</strong> &bull;
                  MIME: {fileMeta.type}
                </p>
              </div>

              <Button
                variant="ghost"
                size="xs"
                rounded="lg"
                icon={Trash2}
                onClick={onClear}
                title="Remove selected file"
                className="text-rose-500 hover:bg-rose-500/10 hover:text-rose-600 dark:text-rose-400"
              >
                Clear File
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
