'use client';

import { Files, HardDrive, Percent } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import type { ZipSummary } from './types';
import { formatFileSize } from './utils/zip-core';

interface ZipSummaryBarProps {
  summary: ZipSummary;
}

export default function ZipSummaryBar({ summary }: ZipSummaryBarProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {/* 1. Total Files and Folders */}
      <div className="backdrop-blur-xs flex flex-col gap-1 rounded-xl border border-slate-200/80 bg-white/60 p-3 text-left transition hover:border-slate-300 dark:border-neutral-800/80 dark:bg-neutral-900/60 dark:hover:border-neutral-700">
        <div className="flex items-center gap-1.5 text-slate-400 dark:text-neutral-500">
          <Files className="h-3.5 w-3.5" />
          <span className="text-[11px] font-medium uppercase tracking-wider">
            Entries
          </span>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="font-mono text-base font-semibold text-slate-800 dark:text-slate-100">
            {summary.totalFiles}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            files ({summary.totalFolders} dirs)
          </span>
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
            {formatFileSize(summary.uncompressedSize)}
          </span>
        </div>
      </div>

      {/* 3. Archive Size & Compression Ratio */}
      <div className="backdrop-blur-xs flex flex-col gap-1 rounded-xl border border-slate-200/80 bg-white/60 p-3 text-left transition hover:border-slate-300 dark:border-neutral-800/80 dark:bg-neutral-900/60 dark:hover:border-neutral-700">
        <div className="flex items-center gap-1.5 text-slate-400 dark:text-neutral-500">
          <Percent className="h-3.5 w-3.5" />
          <span className="text-[11px] font-medium uppercase tracking-wider">
            Archive Size
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-base font-semibold text-slate-800 dark:text-slate-100">
            {formatFileSize(summary.archiveSize)}
          </span>
          {summary.ratio > 0 && (
            <Badge variant="success" size="xs" rounded="md" bordered>
              -{summary.ratio}%
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
