'use client';

import type { ReactNode } from 'react';

import { useState } from 'react';
import { Grid2x2, ImageIcon, Moon, Sun } from 'lucide-react';
import Image from 'next/image';

import { Badge } from '@/components/ui/badge';
import { Tabs } from '@/components/ui/tabs';
import { cn } from '@/utils/cn';
import imageUtils from '@/utils/image-utils';

type BackdropMode = 'checkerboard' | 'light' | 'dark';

const BACKDROP_TABS: BackdropMode[] = ['checkerboard', 'light', 'dark'];

const BACKDROP_LABELS: Record<BackdropMode, ReactNode> = {
  checkerboard: (
    <span className="flex items-center gap-1">
      <Grid2x2 className="h-3 w-3" />
      <span>Grid</span>
    </span>
  ),
  light: (
    <span className="flex items-center gap-1">
      <Sun className="h-3 w-3" />
      <span>Light</span>
    </span>
  ),
  dark: (
    <span className="flex items-center gap-1">
      <Moon className="h-3 w-3" />
      <span>Dark</span>
    </span>
  ),
};

const BACKDROP_CLASSES: Record<BackdropMode, string> = {
  checkerboard:
    'bg-[repeating-conic-gradient(#e2e8f0_0%_25%,#ffffff_0%_50%)] bg-[length:16px_16px] dark:bg-[repeating-conic-gradient(#262626_0%_25%,#171717_0%_50%)]',
  light: 'bg-white',
  dark: 'bg-neutral-950',
};

type Props = {
  imageSrc: string | null;
  alt?: string;
  width: number;
  height: number;
  originalBytes: number;
  base64Bytes: number;
  mimeType?: string;
  emptyText?: string;
};

export default function ImagePreviewStage({
  imageSrc,
  alt = 'Image asset preview',
  width,
  height,
  originalBytes,
  base64Bytes,
  mimeType,
  emptyText = 'Image preview will appear here',
}: Props) {
  const [backdrop, setBackdrop] = useState<BackdropMode>('checkerboard');

  const formatLabel = mimeType
    ? mimeType.replace(/^image\//i, '').toUpperCase()
    : 'PNG';

  const overheadPercent =
    originalBytes > 0 && base64Bytes > originalBytes
      ? (((base64Bytes - originalBytes) / originalBytes) * 100).toFixed(1)
      : null;

  return (
    <div className="space-y-3">
      {/* Canvas Stage with Backdrop Switcher */}
      <div
        className={cn(
          'relative flex h-[320px] w-full items-center justify-center overflow-hidden rounded-xl border p-6 transition-colors duration-200',
          'shadow-2xs border-neutral-200/90 dark:border-neutral-700/80',
          BACKDROP_CLASSES[backdrop]
        )}
      >
        <div className="absolute right-3 top-3 z-20">
          <Tabs<BackdropMode>
            tabs={BACKDROP_TABS}
            activeTab={backdrop}
            onChange={setBackdrop}
            tabLabels={BACKDROP_LABELS}
            variant="segment"
            size="xs"
            rounded="md"
            className="bg-white/90 p-0.5 shadow-sm backdrop-blur-md dark:bg-neutral-900/90"
            tabClassName="px-2 py-0.5 text-[11px]"
          />
        </div>

        {imageSrc ? (
          <Image
            width={0}
            height={0}
            unoptimized
            src={imageSrc}
            alt={alt}
            className="h-auto max-h-full w-auto max-w-full rounded object-contain"
          />
        ) : (
          <div className="m-auto rounded-xl bg-white/80 px-5 py-4 text-center text-sm font-medium text-slate-500 backdrop-blur-sm dark:bg-neutral-900/80 dark:text-slate-400">
            <ImageIcon className="mx-auto mb-2.5 block opacity-50" size={34} />
            <div>{emptyText}</div>
          </div>
        )}
      </div>

      {/* Telemetry & Payload Overhead Bar */}
      {imageSrc && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-neutral-200/80 bg-white/70 px-3.5 py-2.5 text-xs backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-900/50">
          <div className="flex flex-wrap items-center gap-2 font-mono text-slate-700 dark:text-slate-200">
            <Badge variant="neutral" size="xs" rounded="md">
              {width} × {height} px
            </Badge>
            <Badge variant="blue" size="xs" rounded="md">
              {formatLabel}
            </Badge>
          </div>

          <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] text-slate-500 dark:text-slate-400">
            <span>
              Original:{' '}
              <strong className="text-slate-800 dark:text-slate-200">
                {imageUtils.toHumanReadableSize(originalBytes)}
              </strong>
            </span>
            {base64Bytes > 0 && (
              <>
                <span className="text-slate-300 dark:text-neutral-700">/</span>
                <span>
                  Base64:{' '}
                  <strong className="text-slate-800 dark:text-slate-200">
                    {imageUtils.toHumanReadableSize(base64Bytes)}
                  </strong>
                </span>
              </>
            )}
            {overheadPercent && (
              <Badge variant="amber" size="xs" rounded="full">
                +{overheadPercent}% overhead
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
