'use client';

import type { DocumentConfig } from './types/studio';

import { useRef } from 'react';
import {
  ArrowLeftRight,
  ChevronDown,
  Download,
  Eye,
  EyeOff,
  FolderOpen,
  ImagePlus,
  LayoutTemplate,
  Magnet,
  Redo2,
  RotateCcw,
  Ruler,
  Save,
  Undo2,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  TooltipPopup,
  TooltipRoot,
  TooltipTrigger,
} from '@/components/ui/tooltip';

type Props = {
  docConfig: DocumentConfig;
  snapGuidesEnabled: boolean;
  rulersVisible: boolean;
  isComparingOriginal: boolean;
  canUndo: boolean;
  canRedo: boolean;
  canReset: boolean;
  onToggleSnapGuides: (enabled: boolean) => void;
  onToggleRulers: () => void;
  onAddImages: (files: FileList) => void;
  onOpenProjectFile: (file: File) => void;
  onOpenTemplates: () => void;
  onSendToPicMerge: () => void;
  onSavePes: () => void;
  onOpenExport: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onToggleCompare: () => void;
  onRequestReset: () => void;
  onOpenMobileCanvas?: () => void;
};

/**
 * Fixed single-row top studio bar with file/project actions, document readout,
 * Undo/Redo, Before/After filter comparison, and Snap Guides switch.
 */
export default function StudioHeaderBar({
  docConfig,
  snapGuidesEnabled,
  rulersVisible,
  isComparingOriginal,
  canUndo,
  canRedo,
  canReset,
  onToggleSnapGuides,
  onToggleRulers,
  onAddImages,
  onOpenProjectFile,
  onOpenTemplates,
  onSendToPicMerge,
  onSavePes,
  onOpenExport,
  onUndo,
  onRedo,
  onToggleCompare,
  onRequestReset,
  onOpenMobileCanvas,
}: Props) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const projectInputRef = useRef<HTMLInputElement>(null);

  return (
    <header className="flex shrink-0 flex-col border-b border-neutral-200/80 bg-white/95 backdrop-blur-md dark:border-neutral-800/80 dark:bg-neutral-900/95">
      {/* Slim Mobile Lite Header (< lg) */}
      <div className="flex h-11 items-center justify-between gap-1.5 px-2 lg:hidden">
        <button
          type="button"
          onClick={onOpenMobileCanvas}
          title="Canvas Size & Background"
          aria-label="Canvas Size and Background"
          className="inline-flex min-w-0 items-center gap-1 rounded-lg border border-neutral-200/90 bg-neutral-100/80 px-2 py-1 font-mono text-[11px] font-semibold text-neutral-700 transition-colors hover:border-sky-300 hover:text-sky-600 dark:border-neutral-700/80 dark:bg-neutral-800/80 dark:text-neutral-200 dark:hover:border-sky-700 dark:hover:text-sky-400"
        >
          <span className="truncate">
            {docConfig.width}×{docConfig.height}
          </span>
          <ChevronDown className="h-3 w-3 shrink-0 opacity-70" />
        </button>

        <div className="flex shrink-0 items-center gap-0.5">
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
            variant={isComparingOriginal ? 'amber' : 'ghost'}
            size="xs"
            icon={isComparingOriginal ? EyeOff : Eye}
            onClick={onToggleCompare}
            title="Compare Original vs. Filtered"
            aria-label="Compare Original"
            className="!h-7 !min-h-7 !w-7 !min-w-7 !p-0"
          />
          <Button
            variant="ghost"
            size="xs"
            icon={RotateCcw}
            disabled={!canReset}
            onClick={onRequestReset}
            title="Reset Document"
            aria-label="Reset Document"
            className="!h-7 !min-h-7 !w-7 !min-w-7 !p-0 hover:text-red-500 dark:hover:text-red-400"
          />
          <Button
            variant="ghost"
            size="xs"
            icon={ArrowLeftRight}
            onClick={onSendToPicMerge}
            title="Send to PicMerge Collage"
            aria-label="Send to PicMerge"
            className="!h-7 !min-h-7 !w-7 !min-w-7 !p-0 text-sky-600 dark:text-sky-400"
          />
          <Button
            variant="primary"
            size="xs"
            icon={Download}
            onClick={onOpenExport}
            aria-label="Export"
            className="ml-0.5 !h-7 !min-h-7 whitespace-nowrap !px-2 text-[11px]"
          >
            Export
          </Button>
        </div>
      </div>

      {/* Primary Desktop Studio Header Row (>= lg) */}
      <div className="hidden h-12 items-center justify-between gap-2 px-3 lg:flex">
        {/* Left: File & Project Operations */}
        <div className="flex shrink-0 items-center gap-1.5">
          <Button
            variant="secondary"
            size="xs"
            bordered
            icon={ImagePlus}
            onClick={() => imageInputRef.current?.click()}
            title="Add Layer (Image, SVG, HEIC, TIFF, or PSD)"
            aria-label="Add Layer"
            className="!h-7 !min-h-7 !w-7 !min-w-7 !p-0"
          />
          <Button
            variant="ghost"
            size="xs"
            icon={LayoutTemplate}
            onClick={onOpenTemplates}
            title="Starter Templates"
            aria-label="Starter Templates"
            className="!h-7 !min-h-7 !w-7 !min-w-7 !p-0"
          />
          <Button
            variant="ghost"
            size="xs"
            icon={FolderOpen}
            onClick={() => projectInputRef.current?.click()}
            title="Open .pes Archive or Photoshop .psd"
            aria-label="Open Project"
            className="!h-7 !min-h-7 !w-7 !min-w-7 !p-0"
          />
          <Button
            variant="ghost"
            size="xs"
            icon={Save}
            onClick={onSavePes}
            title="Save Portable .pes Project"
            aria-label="Save Project"
            className="!h-7 !min-h-7 !w-7 !min-w-7 !p-0"
          />

          <input
            ref={imageInputRef}
            type="file"
            accept="image/*,.svg,.heic,.heif,.tif,.tiff,.psd"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                onAddImages(e.target.files);
              }
              e.target.value = '';
            }}
          />
          <input
            ref={projectInputRef}
            type="file"
            accept=".pes,.psd,application/zip"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onOpenProjectFile(file);
              e.target.value = '';
            }}
          />
        </div>

        {/* Center: Document Dimension Readout */}
        <div className="flex min-w-0 flex-1 items-center justify-center">
          <span className="whitespace-nowrap font-mono text-[11px] font-semibold text-neutral-500 dark:text-neutral-400">
            {docConfig.width} × {docConfig.height} px
          </span>
        </div>

        {/* Right: Undo/Redo, Snap Switch, Compare, Reset & Export */}
        <div className="flex shrink-0 items-center gap-1.5">
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

          <Button
            variant={rulersVisible ? 'secondary' : 'ghost'}
            size="xs"
            icon={Ruler}
            bordered={rulersVisible}
            onClick={onToggleRulers}
            title="Toggle Rulers (Shift+R)"
            aria-label="Toggle Rulers"
            className="!h-7 !min-h-7 !w-7 !min-w-7 !p-0"
          />

          <div className="h-4 w-px bg-neutral-200 dark:bg-neutral-700" />

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
            variant={isComparingOriginal ? 'amber' : 'ghost'}
            size="xs"
            icon={isComparingOriginal ? EyeOff : Eye}
            onClick={onToggleCompare}
            title="Compare Original vs. Filtered"
            aria-label="Compare Original vs. Filtered"
            className="!h-7 !min-h-7 !w-7 !min-w-7 !p-0"
          />

          <Button
            variant="ghost"
            size="xs"
            icon={RotateCcw}
            disabled={!canReset}
            onClick={onRequestReset}
            title="Reset Document"
            aria-label="Reset Document"
            className="!h-7 !min-h-7 !w-7 !min-w-7 !p-0 hover:text-red-500 dark:hover:text-red-400"
          />

          <Button
            variant="ghost"
            size="xs"
            icon={ArrowLeftRight}
            onClick={onSendToPicMerge}
            title="Send Artwork to PicMerge Studio Collage"
            className="whitespace-nowrap"
          >
            PicMerge
          </Button>

          <Button
            variant="primary"
            size="xs"
            icon={Download}
            onClick={onOpenExport}
            title="Export Image / GIF / SVG / PSD / .pes (Ctrl+S)"
            className="whitespace-nowrap"
          >
            Export
          </Button>
        </div>
      </div>
    </header>
  );
}
