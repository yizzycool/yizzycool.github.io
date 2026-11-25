'use client';

import { useRef, useState } from 'react';
import { ImagePlus, Maximize2, X, ZoomIn, ZoomOut } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';

type Props = {
  containerRef: React.RefObject<HTMLDivElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  viewportZoom: number;
  editingCellId: number | null;
  hasLayers: boolean;
  onChangeViewportZoom: (nextZoom: number) => void;
  onExitCellFocus: () => void;
  onDropImages: (files: FileList) => void;
};

/**
 * Central dot-grid Fabric canvas stage matching Photo Editor Studio,
 * with drag-and-drop import, empty canvas hint, cell focus chip, and bottom Zoom HUD.
 */
export default function CanvasStage({
  containerRef,
  canvasRef,
  viewportZoom,
  editingCellId,
  hasLayers,
  onChangeViewportZoom,
  onExitCellFocus,
  onDropImages,
}: Props) {
  const [isDragOver, setIsDragOver] = useState(false);
  const uploadInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer?.files;
    if (!files || files.length === 0) return;
    onDropImages(files);
  };

  return (
    <div
      ref={containerRef}
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
      {/* Centered Canvas Artboard Mount */}
      <div className="absolute inset-0 flex items-center justify-center px-4 pb-12 pt-4 lg:px-8 lg:pb-14 lg:pt-6 [&_.canvas-container]:rounded-sm [&_.canvas-container]:shadow-md [&_.canvas-container]:ring-1 [&_.canvas-container]:ring-neutral-300/70 dark:[&_.canvas-container]:ring-neutral-700/70">
        <canvas ref={canvasRef} />
      </div>

      {/* Grid Cell Focus Status Pill */}
      {editingCellId !== null && (
        <div className="pointer-events-none absolute left-1/2 top-3 z-20 -translate-x-1/2">
          <div className="pointer-events-auto flex items-center gap-1.5 whitespace-nowrap rounded-full border border-sky-400/60 bg-sky-50/95 px-3 py-1 text-[11px] font-semibold text-sky-700 shadow-sm backdrop-blur-md dark:border-sky-700/60 dark:bg-sky-950/90 dark:text-sky-300">
            <span>Cell Focus · Drag to pan, Scroll to zoom</span>
            <button
              type="button"
              onClick={onExitCellFocus}
              aria-label="Exit Cell Focus"
              className="rounded-full p-0.5 hover:bg-sky-200/70 dark:hover:bg-sky-800/70"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}

      {/* Empty Stage Helper Pill */}
      {!hasLayers && (
        <div className="pointer-events-none absolute inset-x-0 bottom-12 z-20 flex justify-center px-3 lg:bottom-14">
          <button
            type="button"
            onClick={() => uploadInputRef.current?.click()}
            className="pointer-events-auto flex items-center gap-2 rounded-full border border-neutral-200/90 bg-white/90 px-4 py-1.5 text-xs font-medium text-neutral-600 shadow-sm backdrop-blur-md transition-colors hover:border-sky-400 hover:text-sky-600 dark:border-neutral-700/90 dark:bg-neutral-900/90 dark:text-neutral-300 dark:hover:text-sky-400"
          >
            <ImagePlus className="h-3.5 w-3.5 text-sky-500" />
            <span>Drop photos here or click to upload</span>
          </button>
          <input
            ref={uploadInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                onDropImages(e.target.files);
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
            Drop images to add to your collage
          </div>
        </div>
      )}

      {/* Bottom Floating Zoom HUD (matches Photo Editor Studio) */}
      <div className="pointer-events-none absolute bottom-3 left-3 right-3 z-20 flex items-center justify-between">
        <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-neutral-200/80 bg-white/90 px-2 py-0.5 text-[11px] shadow-sm backdrop-blur-md dark:border-neutral-800/80 dark:bg-neutral-900/90">
          <Button
            variant="ghost"
            size="xs"
            icon={ZoomOut}
            onClick={() => onChangeViewportZoom(viewportZoom - 0.15)}
            title="Zoom Out (Ctrl+Scroll)"
            aria-label="Zoom Out"
            className="!h-6 !min-h-6 !w-6 !min-w-6 !rounded-full !p-0"
          />
          <button
            type="button"
            onClick={() => onChangeViewportZoom(1)}
            title="Reset Viewport Zoom to 100%"
            className="min-w-11 rounded px-1 py-0.5 font-mono font-semibold text-neutral-700 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800"
          >
            {Math.round(viewportZoom * 100)}%
          </button>
          <Button
            variant="ghost"
            size="xs"
            icon={ZoomIn}
            onClick={() => onChangeViewportZoom(viewportZoom + 0.15)}
            title="Zoom In (Ctrl+Scroll)"
            aria-label="Zoom In"
            className="!h-6 !min-h-6 !w-6 !min-w-6 !rounded-full !p-0"
          />
          <div className="mx-0.5 h-3.5 w-px bg-neutral-200 dark:bg-neutral-700" />
          <Button
            variant="ghost"
            size="xs"
            icon={Maximize2}
            onClick={() => onChangeViewportZoom(1)}
            title="Fit Canvas to Viewport"
            aria-label="Fit to Viewport"
            className="!h-6 !min-h-6 !px-1.5 text-[11px]"
          >
            Fit
          </Button>
        </div>
      </div>
    </div>
  );
}
