'use client';

import { FolderArchive, RefreshCw } from 'lucide-react';

import { FilePicker } from '@/components/ui/file-picker';
import { Badge } from '@/components/ui/badge';
import { DeleteAction, SampleAction } from '@/components/shared/action-button';
import LabelBar from '@/components/tools/common/label-bar';
import { formatFileSize } from './utils/zip-core';

interface ZipDropzoneProps {
  file: File | null;
  isParsing: boolean;
  onFileSelect: (file: File) => void;
  onClear: () => void;
  onLoadSample: () => void;
}

export default function ZipDropzone({
  file,
  isParsing,
  onFileSelect,
  onClear,
  onLoadSample,
}: ZipDropzoneProps) {
  return (
    <div>
      <LabelBar
        label="ZIP Archive Input"
        description="Select or drop any .zip file. 100% processed locally in your browser memory."
        actions={
          <div className="flex items-center gap-2">
            {!file && (
              <SampleAction
                rounded="lg"
                label="Load Sample ZIP"
                onClick={onLoadSample}
              />
            )}
            {file && (
              <DeleteAction
                variant="ghost"
                bordered
                rounded="lg"
                label="Clear Archive"
                onClick={onClear}
              />
            )}
          </div>
        }
      />

      {file ? (
        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/90 bg-white/70 p-4 backdrop-blur-md transition-all sm:flex-row sm:items-center sm:justify-between dark:border-neutral-800/80 dark:bg-neutral-900/70">
          <div className="flex min-w-0 items-center gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:bg-purple-500/15 dark:text-purple-400">
              <FolderArchive className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1 text-left">
              <div className="flex items-center gap-2">
                <span className="truncate font-mono text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {file.name}
                </span>
                <Badge variant="primary" size="xs" rounded="md" bordered>
                  {formatFileSize(file.size)}
                </Badge>
              </div>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                {isParsing
                  ? 'Analyzing central directory...'
                  : 'Archive loaded and inspected in local memory'}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:self-center">
            <label className="cursor-pointer">
              <input
                type="file"
                accept=".zip,application/zip,application/x-zip-compressed"
                className="hidden"
                onChange={(e) => {
                  const selected = e.target.files?.[0];
                  if (selected) onFileSelect(selected);
                  e.target.value = '';
                }}
              />
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200/80 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-slate-200 dark:hover:bg-neutral-700">
                <RefreshCw className="h-3.5 w-3.5" />
                Change ZIP
              </span>
            </label>
          </div>
        </div>
      ) : (
        <FilePicker
          icon={FolderArchive}
          title="Drag and drop your ZIP file here"
          desc="Or click to browse from device (Supports full directory hierarchies, UTF-8 & legacy archives)"
          accept=".zip,application/zip,application/x-zip-compressed"
          onFileChange={onFileSelect}
        />
      )}
    </div>
  );
}
