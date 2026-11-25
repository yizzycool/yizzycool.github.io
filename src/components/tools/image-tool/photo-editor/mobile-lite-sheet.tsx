'use client';

import type {
  CropAspectRatio,
  CropRect,
  ImageFilterValues,
} from './types/studio';

import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Check,
  ScanFace,
  Sparkles,
  Type,
  X,
} from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Selector } from '@/components/ui/selector';
import { Slider } from '@/components/ui/slider';

import { CROP_ASPECT_OPTIONS, FILTER_PRESETS } from './constants';

export type MobileLiteDrawerId = 'crop' | 'adjust' | 'text' | 'mosaic' | null;

type Props = {
  activeDrawer: MobileLiteDrawerId;
  onClose: () => void;
  isImageSelected: boolean;
  filterValues: ImageFilterValues;
  cropAspect: CropAspectRatio;
  cropRect: CropRect | null;
  mosaicBrushSize: number;
  hasFaceDetector: boolean;
  onSetCropAspect: (aspect: CropAspectRatio) => void;
  onApplyCrop: () => void;
  onCancelCrop: () => void;
  onUpdateFilters: (
    nextValues: ImageFilterValues,
    commitLabel?: string
  ) => void;
  selectedTextAlign: 'left' | 'center' | 'right' | null;
  onUpdateTextAlign: (align: 'left' | 'center' | 'right') => void;
  onAddQuickText: (text: string) => void;
  onSetMosaicBrushSize: (size: number) => void;
  onFacePrivacyMosaic: () => void;
};

/**
 * Compact collapsible control tray for Mobile Lite (< lg), rendering only safe,
 * high-frequency tools (Crop, Filters & Basic Adjust, Quick Text, Finger/Face Mosaic).
 */
export default function MobileLiteSheet({
  activeDrawer,
  onClose,
  isImageSelected,
  filterValues,
  cropAspect,
  cropRect,
  mosaicBrushSize,
  hasFaceDetector,
  onSetCropAspect,
  onApplyCrop,
  onCancelCrop,
  onUpdateFilters,
  selectedTextAlign,
  onUpdateTextAlign,
  onAddQuickText,
  onSetMosaicBrushSize,
  onFacePrivacyMosaic,
}: Props) {
  const [captionText, setCaptionText] = useState('Quick Caption');

  if (!activeDrawer) return null;

  const togglePreset = (presetId: string) => {
    const exists = filterValues.presets.includes(presetId);
    const next = exists
      ? filterValues.presets.filter((p) => p !== presetId)
      : [...filterValues.presets, presetId];
    onUpdateFilters({ ...filterValues, presets: next }, 'Toggle Filter Preset');
  };

  return (
    <div className="shrink-0 border-t border-neutral-200/80 bg-white/95 px-3 py-2.5 backdrop-blur-md lg:hidden dark:border-neutral-800/80 dark:bg-neutral-900/95">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
          {activeDrawer === 'crop' && 'Crop & Aspect Ratio'}
          {activeDrawer === 'adjust' && 'Presets & Quick Adjust'}
          {activeDrawer === 'text' && 'Add Quick Caption'}
          {activeDrawer === 'mosaic' && 'Mosaic & Face Privacy'}
        </span>
        <Button
          variant="ghost"
          size="xs"
          icon={X}
          onClick={onClose}
          aria-label="Close panel"
          className="!h-6 !min-h-6 !w-6 !min-w-6 !p-0"
        />
      </div>

      {activeDrawer === 'crop' && (
        <div className="flex flex-wrap items-center gap-2">
          <div className="w-28">
            <Selector
              size="xs"
              options={CROP_ASPECT_OPTIONS}
              value={cropAspect}
              onChange={(v) => onSetCropAspect(v as CropAspectRatio)}
            />
          </div>
          {cropRect && (
            <span className="font-mono text-[11px] font-semibold text-neutral-600 dark:text-neutral-300">
              {cropRect.width}×{cropRect.height}
            </span>
          )}
          <div className="ml-auto flex gap-1.5">
            <Button
              variant="ghost"
              size="xs"
              icon={X}
              onClick={() => {
                onCancelCrop();
                onClose();
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="xs"
              icon={Check}
              onClick={() => {
                onApplyCrop();
                onClose();
              }}
            >
              Apply
            </Button>
          </div>
        </div>
      )}

      {activeDrawer === 'adjust' && (
        <div className="space-y-2.5">
          {!isImageSelected && (
            <p className="text-[11px] text-amber-600 dark:text-amber-400">
              Tap an image on canvas first to apply filters or adjustments.
            </p>
          )}
          <div className="no-scrollbar flex gap-1.5 overflow-x-auto pb-0.5">
            {FILTER_PRESETS.map((preset) => {
              const active = filterValues.presets.includes(preset.id);
              return (
                <Button
                  key={preset.id}
                  size="xs"
                  variant={active ? 'primary' : 'secondary'}
                  bordered={!active}
                  disabled={!isImageSelected}
                  onClick={() => togglePreset(preset.id)}
                  className="shrink-0 whitespace-nowrap"
                >
                  {preset.label}
                </Button>
              );
            })}
          </div>
          <div
            className={
              !isImageSelected
                ? 'pointer-events-none grid grid-cols-2 gap-x-3 gap-y-1 opacity-45'
                : 'grid grid-cols-2 gap-x-3 gap-y-1'
            }
          >
            <Slider
              title="Brightness"
              min={-1}
              max={1}
              step={0.02}
              value={filterValues.brightness}
              onChange={(e) =>
                onUpdateFilters({
                  ...filterValues,
                  brightness: parseFloat(e.target.value),
                })
              }
              onChangeEnd={() =>
                onUpdateFilters(filterValues, 'Adjust Brightness')
              }
            />
            <Slider
              title="Contrast"
              min={-1}
              max={1}
              step={0.02}
              value={filterValues.contrast}
              onChange={(e) =>
                onUpdateFilters({
                  ...filterValues,
                  contrast: parseFloat(e.target.value),
                })
              }
              onChangeEnd={() =>
                onUpdateFilters(filterValues, 'Adjust Contrast')
              }
            />
            <Slider
              title="Saturation"
              min={-1}
              max={1}
              step={0.02}
              value={filterValues.saturation}
              onChange={(e) =>
                onUpdateFilters({
                  ...filterValues,
                  saturation: parseFloat(e.target.value),
                })
              }
              onChangeEnd={() =>
                onUpdateFilters(filterValues, 'Adjust Saturation')
              }
            />
            <Slider
              title="Blur"
              min={0}
              max={1}
              step={0.01}
              value={filterValues.blur}
              onChange={(e) =>
                onUpdateFilters({
                  ...filterValues,
                  blur: parseFloat(e.target.value),
                })
              }
              onChangeEnd={() => onUpdateFilters(filterValues, 'Adjust Blur')}
            />
          </div>
        </div>
      )}

      {activeDrawer === 'text' && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Input
              value={captionText}
              onChange={(e) => setCaptionText(e.target.value)}
              placeholder="Enter text overlay..."
              className="flex-1 text-xs"
            />
            <Button
              variant="primary"
              size="xs"
              icon={Type}
              onClick={() => {
                onAddQuickText(captionText.trim() || 'Quick Caption');
                onClose();
              }}
              className="shrink-0 whitespace-nowrap"
            >
              Add Text
            </Button>
          </div>
          {selectedTextAlign !== null && (
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
                Selected Text Alignment
              </span>
              <div className="grid grid-cols-3 gap-1">
                <Button
                  variant={
                    selectedTextAlign === 'left' ? 'primary' : 'secondary'
                  }
                  size="xs"
                  bordered={selectedTextAlign !== 'left'}
                  icon={AlignLeft}
                  aria-label="Align Text Left"
                  onClick={() => onUpdateTextAlign('left')}
                />
                <Button
                  variant={
                    selectedTextAlign === 'center' ? 'primary' : 'secondary'
                  }
                  size="xs"
                  bordered={selectedTextAlign !== 'center'}
                  icon={AlignCenter}
                  aria-label="Align Text Center"
                  onClick={() => onUpdateTextAlign('center')}
                />
                <Button
                  variant={
                    selectedTextAlign === 'right' ? 'primary' : 'secondary'
                  }
                  size="xs"
                  bordered={selectedTextAlign !== 'right'}
                  icon={AlignRight}
                  aria-label="Align Text Right"
                  onClick={() => onUpdateTextAlign('right')}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {activeDrawer === 'mosaic' && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-300">
            <span className="shrink-0">Brush Size</span>
            <input
              type="range"
              min={10}
              max={80}
              value={mosaicBrushSize}
              onChange={(e) => onSetMosaicBrushSize(Number(e.target.value))}
              className="flex-1 accent-sky-500"
            />
            <span className="w-9 font-mono text-[11px]">
              {mosaicBrushSize}px
            </span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
              Drag finger across photo to pixelate
            </span>
            {hasFaceDetector && (
              <Button
                variant="secondary"
                size="xs"
                bordered
                icon={ScanFace}
                onClick={onFacePrivacyMosaic}
                className="shrink-0 whitespace-nowrap"
              >
                Auto Face Blur (0 MB)
              </Button>
            )}
          </div>
        </div>
      )}

      <div className="mt-2 flex items-center gap-1 text-[10px] text-neutral-400 dark:text-neutral-500">
        <Sparkles className="h-3 w-3 text-sky-500" />
        <span>
          Mobile Lite Mode enforces a 2048px safe limit to prevent browser
          crashes.
        </span>
      </div>
    </div>
  );
}
