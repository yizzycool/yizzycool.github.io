'use client';

import type {
  AlignmentEdge,
  BlendMode,
  BooleanOpKind,
  ClipShapeKind,
  DocumentConfig,
  SelectedObjectProps,
  TextCurveKind,
} from './types/studio';

import {
  AlignCenter,
  AlignCenterHorizontal,
  AlignCenterVertical,
  AlignEndHorizontal,
  AlignEndVertical,
  AlignLeft,
  AlignRight,
  AlignStartHorizontal,
  AlignStartVertical,
  Bold,
  CopyPlus,
  FlipHorizontal,
  FlipVertical,
  Italic,
  Layers,
  Paintbrush,
  Spline,
  Trash2,
  Underline,
  Upload,
} from 'lucide-react';
import { useRef, useState } from 'react';
import { clamp } from 'lodash';

import { Button } from '@/components/ui/button';
import { ColorPicker } from '@/components/ui/color-picker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Selector } from '@/components/ui/selector';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';

import {
  BLEND_MODE_OPTIONS,
  CANVAS_SIZE_PRESETS,
  FONT_FAMILY_OPTIONS,
  TEXT_CURVE_OPTIONS,
} from './constants';

type Props = {
  docConfig: DocumentConfig;
  selectedProps: SelectedObjectProps | null;
  customFonts: Array<{ label: string; value: string }>;
  onUpdateDocument: (
    patch: Partial<DocumentConfig>,
    commitLabel?: string,
    refit?: boolean
  ) => void;
  onUpdateProp: (patch: Record<string, unknown>, commitLabel?: string) => void;
  onUpdateBlendMode: (mode: BlendMode) => void;
  onUpdateShadow: (
    config: {
      enabled: boolean;
      blur: number;
      offsetX: number;
      offsetY: number;
      color: string;
    },
    commitLabel?: string
  ) => void;
  onUpdateClipShape: (shape: ClipShapeKind) => void;
  onTogglePathNodeEditing: () => void;
  onRunBooleanOp: (op: BooleanOpKind) => void;
  onUpdateTextCurve: (
    kind: TextCurveKind,
    strength?: number,
    commitLabel?: string
  ) => void;
  onLoadCustomFont: (file: File) => void;
  onConvertTextToOutlines: () => void;
  onAddLayerMask: () => void;
  onPaintLayerMask: () => void;
  onInvertLayerMask: () => void;
  onRemoveLayerMask: () => void;
  onToggleClipToBelow: () => void;
  onAlign: (edge: AlignmentEdge) => void;
  onDuplicate: () => void;
  onDelete: () => void;
};

const CLIP_SHAPES: Array<{ label: string; value: ClipShapeKind }> = [
  { label: 'None', value: 'none' },
  { label: 'Circle', value: 'circle' },
  { label: 'Rounded', value: 'rounded' },
  { label: 'Star', value: 'star' },
];

/**
 * Right Inspector Design tab: shows Artboard setup when nothing is selected,
 * or Transform, Blend Mode, Appearance, Typography, Clipping Mask & Shadow controls.
 */
export default function InspectorDesignTab({
  docConfig,
  selectedProps,
  customFonts,
  onUpdateDocument,
  onUpdateProp,
  onUpdateBlendMode,
  onUpdateShadow,
  onUpdateClipShape,
  onTogglePathNodeEditing,
  onRunBooleanOp,
  onUpdateTextCurve,
  onLoadCustomFont,
  onConvertTextToOutlines,
  onAddLayerMask,
  onPaintLayerMask,
  onInvertLayerMask,
  onRemoveLayerMask,
  onToggleClipToBelow,
  onAlign,
  onDuplicate,
  onDelete,
}: Props) {
  const fontInputRef = useRef<HTMLInputElement>(null);
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

  if (!selectedProps) {
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

    return (
      <div className="space-y-5">
        <div className="space-y-2.5">
          <Label className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            Canvas Dimensions
          </Label>
          <Selector
            size="sm"
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
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="mb-1 block text-[11px] text-neutral-500">
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
                className="font-mono text-xs"
              />
            </div>
            <div>
              <span className="mb-1 block text-[11px] text-neutral-500">
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
                className="font-mono text-xs"
              />
            </div>
          </div>
          <Button
            variant="primary"
            size="xs"
            disabled={
              docSizeInput.width === docConfig.width &&
              docSizeInput.height === docConfig.height
            }
            onClick={handleApplyDocSize}
            className="w-full"
          >
            Apply Dimensions
          </Button>
        </div>

        <div className="border-t border-neutral-200/80 pt-4 dark:border-neutral-800/80">
          <Label className="mb-2.5 block text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            Canvas Background
          </Label>
          <div className="grid grid-cols-2 gap-2">
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
            <div className="mt-3 space-y-3">
              <ColorPicker
                variant="card"
                label="Background Color"
                value={docConfig.backgroundColor}
                onColorChange={(hex) =>
                  onUpdateDocument({ backgroundColor: hex })
                }
                onChangeEnd={() =>
                  onUpdateDocument({}, 'Update Background Color')
                }
              />
              <Slider
                title="Background Opacity"
                min={0}
                max={100}
                step={1}
                unit="%"
                showValueBadge
                value={Math.round(docConfig.backgroundOpacity * 100)}
                onChange={(e) =>
                  onUpdateDocument({
                    backgroundOpacity: Number(e.target.value) / 100,
                  })
                }
                onChangeEnd={() =>
                  onUpdateDocument({}, 'Update Background Opacity')
                }
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Alignment Row */}
      <div className="space-y-2">
        <Label className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
          Align to Artboard
        </Label>
        <div className="grid grid-cols-6 gap-1">
          <Button
            variant="ghost"
            size="xs"
            icon={AlignStartVertical}
            onClick={() => onAlign('left')}
            title="Align Left"
            className="!px-0"
          />
          <Button
            variant="ghost"
            size="xs"
            icon={AlignCenterVertical}
            onClick={() => onAlign('center-h')}
            title="Center Horizontally"
            className="!px-0"
          />
          <Button
            variant="ghost"
            size="xs"
            icon={AlignEndVertical}
            onClick={() => onAlign('right')}
            title="Align Right"
            className="!px-0"
          />
          <Button
            variant="ghost"
            size="xs"
            icon={AlignStartHorizontal}
            onClick={() => onAlign('top')}
            title="Align Top"
            className="!px-0"
          />
          <Button
            variant="ghost"
            size="xs"
            icon={AlignCenterHorizontal}
            onClick={() => onAlign('center-v')}
            title="Center Vertically"
            className="!px-0"
          />
          <Button
            variant="ghost"
            size="xs"
            icon={AlignEndHorizontal}
            onClick={() => onAlign('bottom')}
            title="Align Bottom"
            className="!px-0"
          />
        </div>
      </div>

      {/* Compositing: Blend Mode & Opacity */}
      <div className="space-y-3 border-t border-neutral-200/80 pt-4 dark:border-neutral-800/80">
        <Label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
          Compositing
        </Label>
        <Selector
          size="sm"
          title="Blend Mode"
          options={BLEND_MODE_OPTIONS}
          value={selectedProps.blendMode}
          onChange={(val) => onUpdateBlendMode(val as BlendMode)}
        />
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
      </div>

      {/* Transform */}
      <div className="space-y-3 border-t border-neutral-200/80 pt-4 dark:border-neutral-800/80">
        <Label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
          Transform
        </Label>
        <Slider
          title="Rotation"
          min={0}
          max={360}
          step={1}
          unit="°"
          showValueBadge
          value={((selectedProps.angle % 360) + 360) % 360}
          onChange={(e) => onUpdateProp({ angle: Number(e.target.value) })}
          onChangeEnd={() => onUpdateProp({}, 'Rotate Layer')}
        />
        <div className="grid grid-cols-2 gap-2">
          <Button
            size="xs"
            variant={selectedProps.flipX ? 'primary' : 'secondary'}
            bordered={!selectedProps.flipX}
            icon={FlipHorizontal}
            onClick={() =>
              onUpdateProp({ flipX: !selectedProps.flipX }, 'Flip Horizontal')
            }
          >
            Flip H
          </Button>
          <Button
            size="xs"
            variant={selectedProps.flipY ? 'primary' : 'secondary'}
            bordered={!selectedProps.flipY}
            icon={FlipVertical}
            onClick={() =>
              onUpdateProp({ flipY: !selectedProps.flipY }, 'Flip Vertical')
            }
          >
            Flip V
          </Button>
        </div>
      </div>

      {/* Vector Boolean Operations (2+ selected shapes/paths) */}
      {selectedProps.canBoolean && (
        <div className="space-y-2 border-t border-neutral-200/80 pt-4 dark:border-neutral-800/80">
          <Label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            Vector Boolean
          </Label>
          <div className="grid grid-cols-4 gap-1">
            {(['union', 'subtract', 'intersect', 'exclude'] as const).map(
              (op) => (
                <Button
                  key={op}
                  size="xs"
                  variant="secondary"
                  bordered
                  onClick={() => onRunBooleanOp(op)}
                  className="!px-1 text-[10px] capitalize"
                >
                  {op}
                </Button>
              )
            )}
          </div>
        </div>
      )}

      {/* Bezier Path Anchor Node Editing */}
      {selectedProps.isPath && (
        <div className="space-y-2 border-t border-neutral-200/80 pt-4 dark:border-neutral-800/80">
          <Label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            Vector Path Nodes
          </Label>
          <Button
            size="xs"
            variant={selectedProps.isEditingPathNodes ? 'primary' : 'secondary'}
            bordered={!selectedProps.isEditingPathNodes}
            icon={Spline}
            onClick={onTogglePathNodeEditing}
            className="w-full"
          >
            {selectedProps.isEditingPathNodes
              ? 'Finish Node Editing'
              : 'Edit Bezier Anchors & Handles'}
          </Button>
        </div>
      )}

      {/* Typography Controls (Text Layers) */}
      {selectedProps.kind === 'text' && (
        <div className="space-y-3 border-t border-neutral-200/80 pt-4 dark:border-neutral-800/80">
          <div className="flex items-center justify-between">
            <Label className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              Typography
            </Label>
            <Button
              size="xs"
              variant="ghost"
              icon={Upload}
              onClick={() => fontInputRef.current?.click()}
              title="Load local .ttf / .otf / .woff2 font"
              className="!h-6 !px-1.5 text-[10px]"
            >
              Load Font
            </Button>
            <input
              ref={fontInputRef}
              type="file"
              accept=".ttf,.otf,.woff,.woff2"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onLoadCustomFont(file);
                e.target.value = '';
              }}
            />
          </div>
          <Selector
            size="sm"
            options={[...FONT_FAMILY_OPTIONS, ...customFonts]}
            value={selectedProps.fontFamily}
            onChange={(val) =>
              onUpdateProp({ fontFamily: val }, 'Change Font Family')
            }
          />
          <Slider
            title="Font Size"
            min={12}
            max={200}
            step={1}
            unit="px"
            showValueBadge
            value={selectedProps.fontSize}
            onChange={(e) => onUpdateProp({ fontSize: Number(e.target.value) })}
            onChangeEnd={() => onUpdateProp({}, 'Change Font Size')}
          />
          <div className="grid grid-cols-3 gap-1.5">
            <Button
              size="xs"
              variant={
                selectedProps.fontWeight === 'bold' ? 'primary' : 'secondary'
              }
              bordered={selectedProps.fontWeight !== 'bold'}
              icon={Bold}
              onClick={() =>
                onUpdateProp(
                  {
                    fontWeight:
                      selectedProps.fontWeight === 'bold' ? 'normal' : 'bold',
                  },
                  'Toggle Bold'
                )
              }
            />
            <Button
              size="xs"
              variant={
                selectedProps.fontStyle === 'italic' ? 'primary' : 'secondary'
              }
              bordered={selectedProps.fontStyle !== 'italic'}
              icon={Italic}
              onClick={() =>
                onUpdateProp(
                  {
                    fontStyle:
                      selectedProps.fontStyle === 'italic'
                        ? 'normal'
                        : 'italic',
                  },
                  'Toggle Italic'
                )
              }
            />
            <Button
              size="xs"
              variant={selectedProps.underline ? 'primary' : 'secondary'}
              bordered={!selectedProps.underline}
              icon={Underline}
              onClick={() =>
                onUpdateProp(
                  { underline: !selectedProps.underline },
                  'Toggle Underline'
                )
              }
            />
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            <Button
              size="xs"
              variant={
                selectedProps.textAlign === 'left' ? 'primary' : 'secondary'
              }
              bordered={selectedProps.textAlign !== 'left'}
              icon={AlignLeft}
              title="Align Text Left"
              aria-label="Align Text Left"
              onClick={() =>
                onUpdateProp({ textAlign: 'left' }, 'Align Text Left')
              }
            />
            <Button
              size="xs"
              variant={
                selectedProps.textAlign === 'center' ? 'primary' : 'secondary'
              }
              bordered={selectedProps.textAlign !== 'center'}
              icon={AlignCenter}
              title="Align Text Center"
              aria-label="Align Text Center"
              onClick={() =>
                onUpdateProp({ textAlign: 'center' }, 'Align Text Center')
              }
            />
            <Button
              size="xs"
              variant={
                selectedProps.textAlign === 'right' ? 'primary' : 'secondary'
              }
              bordered={selectedProps.textAlign !== 'right'}
              icon={AlignRight}
              title="Align Text Right"
              aria-label="Align Text Right"
              onClick={() =>
                onUpdateProp({ textAlign: 'right' }, 'Align Text Right')
              }
            />
          </div>
          <ColorPicker
            variant="card"
            label="Text Color"
            value={selectedProps.fill}
            onColorChange={(hex) => onUpdateProp({ fill: hex })}
            onChangeEnd={() => onUpdateProp({}, 'Change Text Color')}
          />

          <Selector
            size="sm"
            title="Text Path Curve"
            options={TEXT_CURVE_OPTIONS}
            value={selectedProps.textCurveKind}
            onChange={(val) =>
              onUpdateTextCurve(
                val as TextCurveKind,
                selectedProps.textCurveStrength,
                'Apply Text Path Curve'
              )
            }
          />

          {selectedProps.textCurveKind !== 'none' && (
            <Slider
              title="Curve Strength"
              min={10}
              max={100}
              step={2}
              showValueBadge
              value={selectedProps.textCurveStrength}
              onChange={(e) =>
                onUpdateTextCurve(
                  selectedProps.textCurveKind,
                  Number(e.target.value)
                )
              }
              onChangeEnd={() =>
                onUpdateTextCurve(
                  selectedProps.textCurveKind,
                  selectedProps.textCurveStrength,
                  'Adjust Text Curve'
                )
              }
            />
          )}

          <Button
            size="xs"
            variant="secondary"
            bordered
            icon={Spline}
            onClick={onConvertTextToOutlines}
            className="w-full"
          >
            Convert to Vector Outlines
          </Button>
        </div>
      )}

      {/* Shape / Brush Appearance */}
      {(selectedProps.kind === 'shape' || selectedProps.kind === 'brush') && (
        <div className="space-y-3 border-t border-neutral-200/80 pt-4 dark:border-neutral-800/80">
          <Label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            Fill &amp; Stroke
          </Label>
          {selectedProps.kind === 'shape' && (
            <ColorPicker
              variant="card"
              label="Fill Color"
              value={selectedProps.fill}
              onColorChange={(hex) => onUpdateProp({ fill: hex })}
              onChangeEnd={() => onUpdateProp({}, 'Change Fill Color')}
            />
          )}
          <ColorPicker
            variant="card"
            label="Stroke Color"
            value={selectedProps.stroke}
            onColorChange={(hex) => onUpdateProp({ stroke: hex })}
            onChangeEnd={() => onUpdateProp({}, 'Change Stroke Color')}
          />
          <Slider
            title="Stroke Width"
            min={0}
            max={40}
            step={1}
            unit="px"
            showValueBadge
            value={selectedProps.strokeWidth}
            onChange={(e) =>
              onUpdateProp({ strokeWidth: Number(e.target.value) })
            }
            onChangeEnd={() => onUpdateProp({}, 'Change Stroke Width')}
          />
        </div>
      )}

      {/* Masking & Clipping */}
      {(selectedProps.kind === 'image' ||
        selectedProps.canClipToBelow ||
        selectedProps.isClippedBelow) && (
        <div className="space-y-3 border-t border-neutral-200/80 pt-4 dark:border-neutral-800/80">
          <Label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            Masking &amp; Clipping
          </Label>

          {selectedProps.kind === 'image' && (
            <>
              <div className="grid grid-cols-4 gap-1.5">
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
                    className="!px-1 text-[11px]"
                  >
                    {shape.label}
                  </Button>
                ))}
              </div>

              {selectedProps.hasLayerMask ? (
                <div className="grid grid-cols-3 gap-1.5">
                  <Button
                    size="xs"
                    variant="primary"
                    icon={Paintbrush}
                    onClick={onPaintLayerMask}
                    className="!px-1 text-[11px]"
                  >
                    Paint
                  </Button>
                  <Button
                    size="xs"
                    variant="secondary"
                    bordered
                    onClick={onInvertLayerMask}
                    className="!px-1 text-[11px]"
                  >
                    Invert
                  </Button>
                  <Button
                    size="xs"
                    variant="outline"
                    onClick={onRemoveLayerMask}
                    className="!px-1 text-[11px]"
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <Button
                  size="xs"
                  variant="secondary"
                  bordered
                  icon={Paintbrush}
                  onClick={onAddLayerMask}
                  className="w-full"
                >
                  Add Editable Alpha Mask
                </Button>
              )}
            </>
          )}

          {(selectedProps.canClipToBelow || selectedProps.isClippedBelow) && (
            <Button
              size="xs"
              variant={selectedProps.isClippedBelow ? 'primary' : 'secondary'}
              bordered={!selectedProps.isClippedBelow}
              icon={Layers}
              onClick={onToggleClipToBelow}
              className="w-full"
            >
              {selectedProps.isClippedBelow
                ? 'Release Clipping Mask'
                : 'Clip to Layer Below'}
            </Button>
          )}
        </div>
      )}

      {/* Drop Shadow */}
      <div className="space-y-3 border-t border-neutral-200/80 pt-4 dark:border-neutral-800/80">
        <div className="flex items-center justify-between">
          <Label className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            Drop Shadow
          </Label>
          <Switch
            size="sm"
            checked={selectedProps.hasShadow}
            onChange={(checked) =>
              onUpdateShadow(
                {
                  enabled: checked,
                  blur: selectedProps.shadowBlur,
                  offsetX: selectedProps.shadowOffsetX,
                  offsetY: selectedProps.shadowOffsetY,
                  color: selectedProps.shadowColor,
                },
                checked ? 'Enable Drop Shadow' : 'Disable Drop Shadow'
              )
            }
          />
        </div>

        {selectedProps.hasShadow && (
          <Slider
            title="Shadow Blur"
            min={0}
            max={60}
            step={1}
            unit="px"
            showValueBadge
            value={selectedProps.shadowBlur}
            onChange={(e) =>
              onUpdateShadow({
                enabled: true,
                blur: Number(e.target.value),
                offsetX: selectedProps.shadowOffsetX,
                offsetY: selectedProps.shadowOffsetY,
                color: selectedProps.shadowColor,
              })
            }
            onChangeEnd={() =>
              onUpdateShadow(
                {
                  enabled: true,
                  blur: selectedProps.shadowBlur,
                  offsetX: selectedProps.shadowOffsetX,
                  offsetY: selectedProps.shadowOffsetY,
                  color: selectedProps.shadowColor,
                },
                'Update Shadow Blur'
              )
            }
          />
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-2 border-t border-neutral-200/80 pt-4 dark:border-neutral-800/80">
        <Button
          size="xs"
          variant="secondary"
          bordered
          icon={CopyPlus}
          onClick={onDuplicate}
        >
          Duplicate
        </Button>
        <Button size="xs" variant="error" icon={Trash2} onClick={onDelete}>
          Delete
        </Button>
      </div>
    </div>
  );
}
