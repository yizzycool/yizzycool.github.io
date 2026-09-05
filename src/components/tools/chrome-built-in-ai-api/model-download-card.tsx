'use client';

import { MouseEventHandler } from 'react';
import { CheckCircle2, DownloadCloud, Loader2, Zap } from 'lucide-react';
import { isNull } from 'lodash';

import { Button } from '@/components/ui/button';
import { BaseDialog } from '@/components/ui/dialog';

type Props = {
  isOpen?: boolean;
  onClick?: MouseEventHandler;
  progress?: number | null;
};

export default function ModelDownloadCard({
  isOpen = true,
  onClick = () => {},
  progress = null,
}: Props) {
  const isDownloading = !isNull(progress);

  return (
    <div
      id="model-download-card-block"
      className="absolute inset-0 z-10 backdrop-blur-sm"
    >
      <BaseDialog
        isOpen={isOpen}
        hasBackdrop={false}
        className="max-w-md overflow-y-auto p-6 text-center md:p-8"
        dialogClassName="sticky top-[68px] bottom-auto w-full h-[calc(100dvh-68px)]"
        portalConfig={{
          selectorOrElement: '#model-download-card-block',
          portalKey: 'model-download-card-dialog',
        }}
      >
        {/* Icon */}
        <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-neutral-50 dark:bg-neutral-800">
          {isDownloading ? (
            <div className="relative">
              <Loader2
                size={70}
                className="animate-spin text-slate-900 dark:text-white"
              />
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold">
                {Math.round(progress * 100)}%
              </span>
            </div>
          ) : (
            <>
              <DownloadCloud
                size={40}
                className="text-slate-900 dark:text-white"
              />
              <div className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full border-4 border-white bg-amber-500 dark:border-neutral-900">
                <span className="h-1.5 w-1.5 animate-ping rounded-full bg-white" />
              </div>
            </>
          )}
        </div>

        {/* Text */}
        <h2 className="mb-3 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Model Download Required
        </h2>
        <p className="mb-8 text-sm leading-relaxed">
          Before your first use, Chrome will download AI model once. After that,
          you're all set.
        </p>

        {/* Progress Bar (Visible only when downloading) */}
        {isDownloading && (
          <div className="mb-8 w-full">
            <div className="mb-2 flex justify-between text-xs font-medium text-slate-500">
              <span>Downloading model...</span>
              <span>{Math.round(progress * 100)}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
              <div
                className="h-full bg-neutral-900 transition-all duration-300 ease-out dark:bg-white"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          <Button
            onClick={onClick}
            disabled={isDownloading}
            className="group relative w-full overflow-hidden"
          >
            {isDownloading ? 'Downloading...' : 'Download Model'}
            {!isDownloading && (
              <Zap
                size={18}
                className="ml-2 transition-colors group-hover:text-yellow-400"
                fill="currentColor"
              />
            )}
          </Button>

          <div className="mx-auto mt-4 flex w-fit flex-col justify-center gap-2 text-[11px] text-slate-400 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={12} />
              <span>Needs some storage space</span>
            </div>
            <span className="mx-1 hidden sm:block">•</span>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={12} />
              <span>Wi-Fi Recommended</span>
            </div>
          </div>
        </div>
      </BaseDialog>
    </div>
  );
}
