'use client';

import type { ChangeEvent, RefObject } from 'react';
import type {
  BoundingBox,
  PhotoExtractSettings,
  PhotoViewMode,
  StageBackdrop,
} from './types';

import { useEffect, useRef } from 'react';
import { ImageUp, ScanLine, Sparkles, Upload } from 'lucide-react';

import { DeleteAction } from '@/components/shared/action-button';
import LabelBar from '@/components/tools/common/label-bar';
import { Button } from '@/components/ui/button';
import { FilePicker } from '@/components/ui/file-picker';
import { PillTabs } from '@/components/ui/tabs';
import { cn } from '@/utils/cn';

import {
  PHOTO_VIEW_MODES,
  PHOTO_VIEW_MODE_LABELS,
  STAGE_BACKDROPS,
  STAGE_BACKDROP_LABELS,
} from './constants';
import {
  getCroppedDimensions,
  processPhotoSignature,
} from './utils/photo-extractor';

interface Props {
  sourceCanvas: HTMLCanvasElement | null;
  fileName: string;
  settings: PhotoExtractSettings;
  viewMode: PhotoViewMode;
  processedCanvasRef: RefObject<HTMLCanvasElement | null>;
  onViewModeChange: (mode: PhotoViewMode) => void;
  onUpdateSettings: (patch: Partial<PhotoExtractSettings>) => void;
  onSelectFile: (file: File) => void;
  onLoadSample: () => void;
  onClear: () => void;
  onProcessedMeta: (meta: {
    bounds: BoundingBox | null;
    width: number;
    height: number;
  }) => void;
}

const BACKDROP_STYLES: Record<StageBackdrop, string> = {
  paper: 'bg-white text-slate-900',
  checkerboard:
    'bg-[repeating-conic-gradient(#e2e8f0_0%_25%,#ffffff_0%_50%)] bg-[length:16px_16px] dark:bg-[repeating-conic-gradient(#262626_0%_25%,#171717_0%_50%)]',
  dark: 'bg-neutral-950 text-white',
};

export default function PhotoExtractCanvas({
  sourceCanvas,
  fileName,
  settings,
  viewMode,
  processedCanvasRef,
  onViewModeChange,
  onUpdateSettings,
  onSelectFile,
  onLoadSample,
  onClear,
  onProcessedMeta,
}: Props) {
  const replaceInputRef = useRef<HTMLInputElement | null>(null);
  const originalCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const outCanvas = processedCanvasRef.current;
    if (!sourceCanvas || !outCanvas) return;

    const rafId = window.requestAnimationFrame(() => {
      const meta = processPhotoSignature(sourceCanvas, settings, outCanvas);
      onProcessedMeta(meta);
    });

    return () => window.cancelAnimationFrame(rafId);
  }, [onProcessedMeta, processedCanvasRef, settings, sourceCanvas]);

  useEffect(() => {
    const origCanvas = originalCanvasRef.current;
    if (!sourceCanvas || !origCanvas || viewMode !== 'original') return;

    const rafId = window.requestAnimationFrame(() => {
      const { sx, sy, cw, ch } = getCroppedDimensions(
        sourceCanvas.width,
        sourceCanvas.height,
        settings.crop
      );
      origCanvas.width = cw;
      origCanvas.height = ch;
      const ctx = origCanvas.getContext('2d');
      if (!ctx) return;
      ctx.clearRect(0, 0, cw, ch);
      ctx.drawImage(sourceCanvas, sx, sy, cw, ch, 0, 0, cw, ch);
    });

    return () => window.cancelAnimationFrame(rafId);
  }, [settings.crop, sourceCanvas, viewMode]);

  const handleReplaceChange = (e: ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0];
    if (picked) {
      onSelectFile(picked);
    }
    e.target.value = '';
  };

  return (
    <div className="flex flex-col">
      <input
        ref={replaceInputRef}
        type="file"
        accept="image/*"
        onChange={handleReplaceChange}
        className="hidden"
      />

      <LabelBar
        label={<span className="whitespace-nowrap">Photo Extractor</span>}
        icon={ScanLine}
        headerClassName="min-h-8 flex-wrap gap-2"
      >
        <div className="flex flex-wrap items-center gap-2">
          <PillTabs<StageBackdrop>
            tabs={STAGE_BACKDROPS}
            activeTab={settings.backdrop}
            onChange={(backdrop) => onUpdateSettings({ backdrop })}
            tabLabels={STAGE_BACKDROP_LABELS}
            variant="segment"
            size="xs"
            rounded="md"
            className="p-0.5"
            tabClassName="px-2 py-0.5"
          />

          {sourceCanvas && (
            <PillTabs<PhotoViewMode>
              tabs={PHOTO_VIEW_MODES}
              activeTab={viewMode}
              onChange={onViewModeChange}
              tabLabels={PHOTO_VIEW_MODE_LABELS}
              variant="segment"
              size="xs"
              rounded="md"
              className="p-0.5"
              tabClassName="px-2 py-0.5"
            />
          )}

          {!sourceCanvas ? (
            <Button
              variant="outline"
              size="xs"
              rounded="lg"
              icon={Sparkles}
              onClick={onLoadSample}
            >
              Try Sample Photo
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                size="xs"
                rounded="lg"
                icon={Upload}
                onClick={() => replaceInputRef.current?.click()}
              >
                Replace
              </Button>
              <DeleteAction onClick={onClear} successToast={false} />
            </>
          )}
        </div>
      </LabelBar>

      {!sourceCanvas ? (
        <FilePicker
          icon={ImageUp}
          title="Upload or Drop Signature / Stamp Photo"
          desc="Click to browse, drop an image, or press Ctrl/Cmd+V to paste — 100% local processing."
          buttonText="Choose Photo"
          accept="image/*"
          onFileChange={onSelectFile}
        />
      ) : (
        <div
          className={cn(
            'shadow-2xs relative flex min-h-[320px] w-full items-center justify-center overflow-hidden rounded-2xl border p-6 transition-colors sm:min-h-[360px] lg:min-h-[400px]',
            'border-neutral-200/90 dark:border-neutral-800',
            BACKDROP_STYLES[settings.backdrop]
          )}
        >
          <canvas
            ref={processedCanvasRef}
            className={cn(
              'max-h-[350px] max-w-full object-contain',
              viewMode === 'extracted' ? 'block' : 'hidden'
            )}
          />
          <canvas
            ref={originalCanvasRef}
            className={cn(
              'max-h-[350px] max-w-full rounded object-contain',
              viewMode === 'original' ? 'block' : 'hidden'
            )}
          />
          {fileName && (
            <span className="pointer-events-none absolute bottom-3 left-4 max-w-[70%] truncate rounded-md bg-white/85 px-2 py-0.5 font-mono text-[10px] text-slate-500 backdrop-blur-sm dark:bg-neutral-900/85 dark:text-slate-400">
              {fileName}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
