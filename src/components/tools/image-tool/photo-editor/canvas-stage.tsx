'use client';

import { useRef, useState } from 'react';
import {
  ImagePlus,
  LayoutTemplate,
  Maximize2,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';

import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/button';

import CanvasRulers from './canvas-rulers';
import SplitCompareOverlay from './split-compare-overlay';

type Props = {
  stageRef: React.RefObject<HTMLDivElement | null>;
  canvasElRef: React.RefObject<HTMLCanvasElement | null>;
  zoom: number;
  viewportTransform: number[];
  stageSize: { width: number; height: number };
  rulersVisible: boolean;
  guidesCount: number;
  aiBusyMessage: string | null;
  beforeSnapshotUrl: string | null;
  compareSplitPercent: number;
  cursorPos: { x: number; y: number } | null;
  hasLayers: boolean;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitToScreen: () => void;
  onZoom100: () => void;
  onStartDragGuide: (orientation: 'h' | 'v', clientCoord: number) => void;
  onClearGuides: () => void;
  onChangeCompareSplit: (nextPercent: number) => void;
  onDropFiles: (files: FileList) => void;
  onDropPesFile: (file: File) => void;
  onDropLutFile: (file: File) => void;
  onOpenTemplates?: () => void;
};

/**
 * Central infinite Fabric viewport with synchronized rulers, Before/After split compare,
 * drag-and-drop import, empty canvas prompt, and floating Zoom & Cursor HUD.
 */
export default function CanvasStage({
  stageRef,
  canvasElRef,
  zoom,
  viewportTransform,
  stageSize,
  rulersVisible,
  guidesCount,
  aiBusyMessage,
  beforeSnapshotUrl,
  compareSplitPercent,
  cursorPos,
  hasLayers,
  onZoomIn,
  onZoomOut,
  onFitToScreen,
  onZoom100,
  onStartDragGuide,
  onClearGuides,
  onChangeCompareSplit,
  onDropFiles,
  onDropPesFile,
  onDropLutFile,
  onOpenTemplates,
}: Props) {
  const [isDragOver, setIsDragOver] = useState(false);
  const uploadInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer?.files;
    if (!files || files.length === 0) return;

    const first = files[0];
    const lower = first.name.toLowerCase();
    if (lower.endsWith('.pes')) {
      onDropPesFile(first);
      return;
    }
    if (lower.endsWith('.cube')) {
      onDropLutFile(first);
      return;
    }
    onDropFiles(files);
  };

  return (
    <div
      ref={stageRef}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
      className={cn(
        'relative min-w-0 flex-1 select-none overflow-hidden',
        'bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] dark:bg-[radial-gradient(#262626_1px,transparent_1px)]',
        'bg-neutral-100/70 dark:bg-neutral-950/80'
      )}
    >
      <canvas ref={canvasElRef} className="block h-full w-full" />

      <CanvasRulers
        visible={rulersVisible}
        stageWidth={stageSize.width}
        stageHeight={stageSize.height}
        viewportTransform={viewportTransform}
        cursorPos={cursorPos}
        guidesCount={guidesCount}
        onStartDragGuide={onStartDragGuide}
        onClearGuides={onClearGuides}
      />

      <SplitCompareOverlay
        beforeDataUrl={beforeSnapshotUrl}
        splitPercent={compareSplitPercent}
        onChangeSplit={onChangeCompareSplit}
      />

      {/* Non-blocking Cached AI Execution Pill (Iron Law B) */}
      {aiBusyMessage && (
        <div className="pointer-events-none absolute left-1/2 top-7 z-30 flex -translate-x-1/2 items-center gap-2 rounded-full border border-sky-400/50 bg-white/95 px-3.5 py-1 text-xs font-semibold text-sky-700 shadow-md backdrop-blur-md dark:border-sky-700/60 dark:bg-neutral-900/95 dark:text-sky-300">
          <span className="h-2 w-2 animate-pulse rounded-full bg-sky-500" />
          <span>{aiBusyMessage}</span>
        </div>
      )}

      {/* Empty Stage Helper Hint */}
      {!hasLayers && (
        <div className="pointer-events-none absolute inset-0 flex items-end justify-center gap-2 px-3 pb-14">
          <button
            type="button"
            onClick={() => uploadInputRef.current?.click()}
            className="pointer-events-auto flex items-center gap-2 rounded-full border border-neutral-200/90 bg-white/90 px-4 py-1.5 text-xs font-medium text-neutral-600 shadow-sm backdrop-blur-md transition-colors hover:border-sky-400 hover:text-sky-600 dark:border-neutral-700/90 dark:bg-neutral-900/90 dark:text-neutral-300 dark:hover:text-sky-400"
          >
            <ImagePlus className="h-3.5 w-3.5 text-sky-500" />
            <span>Drop image, PSD, SVG, HEIC, TIFF, .pes</span>
          </button>
          {onOpenTemplates && (
            <button
              type="button"
              onClick={onOpenTemplates}
              className="pointer-events-auto flex items-center gap-1.5 rounded-full border border-neutral-200/90 bg-white/90 px-3.5 py-1.5 text-xs font-medium text-neutral-600 shadow-sm backdrop-blur-md transition-colors hover:border-sky-400 hover:text-sky-600 dark:border-neutral-700/90 dark:bg-neutral-900/90 dark:text-neutral-300 dark:hover:text-sky-400"
            >
              <LayoutTemplate className="h-3.5 w-3.5 text-sky-500" />
              <span>Templates</span>
            </button>
          )}
          <input
            ref={uploadInputRef}
            type="file"
            accept="image/*,.svg,.psd,.heic,.heif,.tif,.tiff"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                onDropFiles(e.target.files);
              }
              e.target.value = '';
            }}
          />
        </div>
      )}

      {/* Drag Overlay */}
      {isDragOver && (
        <div className="pointer-events-none absolute inset-3 z-30 flex items-center justify-center rounded-2xl border-2 border-dashed border-sky-500 bg-sky-500/10 backdrop-blur-[2px]">
          <div className="rounded-xl bg-white/95 px-4 py-2 text-xs font-semibold text-sky-600 shadow-md dark:bg-neutral-900/95 dark:text-sky-400">
            Drop images, PSD, SVG, .cube LUT, or .pes project file
          </div>
        </div>
      )}

      {/* Bottom Floating Zoom & Cursor HUD */}
      <div
        className={cn(
          'pointer-events-none absolute bottom-3 right-3 z-20 flex items-center justify-between',
          rulersVisible ? 'left-8' : 'left-3'
        )}
      >
        <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-neutral-200/80 bg-white/90 px-2 py-0.5 text-[11px] shadow-sm backdrop-blur-md dark:border-neutral-800/80 dark:bg-neutral-900/90">
          <Button
            variant="ghost"
            size="xs"
            icon={ZoomOut}
            onClick={onZoomOut}
            title="Zoom Out"
            aria-label="Zoom Out"
            className="!h-6 !min-h-6 !w-6 !min-w-6 !rounded-full !p-0"
          />
          <button
            type="button"
            onClick={onZoom100}
            title="Reset to 100% (Ctrl+1)"
            className="min-w-12 rounded px-1 py-0.5 font-mono font-semibold text-neutral-700 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800"
          >
            {Math.round(zoom * 100)}%
          </button>
          <Button
            variant="ghost"
            size="xs"
            icon={ZoomIn}
            onClick={onZoomIn}
            title="Zoom In"
            aria-label="Zoom In"
            className="!h-6 !min-h-6 !w-6 !min-w-6 !rounded-full !p-0"
          />
          <div className="mx-0.5 h-3.5 w-px bg-neutral-200 dark:bg-neutral-700" />
          <Button
            variant="ghost"
            size="xs"
            icon={Maximize2}
            onClick={onFitToScreen}
            title="Fit Artboard (Ctrl+0)"
            aria-label="Fit to Screen"
            className="!h-6 !min-h-6 !px-1.5 text-[11px]"
          >
            Fit
          </Button>
        </div>

        {cursorPos && (
          <div className="rounded-full border border-neutral-200/80 bg-white/85 px-2.5 py-1 font-mono text-[10px] font-medium text-neutral-500 backdrop-blur-md dark:border-neutral-800/80 dark:bg-neutral-900/85 dark:text-neutral-400">
            X: {cursorPos.x} · Y: {cursorPos.y}
          </div>
        )}
      </div>
    </div>
  );
}
