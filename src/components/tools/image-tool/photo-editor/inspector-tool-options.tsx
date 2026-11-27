'use client';

import type { LucideIcon } from 'lucide-react';
import type {
  BrushSettings,
  BrushType,
  CropAspectRatio,
  CropRect,
  MaskBrushSettings,
  ShapeKind,
  ShapeSettings,
  StudioToolId,
} from './types/studio';

import {
  Check,
  Contrast,
  Copy,
  Crop,
  Eraser,
  Grid3X3,
  Paintbrush,
  PenTool,
  Pipette,
  RotateCcw,
  Shapes,
  Sparkles,
  Type,
  Wand2,
  X,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ColorPicker } from '@/components/ui/color-picker';
import { Selector } from '@/components/ui/selector';
import { Slider } from '@/components/ui/slider';
import toast from '@/utils/toast';

import { CROP_ASPECT_OPTIONS } from './constants';

type Props = {
  activeTool: StudioToolId;
  brushSettings: BrushSettings;
  maskBrushSettings: MaskBrushSettings;
  shapeSettings: ShapeSettings;
  cropAspect: CropAspectRatio;
  cropRect: CropRect | null;
  cropImageBounds: { width: number; height: number } | null;
  penAnchorCount: number;
  samPointsCount: number;
  samHasMask: boolean;
  magicEraserSize: number;
  magicEraserHasStrokes: boolean;
  mosaicBrushSize: number;
  sampledColor: string;
  onExitTool: () => void;
  onUpdateBrush: (patch: Partial<BrushSettings>) => void;
  onUpdateMaskBrush: (patch: Partial<MaskBrushSettings>) => void;
  onUpdateShape: (patch: Partial<ShapeSettings>) => void;
  onSetCropAspect: (aspect: CropAspectRatio) => void;
  onApplyCrop: () => void;
  onResetCrop: () => void;
  onCancelCrop: () => void;
  onFinishPenPath: (closed: boolean) => void;
  onCancelPenPath: () => void;
  onApplySamAsMask: () => void;
  onExtractSamLayer: () => void;
  onClearSamSelection: () => void;
  onSetMagicEraserSize: (size: number) => void;
  onSetMosaicBrushSize: (size: number) => void;
  onRunMagicErase: (mode: 'quick' | 'lama') => void;
  onClearMagicEraserMask: () => void;
};

const BRUSH_OPTIONS = [
  { label: 'Pencil', value: 'pencil' },
  { label: 'Spray', value: 'spray' },
  { label: 'Circle', value: 'circle' },
];

const SHAPE_OPTIONS = [
  { label: 'Rectangle', value: 'rect' },
  { label: 'Circle', value: 'circle' },
  { label: 'Triangle', value: 'triangle' },
  { label: 'Star', value: 'star' },
  { label: 'Line', value: 'line' },
];

const TOOL_META: Record<
  Exclude<StudioToolId, 'select' | 'hand'>,
  { label: string; icon: LucideIcon }
> = {
  crop: { label: 'Crop Image', icon: Crop },
  brush: { label: 'Brush Tool', icon: Paintbrush },
  eraser: { label: 'Eraser Brush', icon: Eraser },
  mask: { label: 'Layer Mask', icon: Contrast },
  mosaic: { label: 'Mosaic Brush', icon: Grid3X3 },
  pen: { label: 'Bezier Pen', icon: PenTool },
  text: { label: 'Text Tool', icon: Type },
  shape: { label: 'Vector Shape', icon: Shapes },
  eyedropper: { label: 'Eyedropper', icon: Pipette },
  'magic-select': { label: 'AI Magic Select', icon: Wand2 },
  'magic-eraser': { label: 'AI Magic Eraser', icon: Sparkles },
};

/**
 * Pinned contextual tool options card rendered directly below the Right Inspector tabs
 * so switching tools never causes vertical layout shift on the canvas stage.
 */
export default function InspectorToolOptions({
  activeTool,
  brushSettings,
  maskBrushSettings,
  shapeSettings,
  cropAspect,
  cropRect,
  cropImageBounds,
  penAnchorCount,
  samPointsCount,
  samHasMask,
  magicEraserSize,
  magicEraserHasStrokes,
  mosaicBrushSize,
  sampledColor,
  onExitTool,
  onUpdateBrush,
  onUpdateMaskBrush,
  onUpdateShape,
  onSetCropAspect,
  onApplyCrop,
  onResetCrop,
  onCancelCrop,
  onFinishPenPath,
  onCancelPenPath,
  onApplySamAsMask,
  onExtractSamLayer,
  onClearSamSelection,
  onSetMagicEraserSize,
  onSetMosaicBrushSize,
  onRunMagicErase,
  onClearMagicEraserMask,
}: Props) {
  if (
    activeTool === 'select' ||
    activeTool === 'hand' ||
    (activeTool === 'crop' && !cropRect)
  ) {
    return null;
  }

  const meta = TOOL_META[activeTool];
  const ToolIcon = meta.icon;

  const canResetCrop = Boolean(
    cropRect &&
      cropImageBounds &&
      (cropRect.x !== 0 ||
        cropRect.y !== 0 ||
        cropRect.width !== cropImageBounds.width ||
        cropRect.height !== cropImageBounds.height)
  );

  const handleCloseTool = () => {
    if (activeTool === 'crop') {
      onCancelCrop();
    } else if (activeTool === 'pen') {
      onCancelPenPath();
    } else {
      onExitTool();
    }
  };

  const handleCopySampledColor = async () => {
    if (typeof navigator === 'undefined' || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(sampledColor);
      toast.success(`Copied ${sampledColor}`);
    } catch {
      toast.error('Unable to copy color');
    }
  };

  return (
    <div className="shrink-0 border-b border-neutral-200/80 px-3 py-2.5 dark:border-neutral-800/80">
      <div className="space-y-2.5 rounded-xl border border-sky-200/80 bg-sky-50/70 p-2.5 dark:border-sky-800/50 dark:bg-sky-950/30">
        {/* Card Header */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-1.5">
            <ToolIcon className="h-3.5 w-3.5 shrink-0 text-sky-600 dark:text-sky-400" />
            <span className="truncate text-[11px] font-bold uppercase tracking-wider text-sky-900 dark:text-sky-100">
              {meta.label}
            </span>
          </div>
          <Button
            variant="ghost"
            size="xs"
            icon={X}
            onClick={handleCloseTool}
            title="Exit Tool (Esc)"
            aria-label="Exit Tool"
            className="!h-6 !min-h-6 !w-6 !min-w-6 shrink-0 !p-0 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
          />
        </div>

        {/* Crop Image */}
        {activeTool === 'crop' && cropRect && (
          <div className="space-y-2">
            <Selector
              size="xs"
              title="Aspect Ratio"
              options={CROP_ASPECT_OPTIONS}
              value={cropAspect}
              onChange={(val) => onSetCropAspect(val as CropAspectRatio)}
            />
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-[11px] font-semibold text-neutral-600 dark:text-neutral-300">
                {cropRect.width} × {cropRect.height} px
              </span>
              <Button
                variant="ghost"
                size="xs"
                icon={RotateCcw}
                disabled={!canResetCrop}
                onClick={onResetCrop}
                title="Reset to full original image bounds"
                className="!h-6 !px-1.5 text-[10px]"
              >
                Reset
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <Button
                variant="primary"
                size="xs"
                icon={Check}
                onClick={onApplyCrop}
              >
                Apply
              </Button>
              <Button
                variant="secondary"
                bordered
                size="xs"
                icon={X}
                onClick={onCancelCrop}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Brush */}
        {activeTool === 'brush' && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="min-w-0 flex-1">
                <Selector
                  size="xs"
                  options={BRUSH_OPTIONS}
                  value={brushSettings.type}
                  onChange={(val) => onUpdateBrush({ type: val as BrushType })}
                />
              </div>
              <ColorPicker
                variant="solid"
                value={brushSettings.color}
                onColorChange={(color) => onUpdateBrush({ color })}
                buttonClassName="!h-7 !w-7 shrink-0"
                title="Brush Color"
              />
            </div>
            <Slider
              title="Brush Size"
              min={2}
              max={80}
              step={1}
              unit="px"
              showValueBadge
              value={brushSettings.size}
              onChange={(e) => onUpdateBrush({ size: Number(e.target.value) })}
            />
          </div>
        )}

        {/* Eraser */}
        {activeTool === 'eraser' && (
          <Slider
            title="Eraser Size"
            min={4}
            max={100}
            step={1}
            unit="px"
            showValueBadge
            value={brushSettings.size}
            onChange={(e) => onUpdateBrush({ size: Number(e.target.value) })}
          />
        )}

        {/* Layer Mask */}
        {activeTool === 'mask' && (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-1.5">
              <Button
                size="xs"
                variant={
                  maskBrushSettings.mode === 'hide' ? 'primary' : 'secondary'
                }
                bordered={maskBrushSettings.mode !== 'hide'}
                onClick={() => onUpdateMaskBrush({ mode: 'hide' })}
              >
                Hide
              </Button>
              <Button
                size="xs"
                variant={
                  maskBrushSettings.mode === 'reveal' ? 'primary' : 'secondary'
                }
                bordered={maskBrushSettings.mode !== 'reveal'}
                onClick={() => onUpdateMaskBrush({ mode: 'reveal' })}
              >
                Reveal
              </Button>
            </div>
            <Slider
              title="Size"
              min={6}
              max={160}
              step={1}
              unit="px"
              showValueBadge
              value={maskBrushSettings.size}
              onChange={(e) =>
                onUpdateMaskBrush({ size: Number(e.target.value) })
              }
            />
            <Slider
              title="Feather"
              min={5}
              max={95}
              step={1}
              unit="%"
              showValueBadge
              value={Math.round(maskBrushSettings.feather * 100)}
              onChange={(e) =>
                onUpdateMaskBrush({ feather: Number(e.target.value) / 100 })
              }
            />
          </div>
        )}

        {/* Mosaic */}
        {activeTool === 'mosaic' && (
          <div className="space-y-1.5">
            <Slider
              title="Brush Size"
              min={8}
              max={96}
              step={1}
              unit="px"
              showValueBadge
              value={mosaicBrushSize}
              onChange={(e) => onSetMosaicBrushSize(Number(e.target.value))}
            />
            <p className="text-[11px] leading-snug text-neutral-500 dark:text-neutral-400">
              Drag across any image layer to pixelate.
            </p>
          </div>
        )}

        {/* Vector Shape */}
        {activeTool === 'shape' && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="min-w-0 flex-1">
                <Selector
                  size="xs"
                  options={SHAPE_OPTIONS}
                  value={shapeSettings.kind}
                  onChange={(val) => onUpdateShape({ kind: val as ShapeKind })}
                />
              </div>
              <ColorPicker
                variant="solid"
                value={shapeSettings.fill}
                onColorChange={(fill) => onUpdateShape({ fill })}
                buttonClassName="!h-7 !w-7 shrink-0"
                title="Fill Color"
              />
            </div>
            <p className="text-[11px] leading-snug text-neutral-500 dark:text-neutral-400">
              Click anywhere on the canvas to insert.
            </p>
          </div>
        )}

        {/* Bezier Pen */}
        {activeTool === 'pen' && (
          <div className="space-y-2">
            <p className="text-[11px] leading-snug text-neutral-600 dark:text-neutral-300">
              {penAnchorCount === 0
                ? 'Click to place anchors · Drag to curve handles'
                : `${penAnchorCount} node(s) · Click 1st node to close`}
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              <Button
                variant="primary"
                size="xs"
                disabled={penAnchorCount < 3}
                onClick={() => onFinishPenPath(true)}
              >
                Close Path
              </Button>
              <Button
                variant="secondary"
                bordered
                size="xs"
                disabled={penAnchorCount < 2}
                onClick={() => onFinishPenPath(false)}
              >
                Open Path
              </Button>
            </div>
          </div>
        )}

        {/* Text Tool */}
        {activeTool === 'text' && (
          <p className="text-[11px] leading-snug text-neutral-600 dark:text-neutral-300">
            Click anywhere on the canvas to add an editable text layer.
          </p>
        )}

        {/* Eyedropper */}
        {activeTool === 'eyedropper' && (
          <div className="flex items-center justify-between gap-2 rounded-lg border border-neutral-200/80 bg-white/80 px-2.5 py-1.5 dark:border-neutral-700/80 dark:bg-neutral-900/70">
            <div className="flex items-center gap-2">
              <span
                className="h-5 w-5 shrink-0 rounded border border-neutral-300 dark:border-neutral-600"
                style={{ backgroundColor: sampledColor }}
              />
              <span className="font-mono text-xs font-semibold text-neutral-700 dark:text-neutral-200">
                {sampledColor}
              </span>
            </div>
            <Button
              variant="ghost"
              size="xs"
              icon={Copy}
              onClick={() => void handleCopySampledColor()}
              className="!h-6 !px-1.5 text-[10px]"
            >
              Copy
            </Button>
          </div>
        )}

        {/* AI Magic Select */}
        {activeTool === 'magic-select' && (
          <div className="space-y-2">
            <p className="text-[11px] leading-snug text-neutral-600 dark:text-neutral-300">
              {samPointsCount === 0
                ? 'Click subject (+), Shift+Click exclude (-)'
                : `${samPointsCount} point(s) · Click canvas to refine`}
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              <Button
                variant="primary"
                size="xs"
                disabled={!samHasMask}
                onClick={onExtractSamLayer}
              >
                Extract Layer
              </Button>
              <Button
                variant="secondary"
                bordered
                size="xs"
                disabled={!samHasMask}
                onClick={onApplySamAsMask}
              >
                Apply Mask
              </Button>
            </div>
            {samPointsCount > 0 && (
              <Button
                variant="ghost"
                size="xs"
                onClick={onClearSamSelection}
                className="w-full"
              >
                Clear Points
              </Button>
            )}
          </div>
        )}

        {/* AI Magic Eraser */}
        {activeTool === 'magic-eraser' && (
          <div className="space-y-2">
            <Slider
              title="Brush Size"
              min={6}
              max={120}
              step={1}
              unit="px"
              showValueBadge
              value={magicEraserSize}
              onChange={(e) => onSetMagicEraserSize(Number(e.target.value))}
            />
            <div className="grid grid-cols-2 gap-1.5">
              <Button
                variant="secondary"
                bordered
                size="xs"
                disabled={!magicEraserHasStrokes}
                onClick={() => onRunMagicErase('quick')}
              >
                Quick (0 MB)
              </Button>
              <Button
                variant="primary"
                size="xs"
                disabled={!magicEraserHasStrokes}
                onClick={() => onRunMagicErase('lama')}
              >
                AI LaMa
              </Button>
            </div>
            {magicEraserHasStrokes && (
              <Button
                variant="ghost"
                size="xs"
                onClick={onClearMagicEraserMask}
                className="w-full"
              >
                Clear Strokes
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
