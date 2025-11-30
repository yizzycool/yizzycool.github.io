'use client';

import { MouseEventHandler } from 'react';
import Button from '@/components/common/button';
import { CheckCircle2, DownloadCloud, Loader2, Zap } from 'lucide-react';
import _isNull from 'lodash/isNull';

export default function ModelDownloadCard({
  onClick = () => {},
  progress = null,
}: {
  onClick?: MouseEventHandler;
  progress?: number | null;
}) {
  const isDownloading = !_isNull(progress);

  return (
    <div className="mt-16 flex h-full flex-col items-center justify-center p-6 text-center duration-500 animate-in fade-in">
      <div className="w-full max-w-md rounded-3xl border border-neutral-100 bg-white p-8 shadow-2xl shadow-neutral-200/50 dark:border-neutral-800 dark:bg-neutral-900 dark:shadow-black/50">
        {/* Icon */}
        <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-neutral-50 dark:bg-neutral-800">
          {isDownloading ? (
            <div className="relative">
              <Loader2
                size={40}
                className="animate-spin text-neutral-900 dark:text-white"
              />
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold">
                {Math.round(progress * 100)}%
              </span>
            </div>
          ) : (
            <>
              <DownloadCloud
                size={40}
                className="text-neutral-900 dark:text-white"
              />
              <div className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full border-4 border-white bg-amber-500 dark:border-neutral-900">
                <span className="h-1.5 w-1.5 animate-ping rounded-full bg-white" />
              </div>
            </>
          )}
        </div>

        {/* Text */}
        <h2 className="mb-3 text-2xl font-bold tracking-tight">
          Model Download Required
        </h2>
        <p className="mb-8 leading-relaxed text-neutral-500 dark:text-neutral-400">
          Before your first use, Chrome will download the Gemini Nano model
          once. After that, you're all set.
        </p>

        {/* Progress Bar (Visible only when downloading) */}
        {isDownloading && (
          <div className="mb-8 w-full">
            <div className="mb-2 flex justify-between text-xs font-medium text-neutral-500">
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
              />
            )}
          </Button>

          <div className="mx-auto mt-4 flex w-fit flex-col justify-center gap-2 text-[11px] text-neutral-400 sm:flex-row sm:items-center">
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
      </div>
    </div>
  );
}
