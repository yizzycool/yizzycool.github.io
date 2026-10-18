'use client';

import type { GzipSummary } from './types';

import { FileArchive, HardDrive, Percent } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import {
  formatFileSize,
  getFileIconConfig,
  getExtension,
} from '@/utils/file-utils';

interface GzipSummaryBarProps {
  summary: GzipSummary;
}

export default function GzipSummaryBar({ summary }: GzipSummaryBarProps) {
  const ext = getExtension(summary.fileName);
  const iconConfig = getFileIconConfig(ext, summary.isTar, false);
  const IconComponent = iconConfig.icon;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {/* 1. Target Filename */}
      <div className="backdrop-blur-xs flex flex-col gap-1 rounded-xl border border-slate-200/80 bg-white/60 p-3 text-left transition hover:border-slate-300 dark:border-neutral-800/80 dark:bg-neutral-900/60 dark:hover:border-neutral-700">
        <div className="flex items-center gap-1.5 text-slate-400 dark:text-neutral-500">
          <IconComponent className="h-3.5 w-3.5" />
          <span className="text-[11px] font-medium uppercase tracking-wider">
            Target File
          </span>
        </div>
        <div className="flex items-center gap-1.5 overflow-hidden">
          <span
            className="truncate font-mono text-sm font-semibold text-slate-800 dark:text-slate-100"
            title={summary.fileName}
          >
            {summary.fileName}
          </span>
          {summary.isTar && (
            <Badge variant="primary" size="xs" rounded="md" bordered>
              TAR
            </Badge>
          )}
        </div>
      </div>

      {/* 2. Uncompressed Size */}
      <div className="backdrop-blur-xs flex flex-col gap-1 rounded-xl border border-slate-200/80 bg-white/60 p-3 text-left transition hover:border-slate-300 dark:border-neutral-800/80 dark:bg-neutral-900/60 dark:hover:border-neutral-700">
        <div className="flex items-center gap-1.5 text-slate-400 dark:text-neutral-500">
          <HardDrive className="h-3.5 w-3.5" />
          <span className="text-[11px] font-medium uppercase tracking-wider">
            Uncompressed
          </span>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="font-mono text-base font-semibold text-slate-800 dark:text-slate-100">
            {formatFileSize(summary.originalSize)}
          </span>
        </div>
      </div>

      {/* 3. Archive Size & Compression Ratio */}
      <div className="backdrop-blur-xs col-span-2 flex flex-col gap-1 rounded-xl border border-slate-200/80 bg-white/60 p-3 text-left transition hover:border-slate-300 sm:col-span-1 dark:border-neutral-800/80 dark:bg-neutral-900/60 dark:hover:border-neutral-700">
        <div className="flex items-center gap-1.5 text-slate-400 dark:text-neutral-500">
          <Percent className="h-3.5 w-3.5" />
          <span className="text-[11px] font-medium uppercase tracking-wider">
            Archive Size
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-base font-semibold text-slate-800 dark:text-slate-100">
            {formatFileSize(summary.compressedSize)}
          </span>
          {summary.ratio > 0 ? (
            <Badge variant="success" size="xs" rounded="md" bordered>
              -{summary.ratio}%
            </Badge>
          ) : (
            <Badge variant="neutral" size="xs" rounded="md" bordered>
              <FileArchive className="mr-1 h-3 w-3" />
              {summary.algorithm.toUpperCase()}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
