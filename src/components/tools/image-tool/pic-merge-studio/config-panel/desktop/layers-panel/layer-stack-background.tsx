'use client';

import type { CanvasBackground, CanvasSize } from '../../../types/config';

import { Eye, Palette } from 'lucide-react';

import { cn } from '@/utils/cn';

type LayerStackBackgroundProps = {
  canvasSize: CanvasSize;
  canvasBackground: CanvasBackground;
  isActive: boolean;
  onSelect: () => void;
};

export function LayerStackBackground({
  canvasSize,
  canvasBackground,
  isActive,
  onSelect,
}: LayerStackBackgroundProps) {
  const bgColor = canvasBackground.color?.color || '#ffffff';
  const bgOpacity = canvasBackground.color?.opacity ?? 1;

  return (
    <div
      onClick={onSelect}
      className={cn(
        'group relative flex cursor-pointer select-none items-center gap-2.5 rounded-xl border px-2.5 py-2 text-xs transition-all duration-150',
        isActive
          ? 'border-sky-500/60 bg-sky-500/10 font-semibold text-sky-700 shadow-sm dark:bg-sky-500/20 dark:text-sky-300'
          : 'border-transparent bg-neutral-50/50 text-neutral-700 hover:border-neutral-200 hover:bg-neutral-100/80 dark:bg-neutral-900/40 dark:text-neutral-300 dark:hover:border-neutral-800 dark:hover:bg-neutral-800/60'
      )}
    >
      {/* Fixed Eye (Background cannot be hidden) */}
      <div className="flex h-6 w-6 shrink-0 items-center justify-center text-neutral-400 dark:text-neutral-500">
        <Eye className="h-3.5 w-3.5" />
      </div>

      {/* Color Swatch */}
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-neutral-200/80 shadow-inner dark:border-neutral-700/80"
        style={{
          backgroundColor: bgColor,
          opacity: bgOpacity,
        }}
      >
        <Palette className="h-3.5 w-3.5 opacity-30" />
      </div>

      {/* Title */}
      <div className="min-w-0 flex-1">
        <div className="truncate font-medium leading-none">Background</div>
        <div className="mt-1 text-[10px] text-neutral-400 dark:text-neutral-500">
          {canvasSize.width} × {canvasSize.height} px
        </div>
      </div>
    </div>
  );
}
