'use client';

import {
  ArrowLeftRight,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';

type Props = {
  hasSelection: boolean;
  onSendToPicMerge: (scope: 'canvas' | 'selected') => void;
};

/**
 * Slot A — Ultrawide (`2xl+`) collapsible companion rail reserved for non-intrusive
 * ecosystem shortcuts and zero-CLS partner placements away from canvas hit targets.
 */
export default function CompanionRail({
  hasSelection,
  onSendToPicMerge,
}: Props) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      aria-label="Studio Companion Rail"
      className="hidden shrink-0 flex-col border-l border-neutral-200/80 bg-neutral-50/90 transition-[width] duration-200 2xl:flex dark:border-neutral-800/80 dark:bg-neutral-950/70"
      style={{ width: collapsed ? 36 : 196 }}
    >
      <div className="flex h-10 items-center justify-between border-b border-neutral-200/70 px-2 dark:border-neutral-800/70">
        {!collapsed && (
          <span className="pl-1 text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            Workflows
          </span>
        )}
        <Button
          variant="ghost"
          size="xs"
          icon={collapsed ? ChevronLeft : ChevronRight}
          onClick={() => setCollapsed((prev) => !prev)}
          title={
            collapsed ? 'Expand Companion Rail' : 'Collapse Companion Rail'
          }
          aria-label="Toggle Companion Rail"
          className="!h-6 !min-h-6 !w-6 !min-w-6 !p-0"
        />
      </div>

      {!collapsed && (
        <div className="flex flex-1 flex-col justify-between gap-3 p-2.5">
          <div className="space-y-2.5">
            <div className="rounded-xl border border-neutral-200/80 bg-white/90 p-2.5 dark:border-neutral-800/80 dark:bg-neutral-900/70">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-neutral-800 dark:text-neutral-200">
                <ArrowLeftRight className="h-3.5 w-3.5 text-sky-500" />
                <span>Collage Handoff</span>
              </div>
              <p className="mt-1 text-[10px] leading-relaxed text-neutral-500 dark:text-neutral-400">
                Send your artwork or AI cutout directly into PicMerge grids.
              </p>
              <div className="mt-2 space-y-1.5">
                <Button
                  variant="secondary"
                  size="xs"
                  bordered
                  onClick={() => onSendToPicMerge('canvas')}
                  className="w-full text-[11px] font-semibold"
                >
                  Open in PicMerge
                </Button>
                {hasSelection && (
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => onSendToPicMerge('selected')}
                    className="w-full text-[10px] font-semibold text-sky-600 dark:text-sky-400"
                  >
                    Send Selected Layer
                  </Button>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-neutral-200/80 bg-white/80 p-2.5 text-[10px] text-neutral-500 dark:border-neutral-800/80 dark:bg-neutral-900/60 dark:text-neutral-400">
              <div className="font-bold text-neutral-700 dark:text-neutral-300">
                Quick Keys
              </div>
              <div className="mt-1.5 space-y-1 font-mono">
                <div className="flex justify-between">
                  <span>AI Select</span>
                  <span>M</span>
                </div>
                <div className="flex justify-between">
                  <span>AI Erase</span>
                  <span>J</span>
                </div>
                <div className="flex justify-between">
                  <span>Mosaic</span>
                  <span>G</span>
                </div>
                <div className="flex justify-between">
                  <span>Fit Canvas</span>
                  <span>Mod+0</span>
                </div>
              </div>
            </div>
          </div>

          {/* Slot A: Reserved fixed-height zero-CLS companion placement */}
          <div
            data-ad-slot="studio-companion-2xl"
            className="flex h-[240px] shrink-0 flex-col items-center justify-center rounded-xl border border-dashed border-neutral-300/80 bg-white/70 p-3 text-center dark:border-neutral-700/80 dark:bg-neutral-900/50"
          >
            <Sparkles className="h-4 w-4 text-sky-500" />
            <div className="mt-2 text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">
              100% Local &amp; Free
            </div>
            <p className="mt-1 text-[10px] leading-relaxed text-neutral-500 dark:text-neutral-400">
              WebGPU AI &amp; PSD tools run locally with zero uploads or
              watermarks.
            </p>
          </div>
        </div>
      )}
    </aside>
  );
}
