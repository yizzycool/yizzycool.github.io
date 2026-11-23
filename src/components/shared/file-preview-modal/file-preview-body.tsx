'use client';

import type { FilePreviewContentProps } from './types';

import { Download, Eye, Loader2 } from 'lucide-react';

import { ProseMarkdown } from '@/components/shared/markdown';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';
import { formatFileSize } from '@/utils/file-utils';

function buildSafeCodeFence(content: string, language: string): string {
  const matches = content.match(/`+/g);
  const longest = matches
    ? Math.max(...matches.map((match) => match.length))
    : 0;
  const fence = '`'.repeat(Math.max(3, longest + 1));
  return `${fence}${language}\n${content}\n${fence}`;
}

type Props = Pick<
  FilePreviewContentProps,
  | 'fileName'
  | 'fileSize'
  | 'isLoading'
  | 'isText'
  | 'isImage'
  | 'textContent'
  | 'imageUrl'
  | 'syntaxLanguage'
  | 'error'
  | 'onDownload'
> & {
  codeMaxHeightClassName?: string;
  imageContainerClassName?: string;
};

export function FilePreviewBody({
  fileName,
  fileSize,
  isLoading = false,
  isText = false,
  isImage = false,
  textContent = null,
  imageUrl = null,
  syntaxLanguage = 'text',
  error = null,
  onDownload,
  codeMaxHeightClassName = '[&_pre>div>div:nth-child(2)]:max-h-[520px]',
  imageContainerClassName = 'max-h-[560px] min-h-[320px]',
}: Props) {
  if (isLoading) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3 text-slate-400">
        <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
        <span className="text-xs">Decompressing file from local memory...</span>
      </div>
    );
  }

  if (error) {
    return (
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
    );
  }

  if (isImage && imageUrl) {
    return (
      <div
        className={cn(
          'flex items-center justify-center overflow-auto rounded-xl border border-slate-200/80 bg-[repeating-conic-gradient(#f1f5f9_0%_25%,transparent_0%_50%)] bg-[length:16px_16px] p-6 dark:border-neutral-800 dark:bg-[repeating-conic-gradient(#1e293b_0%_25%,transparent_0%_50%)]',
          imageContainerClassName
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={fileName}
          className="shadow-xs max-h-[480px] max-w-full rounded-lg object-contain"
        />
      </div>
    );
  }

  if (isText && textContent !== null) {
    return (
      <div className="relative">
        <ProseMarkdown
          className={cn(
            'overflow-hidden rounded-xl border border-slate-200/80 dark:border-neutral-800',
            codeMaxHeightClassName
          )}
        >
          {buildSafeCodeFence(textContent, syntaxLanguage)}
        </ProseMarkdown>
      </div>
    );
  }

  return (
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
  );
}
