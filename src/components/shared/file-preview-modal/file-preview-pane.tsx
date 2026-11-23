'use client';

import type { FilePreviewPaneProps } from './types';

import { Download, Eye, Maximize2 } from 'lucide-react';

import { CopyAction } from '@/components/shared/action-button';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';
import {
  formatFileSize,
  getExtension,
  getFileIconConfig,
} from '@/utils/file-utils';

import { FilePreviewBody } from './file-preview-body';

export function FilePreviewPane({
  fileName,
  fileSize,
  filePath,
  extension,
  isLoading = false,
  isText = false,
  isImage = false,
  textContent = null,
  imageUrl = null,
  syntaxLanguage = 'text',
  error = null,
  onDownload,
  downloadButtonLabel = 'Download',
  onExpandModal,
  emptyTitle = 'No file selected',
  emptyDescription = 'Select a file from the explorer tree to preview its contents inline.',
  className,
}: FilePreviewPaneProps) {
  if (!fileName) {
    return (
      <div
        className={cn(
          'shadow-2xs flex flex-col items-center justify-center rounded-2xl border border-slate-200/90 bg-white/70 p-8 text-center backdrop-blur-md dark:border-neutral-800/80 dark:bg-neutral-900/70',
          className
        )}
      >
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-neutral-800 dark:text-neutral-500">
          <Eye className="h-6 w-6" />
        </div>
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
          {emptyTitle}
        </p>
        <p className="mt-1 max-w-xs text-xs text-slate-500 dark:text-slate-400">
          {emptyDescription}
        </p>
      </div>
    );
  }

  const ext = extension || getExtension(fileName);
  const iconConfig = getFileIconConfig(ext, false, false);
  const IconComponent = iconConfig.icon;

  return (
    <div
      className={cn(
        'shadow-2xs flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white/70 backdrop-blur-md dark:border-neutral-800/80 dark:bg-neutral-900/70',
        className
      )}
    >
      {/* Inline Pane Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 px-4 py-3 text-left dark:border-neutral-800/80">
        <div className="flex min-w-0 flex-1 items-center gap-2.5">
          <IconComponent
            className={cn('h-4 w-4 shrink-0', iconConfig.colorClass)}
          />
          <div className="min-w-0">
            <div className="truncate font-mono text-xs font-semibold text-slate-800 dark:text-slate-100">
              {fileName}
            </div>
            {filePath && filePath !== fileName && (
              <div className="truncate font-mono text-[11px] text-slate-400 dark:text-neutral-500">
                {filePath}
              </div>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <Badge variant="primary" size="xs" rounded="md" bordered>
            {formatFileSize(fileSize)}
          </Badge>
          {isText && textContent !== null && (
            <CopyAction
              size="xs"
              display="icon"
              content={textContent}
              ariaLabel="Copy file content"
            />
          )}
          {onDownload && (
            <Button
              variant="outline"
              size="xs"
              rounded="lg"
              icon={Download}
              onClick={onDownload}
            >
              {downloadButtonLabel}
            </Button>
          )}
          {onExpandModal && (
            <Button
              variant="ghost"
              size="xs"
              rounded="lg"
              icon={Maximize2}
              onClick={onExpandModal}
              title="Open fullscreen preview"
              ariaLabel="Open fullscreen preview"
              className="h-7 w-7 p-0"
            />
          )}
        </div>
      </div>

      {/* Scrollable Preview Body */}
      <div className="flex-1 overflow-y-auto p-4 text-left">
        <FilePreviewBody
          fileName={fileName}
          fileSize={fileSize}
          isLoading={isLoading}
          isText={isText}
          isImage={isImage}
          textContent={textContent}
          imageUrl={imageUrl}
          syntaxLanguage={syntaxLanguage}
          error={error}
          onDownload={onDownload}
          codeMaxHeightClassName="[&_pre>div>div:nth-child(2)]:max-h-[450px]"
          imageContainerClassName="min-h-[360px] h-full"
        />
      </div>
    </div>
  );
}
