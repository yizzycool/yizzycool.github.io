'use client';

import type {
  CanvasWatermarkConfig,
  CaptionConfig,
} from '../../../types/config';

import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Trash2,
  Type,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ColorPicker } from '@/components/ui/color-picker';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';

import PanelLabel from '../../panel-label';

type Props = {
  selectedCaption: CaptionConfig | null;
  watermark: CanvasWatermarkConfig;
  onAddCaption: (text?: string) => void;
  onUpdateCaption: (patch: Partial<CaptionConfig>) => void;
  onDeleteCaption: () => void;
  onUpdateWatermark: (patch: Partial<CanvasWatermarkConfig>) => void;
  onChangeEnd?: () => void;
};

/**
 * Lightweight Quick Caption & Tiled Diagonal Watermark controls for PicMerge Studio.
 */
export default function CaptionWatermark({
  selectedCaption,
  watermark,
  onAddCaption,
  onUpdateCaption,
  onDeleteCaption,
  onUpdateWatermark,
  onChangeEnd,
}: Props) {
  return (
    <div className="space-y-4 px-0.5">
      {/* Quick Caption */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <PanelLabel>Quick Captions</PanelLabel>
          <Button
            size="xs"
            variant="primary"
            icon={Type}
            onClick={() => onAddCaption('Title Here')}
          >
            Add Caption
          </Button>
        </div>

        {selectedCaption ? (
          <div className="space-y-2.5 rounded-xl border border-neutral-200/70 bg-neutral-50/70 p-2.5 dark:border-neutral-800/70 dark:bg-neutral-900/50">
            <Input
              value={selectedCaption.text}
              onChange={(e) => onUpdateCaption({ text: e.target.value })}
              onBlur={onChangeEnd}
              placeholder="Caption text..."
              className="text-xs"
            />
            <Slider
              title="Font Size"
              min={14}
              max={180}
              step={2}
              value={selectedCaption.fontSize}
              showValueBadge
              onChange={(e) =>
                onUpdateCaption({ fontSize: Number(e.target.value) })
              }
              onChangeEnd={onChangeEnd}
            />
            <div className="flex items-center justify-between gap-1.5">
              <ColorPicker
                variant="solid"
                value={selectedCaption.fill}
                onColorChange={(fill) => onUpdateCaption({ fill })}
                onChangeEnd={onChangeEnd}
                buttonClassName="!h-6 !w-6"
              />
              <Button
                size="xs"
                variant={
                  selectedCaption.fontWeight === 'bold'
                    ? 'primary'
                    : 'secondary'
                }
                bordered={selectedCaption.fontWeight !== 'bold'}
                icon={Bold}
                onClick={() => {
                  onUpdateCaption({
                    fontWeight:
                      selectedCaption.fontWeight === 'bold' ? 'normal' : 'bold',
                  });
                  onChangeEnd?.();
                }}
                aria-label="Toggle Bold"
              />
              <Button
                size="xs"
                variant={
                  selectedCaption.textAlign === 'left' ? 'primary' : 'secondary'
                }
                bordered={selectedCaption.textAlign !== 'left'}
                icon={AlignLeft}
                onClick={() => {
                  onUpdateCaption({ textAlign: 'left' });
                  onChangeEnd?.();
                }}
                aria-label="Align Left"
              />
              <Button
                size="xs"
                variant={
                  selectedCaption.textAlign === 'center'
                    ? 'primary'
                    : 'secondary'
                }
                bordered={selectedCaption.textAlign !== 'center'}
                icon={AlignCenter}
                onClick={() => {
                  onUpdateCaption({ textAlign: 'center' });
                  onChangeEnd?.();
                }}
                aria-label="Align Center"
              />
              <Button
                size="xs"
                variant={
                  selectedCaption.textAlign === 'right'
                    ? 'primary'
                    : 'secondary'
                }
                bordered={selectedCaption.textAlign !== 'right'}
                icon={AlignRight}
                onClick={() => {
                  onUpdateCaption({ textAlign: 'right' });
                  onChangeEnd?.();
                }}
                aria-label="Align Right"
              />
              <Button
                size="xs"
                variant="ghost"
                icon={Trash2}
                onClick={onDeleteCaption}
                className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40"
                aria-label="Delete Caption"
              />
            </div>
          </div>
        ) : (
          <p className="text-[11px] text-neutral-400 dark:text-neutral-500">
            Click &ldquo;Add Caption&rdquo; or select any text on canvas to
            edit.
          </p>
        )}
      </div>

      {/* Diagonal Watermark */}
      <div className="space-y-2.5 border-t border-neutral-200/70 pt-3 dark:border-neutral-800/70">
        <div className="flex items-center justify-between">
          <PanelLabel>Tiled Watermark</PanelLabel>
          <Switch
            size="sm"
            checked={watermark.enabled}
            onChange={(enabled) => {
              onUpdateWatermark({ enabled });
              onChangeEnd?.();
            }}
          />
        </div>

        {watermark.enabled && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Input
                value={watermark.text}
                onChange={(e) => onUpdateWatermark({ text: e.target.value })}
                onBlur={onChangeEnd}
                placeholder="© Your Name"
                className="flex-1 text-xs"
              />
              <ColorPicker
                variant="solid"
                value={watermark.color}
                onColorChange={(color) => onUpdateWatermark({ color })}
                onChangeEnd={onChangeEnd}
                buttonClassName="!h-7 !w-7 shrink-0"
              />
            </div>
            <Slider
              title="Size"
              min={14}
              max={96}
              step={2}
              value={watermark.fontSize}
              showValueBadge
              onChange={(e) =>
                onUpdateWatermark({ fontSize: Number(e.target.value) })
              }
              onChangeEnd={onChangeEnd}
            />
            <Slider
              title="Opacity"
              min={0.05}
              max={0.85}
              step={0.05}
              value={watermark.opacity}
              showValueBadge
              onChange={(e) =>
                onUpdateWatermark({ opacity: Number(e.target.value) })
              }
              onChangeEnd={onChangeEnd}
            />
            <Slider
              title="Angle"
              min={-60}
              max={60}
              step={5}
              value={watermark.angle}
              showValueBadge
              onChange={(e) =>
                onUpdateWatermark({ angle: Number(e.target.value) })
              }
              onChangeEnd={onChangeEnd}
            />
          </div>
        )}
      </div>
    </div>
  );
}
