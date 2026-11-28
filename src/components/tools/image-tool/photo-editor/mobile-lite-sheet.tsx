'use client';

import type {
  AlignmentEdge,
  BlendMode,
  ClipShapeKind,
  CropAspectRatio,
  CropRect,
  DocumentConfig,
  ImageFilterValues,
  LayerOrderAction,
  LayerSummary,
  SelectedObjectProps,
} from './types/studio';

import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ArrowDown,
  ArrowUp,
  Check,
  CopyPlus,
  Crop,
  Expand,
  Eye,
  EyeOff,
  FlipHorizontal,
  FlipVertical,
  Image as ImageIcon,
  Layers,
  Paintbrush,
  RefreshCw,
  RotateCcw,
  RotateCw,
  Scan,
  ScanFace,
  Shapes,
  Trash2,
  Type,
  X,
} from 'lucide-react';
import { useRef, useState } from 'react';
import { clamp } from 'lodash';

import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/button';
import { ColorPicker } from '@/components/ui/color-picker';
import { Input } from '@/components/ui/input';
import { Selector } from '@/components/ui/selector';
import { Slider } from '@/components/ui/slider';

import {
  BLEND_MODE_OPTIONS,
  CANVAS_SIZE_PRESETS,
  CROP_ASPECT_OPTIONS,
  FILTER_PRESETS,
} from './constants';

export type MobileLiteDrawerId =
  | 'edit'
  | 'canvas'
  | 'layers'
  | 'crop'
  | 'adjust'
  | 'text'
  | 'mosaic'
  | null;

type Props = {
  activeDrawer: MobileLiteDrawerId;
  onClose: () => void;
  docConfig: DocumentConfig;
  selectedProps: SelectedObjectProps | null;
  layers: LayerSummary[];
  filterValues: ImageFilterValues;
  cropAspect: CropAspectRatio;
  cropRect: CropRect | null;
  canResetCrop?: boolean;
  mosaicBrushSize: number;
  hasFaceDetector: boolean;
  onUpdateDocument: (
    patch: Partial<DocumentConfig>,
    commitLabel?: string,
    refit?: boolean
  ) => void;
  onUpdateProp: (patch: Record<string, unknown>, commitLabel?: string) => void;
  onUpdateBlendMode: (mode: BlendMode) => void;
  onUpdateClipShape: (shape: ClipShapeKind) => void;
  onAlign: (edge: AlignmentEdge) => void;
  onReplaceImage: (file: File) => void;
  onStartCrop: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onSelectLayer: (layerId: string) => void;
  onToggleVisibility: (layerId: string) => void;
  onDeleteLayer: (layerId: string) => void;
  onOrderSelected: (action: LayerOrderAction) => void;
  onSetCropAspect: (aspect: CropAspectRatio) => void;
  onApplyCrop: () => void;
  onResetCrop?: () => void;
  onCancelCrop: () => void;
  onUpdateFilters: (
    nextValues: ImageFilterValues,
    commitLabel?: string
  ) => void;
  onAddQuickText: (text: string) => void;
  onSetMosaicBrushSize: (size: number) => void;
  onFacePrivacyMosaic: () => void;
};

const CLIP_SHAPES: Array<{ label: string; value: ClipShapeKind }> = [
  { label: 'None', value: 'none' },
  { label: 'Circle', value: 'circle' },
  { label: 'Rounded', value: 'rounded' },
  { label: 'Star', value: 'star' },
];

const DRAWER_TITLES: Record<Exclude<MobileLiteDrawerId, null>, string> = {
  edit: 'Edit Layer',
  canvas: 'Canvas Size & Background',
  layers: 'Layers',
  crop: 'Crop Image',
  adjust: 'Presets & Adjust',
  text: 'Text Layer',
  mosaic: 'Mosaic & Face Privacy',
};

/**
 * Compact collapsible control tray for Mobile Lite (< lg), rendering touch-friendly
 * lightweight editing drawers (Edit, Canvas, Layers, Crop, Adjust, Text, Mosaic).
 */
export default function MobileLiteSheet({
  activeDrawer,
  onClose,
  docConfig,
  selectedProps,
  layers,
  filterValues,
  cropAspect,
  cropRect,
  canResetCrop = false,
  mosaicBrushSize,
  hasFaceDetector,
  onUpdateDocument,
  onUpdateProp,
  onUpdateBlendMode,
  onUpdateClipShape,
  onAlign,
  onReplaceImage,
  onStartCrop,
  onDuplicate,
  onDelete,
  onSelectLayer,
  onToggleVisibility,
  onDeleteLayer,
  onOrderSelected,
  onSetCropAspect,
  onApplyCrop,
  onResetCrop,
  onCancelCrop,
  onUpdateFilters,
  onAddQuickText,
  onSetMosaicBrushSize,
  onFacePrivacyMosaic,
}: Props) {
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const [captionText, setCaptionText] = useState('Quick Caption');
  const [prevDocSize, setPrevDocSize] = useState({
    width: docConfig.width,
    height: docConfig.height,
  });
  const [docSizeInput, setDocSizeInput] = useState({
    width: docConfig.width,
    height: docConfig.height,
  });

  if (
    prevDocSize.width !== docConfig.width ||
    prevDocSize.height !== docConfig.height
  ) {
    setPrevDocSize({ width: docConfig.width, height: docConfig.height });
    setDocSizeInput({ width: docConfig.width, height: docConfig.height });
  }

  if (!activeDrawer) return null;

  const isImageSelected = selectedProps?.kind === 'image';
  const isSingleImage =
    selectedProps?.kind === 'image' && selectedProps.selectedCount === 1;
  const isTextSelected = selectedProps?.kind === 'text';

  const presetKey = `${docSizeInput.width}x${docSizeInput.height}`;
  const selectedPreset = CANVAS_SIZE_PRESETS.some(
    (opt) => opt.value === presetKey
  )
    ? presetKey
    : 'custom';

  const handleApplyDocSize = () => {
    const w = clamp(docSizeInput.width || 1280, 32, 8192);
    const h = clamp(docSizeInput.height || 720, 32, 8192);
    setDocSizeInput({ width: w, height: h });
    if (w !== docConfig.width || h !== docConfig.height) {
      onUpdateDocument({ width: w, height: h }, 'Resize Canvas', true);
    }
  };

  const togglePreset = (presetId: string) => {
    const exists = filterValues.presets.includes(presetId);
    const next = exists
      ? filterValues.presets.filter((p) => p !== presetId)
      : [...filterValues.presets, presetId];
    onUpdateFilters({ ...filterValues, presets: next }, 'Toggle Filter Preset');
  };

  const renderLayerIcon = (kind: LayerSummary['kind']) => {
    if (kind === 'image') return ImageIcon;
    if (kind === 'text') return Type;
    if (kind === 'brush') return Paintbrush;
    if (kind === 'group') return Layers;
    return Shapes;
  };

  return (
    <div className="shrink-0 border-t border-neutral-200/80 bg-white/95 px-3 py-2.5 backdrop-blur-md lg:hidden dark:border-neutral-800/80 dark:bg-neutral-900/95">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
          {activeDrawer === 'layers'
            ? `Layers (${layers.length})`
            : DRAWER_TITLES[activeDrawer]}
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

      <div className="scrollbar-thin max-h-[40dvh] overflow-y-auto pr-0.5">
        {/* Edit Layer Drawer */}
        {activeDrawer === 'edit' &&
          (selectedProps ? (
            <div className="space-y-3">
              {isSingleImage && (
                <>
                  <div className="grid grid-cols-2 gap-1.5">
                    <Button
                      variant="secondary"
                      bordered
                      size="xs"
                      icon={RefreshCw}
                      onClick={() => replaceInputRef.current?.click()}
                    >
                      Replace
                    </Button>
                    <Button
                      variant="secondary"
                      bordered
                      size="xs"
                      icon={Crop}
                      onClick={onStartCrop}
                    >
                      Crop
                    </Button>
                  </div>
                  <input
                    ref={replaceInputRef}
                    type="file"
                    accept="image/*,.heic,.heif,.tif,.tiff,.svg"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) onReplaceImage(file);
                      e.target.value = '';
                    }}
                  />
                </>
              )}

              <div className="grid grid-cols-5 gap-1">
                <Button
                  size="xs"
                  variant="secondary"
                  bordered
                  icon={Scan}
                  onClick={() => onAlign('fit')}
                  title="Fit to Artboard"
                  className="!px-1 text-[10px]"
                >
                  Fit
                </Button>
                <Button
                  size="xs"
                  variant="secondary"
                  bordered
                  icon={Expand}
                  onClick={() => onAlign('cover')}
                  title="Cover Artboard"
                  className="!px-1 text-[10px]"
                >
                  Cover
                </Button>
                <Button
                  size="xs"
                  variant={selectedProps.flipX ? 'primary' : 'secondary'}
                  bordered={!selectedProps.flipX}
                  icon={FlipHorizontal}
                  onClick={() =>
                    onUpdateProp(
                      { flipX: !selectedProps.flipX },
                      'Flip Horizontal'
                    )
                  }
                  aria-label="Flip Horizontal"
                  className="!px-0"
                />
                <Button
                  size="xs"
                  variant={selectedProps.flipY ? 'primary' : 'secondary'}
                  bordered={!selectedProps.flipY}
                  icon={FlipVertical}
                  onClick={() =>
                    onUpdateProp(
                      { flipY: !selectedProps.flipY },
                      'Flip Vertical'
                    )
                  }
                  aria-label="Flip Vertical"
                  className="!px-0"
                />
                <Button
                  size="xs"
                  variant="secondary"
                  bordered
                  icon={RotateCw}
                  onClick={() =>
                    onUpdateProp(
                      { angle: (selectedProps.angle + 90) % 360 },
                      'Rotate 90°'
                    )
                  }
                  title="Rotate 90°"
                  className="!px-1 text-[10px]"
                >
                  90°
                </Button>
              </div>

              <Slider
                title="Opacity"
                min={0}
                max={100}
                step={1}
                unit="%"
                showValueBadge
                value={Math.round(selectedProps.opacity * 100)}
                onChange={(e) =>
                  onUpdateProp({ opacity: Number(e.target.value) / 100 })
                }
                onChangeEnd={() => onUpdateProp({}, 'Change Opacity')}
              />

              {isImageSelected && (
                <div className="space-y-1">
                  <span className="block text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                    Clip Shape
                  </span>
                  <div className="grid grid-cols-4 gap-1">
                    {CLIP_SHAPES.map((shape) => (
                      <Button
                        key={shape.value}
                        size="xs"
                        variant={
                          selectedProps.clipShape === shape.value
                            ? 'primary'
                            : 'secondary'
                        }
                        bordered={selectedProps.clipShape !== shape.value}
                        onClick={() => onUpdateClipShape(shape.value)}
                        className="!px-1 text-[10px]"
                      >
                        {shape.label}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              <Selector
                size="xs"
                title="Blend Mode"
                options={BLEND_MODE_OPTIONS}
                value={selectedProps.blendMode}
                onChange={(val) => onUpdateBlendMode(val as BlendMode)}
              />

              <div className="grid grid-cols-4 gap-1.5 pt-0.5">
                <Button
                  size="xs"
                  variant="secondary"
                  bordered
                  icon={ArrowUp}
                  onClick={() => onOrderSelected('forward')}
                  title="Bring Forward"
                >
                  Up
                </Button>
                <Button
                  size="xs"
                  variant="secondary"
                  bordered
                  icon={ArrowDown}
                  onClick={() => onOrderSelected('backward')}
                  title="Send Backward"
                >
                  Down
                </Button>
                <Button
                  size="xs"
                  variant="secondary"
                  bordered
                  icon={CopyPlus}
                  onClick={onDuplicate}
                  title="Duplicate Layer"
                >
                  Copy
                </Button>
                <Button
                  size="xs"
                  variant="secondary"
                  bordered
                  icon={Trash2}
                  onClick={onDelete}
                  className="text-red-500 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
                  title="Delete Layer"
                >
                  Delete
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-[11px] text-amber-600 dark:text-amber-400">
              Tap any layer on the canvas to transform, clip, duplicate, or
              delete it.
            </p>
          ))}

        {/* Canvas Dimensions & Background Drawer */}
        {activeDrawer === 'canvas' && (
          <div className="space-y-3">
            <Selector
              size="xs"
              options={CANVAS_SIZE_PRESETS}
              value={selectedPreset}
              onChange={(val) => {
                if (val === 'custom') return;
                const [wStr, hStr] = val.split('x');
                const w = parseInt(wStr, 10);
                const h = parseInt(hStr, 10);
                if (w > 0 && h > 0) {
                  setDocSizeInput({ width: w, height: h });
                  onUpdateDocument(
                    { width: w, height: h },
                    'Apply Canvas Preset',
                    true
                  );
                }
              }}
            />
            <div className="grid grid-cols-[1fr_1fr_auto] items-end gap-1.5">
              <div>
                <span className="mb-1 block text-[10px] text-neutral-500">
                  Width
                </span>
                <Input
                  type="number"
                  value={docSizeInput.width}
                  onChange={(e) =>
                    setDocSizeInput((prev) => ({
                      ...prev,
                      width: parseInt(e.target.value, 10) || 0,
                    }))
                  }
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleApplyDocSize();
                  }}
                  className="h-8 font-mono text-xs"
                />
              </div>
              <div>
                <span className="mb-1 block text-[10px] text-neutral-500">
                  Height
                </span>
                <Input
                  type="number"
                  value={docSizeInput.height}
                  onChange={(e) =>
                    setDocSizeInput((prev) => ({
                      ...prev,
                      height: parseInt(e.target.value, 10) || 0,
                    }))
                  }
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleApplyDocSize();
                  }}
                  className="h-8 font-mono text-xs"
                />
              </div>
              <Button
                variant="primary"
                size="xs"
                disabled={
                  docSizeInput.width === docConfig.width &&
                  docSizeInput.height === docConfig.height
                }
                onClick={handleApplyDocSize}
                className="h-8 px-3"
              >
                Apply
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              <Button
                size="xs"
                variant={
                  docConfig.backgroundType === 'transparent'
                    ? 'primary'
                    : 'secondary'
                }
                bordered={docConfig.backgroundType !== 'transparent'}
                onClick={() =>
                  onUpdateDocument(
                    { backgroundType: 'transparent' },
                    'Set Transparent Background'
                  )
                }
              >
                Transparent
              </Button>
              <Button
                size="xs"
                variant={
                  docConfig.backgroundType === 'color' ? 'primary' : 'secondary'
                }
                bordered={docConfig.backgroundType !== 'color'}
                onClick={() =>
                  onUpdateDocument(
                    { backgroundType: 'color' },
                    'Set Color Background'
                  )
                }
              >
                Solid Color
              </Button>
            </div>

            {docConfig.backgroundType === 'color' && (
              <div className="flex items-center justify-between rounded-lg border border-neutral-200/80 px-2.5 py-1.5 dark:border-neutral-800/80">
                <span className="text-xs font-medium text-neutral-600 dark:text-neutral-300">
                  Background Color
                </span>
                <ColorPicker
                  variant="solid"
                  value={docConfig.backgroundColor}
                  onColorChange={(hex) =>
                    onUpdateDocument({ backgroundColor: hex })
                  }
                  buttonClassName="!h-7 !w-7 shrink-0"
                />
              </div>
            )}
          </div>
        )}

        {/* Layers List Drawer */}
        {activeDrawer === 'layers' &&
          (layers.length === 0 ? (
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
              No layers yet. Tap Import or Templates to get started.
            </p>
          ) : (
            <div className="space-y-2">
              {selectedProps && (
                <div className="grid grid-cols-2 gap-1.5">
                  <Button
                    size="xs"
                    variant="secondary"
                    bordered
                    icon={ArrowUp}
                    onClick={() => onOrderSelected('forward')}
                  >
                    Bring Forward
                  </Button>
                  <Button
                    size="xs"
                    variant="secondary"
                    bordered
                    icon={ArrowDown}
                    onClick={() => onOrderSelected('backward')}
                  >
                    Send Backward
                  </Button>
                </div>
              )}
              <div className="space-y-1">
                {layers.map((layer) => {
                  const KindIcon = renderLayerIcon(layer.kind);
                  return (
                    <div
                      key={layer.id}
                      className={cn(
                        'flex items-center justify-between gap-2 rounded-lg border px-2 py-1.5 text-xs',
                        layer.isSelected
                          ? 'border-sky-400/80 bg-sky-50/70 dark:border-sky-700/80 dark:bg-sky-950/40'
                          : 'border-neutral-200/70 bg-neutral-50/60 dark:border-neutral-800/70 dark:bg-neutral-800/40'
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => onSelectLayer(layer.id)}
                        className="flex min-w-0 flex-1 items-center gap-2 text-left"
                      >
                        <KindIcon className="h-3.5 w-3.5 shrink-0 text-neutral-500 dark:text-neutral-400" />
                        <span className="truncate font-medium text-neutral-700 dark:text-neutral-200">
                          {layer.name}
                        </span>
                      </button>
                      <div className="flex shrink-0 items-center gap-0.5">
                        <Button
                          variant="ghost"
                          size="xs"
                          icon={layer.visible ? Eye : EyeOff}
                          onClick={() => onToggleVisibility(layer.id)}
                          aria-label={
                            layer.visible ? 'Hide layer' : 'Show layer'
                          }
                          className="!h-7 !min-h-7 !w-7 !min-w-7 !p-0"
                        />
                        <Button
                          variant="ghost"
                          size="xs"
                          icon={Trash2}
                          onClick={() => onDeleteLayer(layer.id)}
                          aria-label="Delete layer"
                          className="!h-7 !min-h-7 !w-7 !min-w-7 !p-0 text-red-500 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

        {/* Crop Drawer */}
        {activeDrawer === 'crop' &&
          (cropRect ? (
            <div className="flex flex-wrap items-center gap-2">
              <div className="w-28">
                <Selector
                  size="xs"
                  options={CROP_ASPECT_OPTIONS}
                  value={cropAspect}
                  onChange={(v) => onSetCropAspect(v as CropAspectRatio)}
                />
              </div>
              <span className="font-mono text-[11px] font-semibold text-neutral-600 dark:text-neutral-300">
                {cropRect.width}×{cropRect.height}
              </span>
              {canResetCrop && onResetCrop && (
                <Button
                  variant="ghost"
                  size="xs"
                  icon={RotateCcw}
                  onClick={onResetCrop}
                  className="!px-1.5 text-[11px]"
                >
                  Reset
                </Button>
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
          ) : (
            <p className="text-[11px] text-amber-600 dark:text-amber-400">
              Select or add an image layer first to crop.
            </p>
          ))}

        {/* Adjust Drawer */}
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

        {/* Text Drawer */}
        {activeDrawer === 'text' && (
          <div className="space-y-2.5">
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
                }}
                className="shrink-0 whitespace-nowrap"
              >
                Add Text
              </Button>
            </div>
            {isTextSelected && selectedProps && (
              <div className="space-y-2 border-t border-neutral-200/70 pt-2 dark:border-neutral-800/70">
                <div className="flex items-center gap-2">
                  <div className="min-w-0 flex-1">
                    <Slider
                      title="Font Size"
                      min={12}
                      max={160}
                      step={1}
                      unit="px"
                      showValueBadge
                      value={selectedProps.fontSize}
                      onChange={(e) =>
                        onUpdateProp({ fontSize: Number(e.target.value) })
                      }
                      onChangeEnd={() => onUpdateProp({}, 'Change Font Size')}
                    />
                  </div>
                  <ColorPicker
                    variant="solid"
                    value={selectedProps.fill}
                    onColorChange={(hex) => onUpdateProp({ fill: hex })}
                    buttonClassName="!h-7 !w-7 shrink-0"
                    title="Text Color"
                  />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
                    Alignment
                  </span>
                  <div className="grid grid-cols-3 gap-1">
                    <Button
                      variant={
                        selectedProps.textAlign === 'left'
                          ? 'primary'
                          : 'secondary'
                      }
                      size="xs"
                      bordered={selectedProps.textAlign !== 'left'}
                      icon={AlignLeft}
                      aria-label="Align Text Left"
                      onClick={() =>
                        onUpdateProp({ textAlign: 'left' }, 'Align Text')
                      }
                    />
                    <Button
                      variant={
                        selectedProps.textAlign === 'center'
                          ? 'primary'
                          : 'secondary'
                      }
                      size="xs"
                      bordered={selectedProps.textAlign !== 'center'}
                      icon={AlignCenter}
                      aria-label="Align Text Center"
                      onClick={() =>
                        onUpdateProp({ textAlign: 'center' }, 'Align Text')
                      }
                    />
                    <Button
                      variant={
                        selectedProps.textAlign === 'right'
                          ? 'primary'
                          : 'secondary'
                      }
                      size="xs"
                      bordered={selectedProps.textAlign !== 'right'}
                      icon={AlignRight}
                      aria-label="Align Text Right"
                      onClick={() =>
                        onUpdateProp({ textAlign: 'right' }, 'Align Text')
                      }
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Mosaic Drawer */}
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
      </div>
    </div>
  );
}
