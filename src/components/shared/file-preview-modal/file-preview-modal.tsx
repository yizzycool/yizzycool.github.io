'use client';

import type { FilePreviewModalProps } from './types';

import { Download, Eye, Loader2 } from 'lucide-react';

import { BaseDialog, DialogHeader } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProseMarkdown } from '@/components/shared/markdown';
import {
  formatFileSize,
  getFileIconConfig,
  getExtension,
} from '@/utils/file-utils';

export function FilePreviewModal({
  isOpen,
  onClose,
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
}: FilePreviewModalProps) {
  if (!fileName) return null;

  const ext = extension || getExtension(fileName);
  const iconConfig = getFileIconConfig(ext, false, false);
  const IconComponent = iconConfig.icon;

  return (
    <BaseDialog
      isOpen={isOpen}
      onClose={onClose}
      dialogClassName="flex max-h-[88vh] w-full max-w-4xl flex-col"
    >
      <DialogHeader
        icon={IconComponent}
        title={fileName}
        description={filePath || fileName}
        onClose={onClose}
        closeAriaLabel="Close file preview modal"
        className="mx-6 pt-6"
      >
        <div className="flex items-center gap-2">
          <Badge variant="primary" size="xs" rounded="md" bordered>
            {formatFileSize(fileSize)}
          </Badge>
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
        </div>
      </DialogHeader>

      {/* Main Preview Container */}
      <div className="flex-1 overflow-y-auto p-6 pt-3 text-left">
        {isLoading ? (
          <div className="flex h-64 flex-col items-center justify-center gap-3 text-slate-400">
            <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
            <span className="text-xs">
              Decompressing file from local memory...
            </span>
          </div>
        ) : error ? (
          <div className="flex h-64 flex-col items-center justify-center gap-3 text-rose-500">
            <p className="text-sm font-medium">{error}</p>
            {onDownload && (
              <Button
                variant="primary"
                size="xs"
                rounded="lg"
                icon={Download}
                onClick={onDownload}
              >
                Download Raw File Instead
              </Button>
            )}
          </div>
        ) : isImage && imageUrl ? (
          <div className="flex max-h-[560px] min-h-[320px] items-center justify-center overflow-auto rounded-xl border border-slate-200/80 bg-[repeating-conic-gradient(#f1f5f9_0%_25%,transparent_0%_50%)] bg-[length:16px_16px] p-6 dark:border-neutral-800 dark:bg-[repeating-conic-gradient(#1e293b_0%_25%,transparent_0%_50%)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={fileName}
              className="shadow-xs max-h-[500px] max-w-full rounded-lg object-contain"
            />
          </div>
        ) : isText && textContent !== null ? (
          <div className="relative">
            <ProseMarkdown className="overflow-hidden rounded-xl border border-slate-200/80 dark:border-neutral-800 [&_pre>div>div:nth-child(2)]:max-h-[520px]">
              {`\`\`\`${syntaxLanguage}\n${textContent}\n\`\`\``}
            </ProseMarkdown>
          </div>
        ) : (
          <div className="flex h-64 flex-col items-center justify-center gap-3 text-slate-400">
            <Eye className="h-10 w-10 text-slate-300 dark:text-neutral-600" />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Inline preview is not available for this binary file type.
            </p>
            {onDownload && (
              <Button
                variant="primary"
                size="xs"
                rounded="lg"
                icon={Download}
                onClick={onDownload}
              >
                Extract & Download ({formatFileSize(fileSize)})
              </Button>
            )}
          </div>
        )}
      </div>
    </BaseDialog>
  );
}
