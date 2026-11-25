'use client';

import type { CanvasConfig } from './types/config';

import { useRef } from 'react';
import {
  Download,
  Grid2x2,
  ImagePlus,
  Magnet,
  Redo2,
  RotateCcw,
  Sparkles,
  Undo2,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  TooltipPopup,
  TooltipRoot,
  TooltipTrigger,
} from '@/components/ui/tooltip';

type Props = {
  width: number;
  height: number;
  layout: CanvasConfig['layout'];
  snapGuidesEnabled: boolean;
  canUndo: boolean;
  canRedo: boolean;
  canReset: boolean;
  onToggleSnapGuides: (enabled: boolean) => void;
  onAddImages: (files: FileList) => void;
  onSwitchLayout: (layout: CanvasConfig['layout']) => void;
  onUndo: () => void;
  onRedo: () => void;
  onRequestReset: () => void;
  onRequestSendToPhotoEditor: () => void;
  onOpenExport: () => void;
};

/**
 * Top studio context toolbar matching Photo Editor Studio:
 * dedicated non-overlapping header row for both Mobile (< lg) and Desktop (>= lg).
 */
export default function StudioHeaderBar({
  width,
  height,
  layout,
  snapGuidesEnabled,
  canUndo,
  canRedo,
  canReset,
  onToggleSnapGuides,
  onAddImages,
  onSwitchLayout,
  onUndo,
  onRedo,
  onRequestReset,
  onRequestSendToPhotoEditor,
  onOpenExport,
}: Props) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const isFreeLayout = layout === 'free';

  return (
    <header className="flex shrink-0 flex-col border-b border-neutral-200/80 bg-white/95 backdrop-blur-md dark:border-neutral-800/80 dark:bg-neutral-900/95">
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            onAddImages(e.target.files);
          }
          e.target.value = '';
        }}
      />

      {/* Slim Mobile Studio Header (< lg) */}
      <div className="flex h-11 items-center justify-between gap-2 px-2.5 lg:hidden">
        <div className="flex min-w-0 items-center gap-1.5">
          <span className="inline-flex min-w-0 items-center gap-1.5 rounded-full border border-neutral-200/80 bg-neutral-50/90 px-2.5 py-1 font-mono text-[10px] font-semibold text-neutral-600 dark:border-neutral-800/80 dark:bg-neutral-800/70 dark:text-neutral-300">
            <span className="truncate">
              {width} × {height}
            </span>
            <span className="text-neutral-300 dark:text-neutral-600">·</span>
            <span className="font-sans uppercase tracking-wide text-sky-600 dark:text-sky-400">
              {isFreeLayout ? 'Free' : 'Grid'}
            </span>
          </span>

          {isFreeLayout && (
            <Button
              variant={snapGuidesEnabled ? 'secondary' : 'ghost'}
              size="xs"
              icon={Magnet}
              bordered={snapGuidesEnabled}
              onClick={() => onToggleSnapGuides(!snapGuidesEnabled)}
              title={
                snapGuidesEnabled
                  ? 'Smart Snap Guides: On'
                  : 'Smart Snap Guides: Off'
              }
              aria-pressed={snapGuidesEnabled}
              aria-label="Toggle Smart Snap Guides"
              className={
                snapGuidesEnabled
                  ? '!h-7 !min-h-7 !w-7 !min-w-7 border-sky-300/80 bg-sky-50/90 !p-0 text-sky-600 dark:border-sky-700/70 dark:bg-sky-950/50 dark:text-sky-400'
                  : '!h-7 !min-h-7 !w-7 !min-w-7 !p-0 text-neutral-400 dark:text-neutral-500'
              }
            />
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <Button
            variant="ghost"
            size="xs"
            icon={Undo2}
            disabled={!canUndo}
            onClick={onUndo}
            aria-label="Undo"
            className="!h-7 !min-h-7 !w-7 !min-w-7 !p-0"
          />
          <Button
            variant="ghost"
            size="xs"
            icon={Redo2}
            disabled={!canRedo}
            onClick={onRedo}
            aria-label="Redo"
            className="!h-7 !min-h-7 !w-7 !min-w-7 !p-0"
          />
          <Button
            variant="ghost"
            size="xs"
            icon={RotateCcw}
            disabled={!canReset}
            onClick={onRequestReset}
            aria-label="Reset Studio"
            className="!h-7 !min-h-7 !w-7 !min-w-7 !p-0 hover:text-red-500 dark:hover:text-red-400"
          />
          <Button
            variant="ghost"
            size="xs"
            icon={Sparkles}
            onClick={onRequestSendToPhotoEditor}
            title="Open in Photo Editor Studio (Layers, Masks & AI)"
            aria-label="Open in Photo Editor Studio"
            className="!h-7 !min-h-7 !w-7 !min-w-7 !p-0 text-sky-600 dark:text-sky-400"
          />
          <Button
            variant="primary"
            size="xs"
            icon={Download}
            onClick={onOpenExport}
            aria-label="Export"
            className="!h-7 !min-h-7 whitespace-nowrap !px-2 text-[11px]"
          >
            Export
          </Button>
        </div>
      </div>

      {/* Primary Desktop Studio Header Row (>= lg) */}
      <div className="hidden h-12 items-center justify-between gap-2 px-3 lg:flex">
        {/* Left: Upload & Quick Layout Switch */}
        <div className="flex shrink-0 items-center gap-1.5">
          <Button
            variant="secondary"
            size="xs"
            bordered
            icon={ImagePlus}
            onClick={() => imageInputRef.current?.click()}
            title="Add Photos to Canvas"
            aria-label="Add Photos"
            className="!h-7 !min-h-7 !w-7 !min-w-7 !p-0"
          />

          <div className="mx-0.5 h-4 w-px bg-neutral-200 dark:bg-neutral-700" />

          <div className="flex items-center gap-1 rounded-lg bg-neutral-100/80 p-0.5 dark:bg-neutral-800/70">
            <Button
              variant={isFreeLayout ? 'primary' : 'ghost'}
              size="xs"
              icon={Sparkles}
              onClick={() => onSwitchLayout('free')}
              title="Free Collage Mode"
              className="!h-6 !min-h-6 whitespace-nowrap !px-2 text-[11px]"
            >
              Free
            </Button>
            <Button
              variant={!isFreeLayout ? 'primary' : 'ghost'}
              size="xs"
              icon={Grid2x2}
              onClick={() => onSwitchLayout('grid')}
              title="Grid & Bento Collage Mode"
              className="!h-6 !min-h-6 whitespace-nowrap !px-2 text-[11px]"
            >
              Grid
            </Button>
          </div>
        </div>

        {/* Center: Canvas Dimension Readout */}
        <div className="flex min-w-0 flex-1 items-center justify-center">
          <span className="whitespace-nowrap font-mono text-[11px] font-semibold text-neutral-500 dark:text-neutral-400">
            {width} × {height} px
          </span>
        </div>

        {/* Right: Snap Switch, History, Reset, Pro Edit & Export */}
        <div className="flex shrink-0 items-center gap-1.5">
          {isFreeLayout && (
            <>
              <TooltipRoot delay={{ open: 150, close: 100 }}>
                <TooltipTrigger>
                  <span className="inline-flex shrink-0 items-center">
                    <Button
                      variant={snapGuidesEnabled ? 'secondary' : 'ghost'}
                      size="xs"
                      icon={Magnet}
                      bordered={snapGuidesEnabled}
                      onClick={() => onToggleSnapGuides(!snapGuidesEnabled)}
                      aria-pressed={snapGuidesEnabled}
                      aria-label="Toggle Smart Alignment Guides"
                      className={
                        snapGuidesEnabled
                          ? '!h-7 !min-h-7 !w-7 !min-w-7 border-sky-300/80 bg-sky-50/90 !p-0 text-sky-600 dark:border-sky-700/70 dark:bg-sky-950/50 dark:text-sky-400'
                          : '!h-7 !min-h-7 !w-7 !min-w-7 !p-0 text-neutral-400 dark:text-neutral-500'
                      }
                    />
                  </span>
                </TooltipTrigger>
                <TooltipPopup
                  placement="bottom"
                  className="max-w-[235px] px-2.5 py-2 text-left text-xs leading-relaxed"
                >
                  <div className="font-semibold text-slate-900 dark:text-white">
                    Smart Alignment Guides:{' '}
                    <span
                      className={
                        snapGuidesEnabled
                          ? 'text-sky-600 dark:text-sky-400'
                          : 'text-neutral-500 dark:text-neutral-400'
                      }
                    >
                      {snapGuidesEnabled ? 'On' : 'Off'}
                    </span>
                  </div>
                  <div className="mt-0.5 font-normal text-slate-600 dark:text-slate-300">
                    Hold{' '}
                    <span className="font-mono font-semibold text-sky-600 dark:text-sky-400">
                      Alt
                    </span>{' '}
                    (or{' '}
                    <span className="font-mono font-semibold text-sky-600 dark:text-sky-400">
                      Option
                    </span>{' '}
                    on Mac) while dragging to temporarily bypass snapping.
                  </div>
                </TooltipPopup>
              </TooltipRoot>

              <div className="h-4 w-px bg-neutral-200 dark:bg-neutral-700" />
            </>
          )}

          <Button
            variant="ghost"
            size="xs"
            icon={Undo2}
            disabled={!canUndo}
            onClick={onUndo}
            title="Undo (Ctrl+Z)"
            aria-label="Undo"
            className="!h-7 !min-h-7 !w-7 !min-w-7 !p-0"
          />
          <Button
            variant="ghost"
            size="xs"
            icon={Redo2}
            disabled={!canRedo}
            onClick={onRedo}
            title="Redo (Ctrl+Shift+Z)"
            aria-label="Redo"
            className="!h-7 !min-h-7 !w-7 !min-w-7 !p-0"
          />
          <Button
            variant="ghost"
            size="xs"
            icon={RotateCcw}
            disabled={!canReset}
            onClick={onRequestReset}
            title="Reset Studio Canvas"
            aria-label="Reset Studio Canvas"
            className="!h-7 !min-h-7 !w-7 !min-w-7 !p-0 hover:text-red-500 dark:hover:text-red-400"
          />

          <div className="h-4 w-px bg-neutral-200 dark:bg-neutral-700" />

          <Button
            variant="ghost"
            size="xs"
            icon={Sparkles}
            iconClassName="h-3.5 w-3.5 text-sky-500"
            onClick={onRequestSendToPhotoEditor}
            title="Open layers / collage in Photo Editor Studio (Layers, Pen & Local AI)"
            className="whitespace-nowrap font-semibold text-sky-600 dark:text-sky-400"
          >
            Pro Edit
          </Button>

          <Button
            variant="primary"
            size="xs"
            icon={Download}
            onClick={onOpenExport}
            title="Export Collage (Ctrl+S)"
            className="whitespace-nowrap"
          >
            Export
          </Button>
        </div>
      </div>
    </header>
  );
}
