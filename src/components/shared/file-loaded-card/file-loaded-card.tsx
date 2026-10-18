'use client';

import type { ChangeEvent } from 'react';
import type { FileLoadedCardProps } from './types';

import { FileArchive, RefreshCw } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/utils/cn';
import { formatFileSize } from '@/utils/file-utils';

export function FileLoadedCard({
  fileName,
  fileSize,
  description,
  icon: Icon = FileArchive,
  iconContainerClassName = 'bg-purple-500/10 text-purple-600 dark:bg-purple-500/15 dark:text-purple-400',
  iconClassName = 'h-6 w-6',
  accept,
  onChangeFile,
  changeButtonLabel = 'Change File',
  className = '',
}: FileLoadedCardProps) {
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onChangeFile) {
      onChangeFile(file);
    }
    e.target.value = '';
  };

  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-2xl border border-slate-200/90 bg-white/70 p-4 backdrop-blur-md transition-all sm:flex-row sm:items-center sm:justify-between dark:border-neutral-800/80 dark:bg-neutral-900/70',
        className
      )}
    >
      <div className="flex min-w-0 items-center gap-3.5">
        <div
          className={cn(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
            iconContainerClassName
          )}
        >
          <Icon className={iconClassName} />
        </div>
        <div className="min-w-0 flex-1 text-left">
          <div className="flex items-center gap-2">
            <span className="truncate font-mono text-sm font-semibold text-slate-800 dark:text-slate-100">
              {fileName}
            </span>
            <Badge variant="primary" size="xs" rounded="md" bordered>
              {formatFileSize(fileSize)}
            </Badge>
          </div>
          {description && (
            <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              {description}
            </div>
          )}
        </div>
      </div>

      {onChangeFile && (
        <div className="flex shrink-0 items-center gap-2 sm:self-center">
          <label className="cursor-pointer">
            <input
              type="file"
              accept={accept}
              className="hidden"
              onChange={handleFileChange}
            />
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200/80 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-slate-200 dark:hover:bg-neutral-700">
              <RefreshCw className="h-3.5 w-3.5" />
              {changeButtonLabel}
            </span>
          </label>
        </div>
      )}
    </div>
  );
}
