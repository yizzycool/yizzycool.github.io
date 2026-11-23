'use client';

import { Magnet, Redo2, RotateCcw, Undo2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  TooltipPopup,
  TooltipRoot,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/utils/cn';

type CanvasHudBarProps = {
  width: number;
  height: number;
  isFreeLayout: boolean;
  snapGuidesEnabled: boolean;
  onToggleSnapGuides: (enabled: boolean) => void;
  canUndo: boolean;
  canRedo: boolean;
  canReset: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onRequestReset: () => void;
};

/**
 * Compact floating HUD displaying canvas dimensions, Snap Guides toggle,
 * and quick Undo / Redo / Reset controls.
 */
export default function CanvasHudBar({
  width,
  height,
  isFreeLayout,
  snapGuidesEnabled,
  onToggleSnapGuides,
  canUndo,
  canRedo,
  canReset,
  onUndo,
  onRedo,
  onRequestReset,
}: CanvasHudBarProps) {
  return (
    <div
      className={cn(
        'absolute left-3 top-3 z-30 flex items-center gap-1 rounded-full border px-2 py-1 shadow-sm backdrop-blur-xl',
        'border-neutral-200/80 bg-white/90 text-neutral-700',
        'dark:border-neutral-800/80 dark:bg-neutral-900/90 dark:text-neutral-300'
      )}
    >
      <span className="px-1.5 font-mono text-[11px] font-semibold">
        {width} × {height}
      </span>

      <div className="mx-0.5 h-3.5 w-px bg-neutral-200 dark:bg-neutral-700" />

      <Button
        variant="ghost"
        size="xs"
        icon={Undo2}
        iconClassName="h-3.5 w-3.5"
        disabled={!canUndo}
        onClick={onUndo}
        title="Undo (Ctrl+Z)"
        aria-label="Undo"
        className="!h-6 !min-h-6 !w-6 !min-w-6 !rounded-full !p-0"
      />
      <Button
        variant="ghost"
        size="xs"
        icon={Redo2}
        iconClassName="h-3.5 w-3.5"
        disabled={!canRedo}
        onClick={onRedo}
        title="Redo (Ctrl+Shift+Z)"
        aria-label="Redo"
        className="!h-6 !min-h-6 !w-6 !min-w-6 !rounded-full !p-0"
      />
      <Button
        variant="ghost"
        size="xs"
        icon={RotateCcw}
        iconClassName="h-3.5 w-3.5"
        disabled={!canReset}
        onClick={onRequestReset}
        title="Reset Studio"
        aria-label="Reset Studio"
        className="!h-6 !min-h-6 !w-6 !min-w-6 !rounded-full !p-0 hover:text-red-500 dark:hover:text-red-400"
      />

      {isFreeLayout && (
        <>
          <div className="mx-0.5 h-3.5 w-px bg-neutral-200 dark:bg-neutral-700" />

          <TooltipRoot delay={{ open: 150, close: 100 }}>
            <TooltipTrigger>
              <span className="inline-flex items-center px-1">
                <Switch
                  size="xs"
                  icon={Magnet}
                  label="Snap"
                  highlightIconOnChecked
                  checked={snapGuidesEnabled}
                  onChange={onToggleSnapGuides}
                  labelClassName="text-[11px]"
                />
              </span>
            </TooltipTrigger>
            <TooltipPopup
              placement="bottom"
              showArrow
              className="max-w-[235px] px-2.5 py-2 text-left text-xs leading-relaxed"
            >
              <div className="font-semibold text-white">
                Smart Alignment Guides
              </div>
              <div className="mt-0.5 text-neutral-300">
                Hold{' '}
                <span className="font-mono font-semibold text-sky-300">
                  Alt
                </span>{' '}
                (or{' '}
                <span className="font-mono font-semibold text-sky-300">
                  Option
                </span>{' '}
                on Mac) while dragging to temporarily disable snapping.
              </div>
            </TooltipPopup>
          </TooltipRoot>
        </>
      )}
    </div>
  );
}
