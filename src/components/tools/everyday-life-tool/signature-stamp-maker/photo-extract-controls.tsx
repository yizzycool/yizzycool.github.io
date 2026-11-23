'use client';

import type { PhotoColorMode, PhotoCrop, PhotoExtractSettings } from './types';

import { Crop, RotateCcw, ScanLine, SunMedium } from 'lucide-react';

import SettingHeader from '@/components/tools/common/setting-header';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Surface } from '@/components/ui/surface';
import { Switch } from '@/components/ui/switch';
import { PillTabs } from '@/components/ui/tabs';

import {
  DEFAULT_PHOTO_CROP,
  PHOTO_COLOR_MODES,
  PHOTO_COLOR_MODE_LABELS,
  SIGNATURE_INK_COLORS,
} from './constants';

import InkColorSelector from './ink-color-selector';

interface Props {
  settings: PhotoExtractSettings;
  onUpdateSettings: (patch: Partial<PhotoExtractSettings>) => void;
}

const CROP_SIDES: Array<{ key: keyof PhotoCrop; label: string }> = [
  { key: 'top', label: 'Top' },
  { key: 'bottom', label: 'Bottom' },
  { key: 'left', label: 'Left' },
  { key: 'right', label: 'Right' },
];

export default function PhotoExtractControls({
  settings,
  onUpdateSettings,
}: Props) {
  const isCropDirty =
    settings.crop.top > 0 ||
    settings.crop.bottom > 0 ||
    settings.crop.left > 0 ||
    settings.crop.right > 0;

  const updateCropSide = (key: keyof PhotoCrop, value: number) => {
    onUpdateSettings({
      crop: {
        ...settings.crop,
        [key]: value,
      },
    });
  };

  return (
    <Surface rounded="2xl" className="space-y-5 p-5 text-left">
      <div className="flex items-center gap-2 border-b border-neutral-200/70 pb-3 dark:border-neutral-800">
        <ScanLine className="h-4 w-4 text-sky-500" />
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
          Extraction Tuning
        </h2>
      </div>

      {/* Uneven Shadow & Lighting Correction */}
      <Surface
        variant={settings.normalizeLighting ? 'blue' : 'default'}
        rounded="xl"
        className="p-3.5"
      >
        <Switch
          checked={settings.normalizeLighting}
          onChange={(normalizeLighting) =>
            onUpdateSettings({ normalizeLighting })
          }
          label="Shadow & Lighting Fix"
          icon={SunMedium}
          highlightIconOnChecked
          size="sm"
          className="w-full justify-between"
        />

        <p className="mt-2 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
          Evens out phone shadows and warm paper tint before removing the
          background.
        </p>
      </Surface>

      {/* Threshold */}
      <Slider
        id="photo-threshold"
        title="Background Cutoff"
        min={120}
        max={245}
        step={1}
        value={settings.threshold}
        showValueBadge
        onChange={(e) =>
          onUpdateSettings({ threshold: Number(e.target.value) })
        }
      />

      {/* Edge Softness */}
      <Slider
        id="photo-softness"
        title="Edge Softness"
        min={4}
        max={60}
        step={1}
        value={settings.softness}
        showValueBadge
        onChange={(e) => onUpdateSettings({ softness: Number(e.target.value) })}
      />

      {/* Ink Strength */}
      <Slider
        id="photo-ink-strength"
        title="Ink Contrast"
        min={60}
        max={180}
        step={5}
        value={settings.inkStrength}
        showValueBadge
        unit="%"
        onChange={(e) =>
          onUpdateSettings({ inkStrength: Number(e.target.value) })
        }
      />

      {/* Color Mode & Recolor Picker */}
      <div className="space-y-3">
        <SettingHeader label="Ink Output Color" />
        <PillTabs<PhotoColorMode>
          tabs={PHOTO_COLOR_MODES}
          activeTab={settings.colorMode}
          onChange={(colorMode) => onUpdateSettings({ colorMode })}
          tabLabels={PHOTO_COLOR_MODE_LABELS}
          variant="segment"
          size="xs"
          rounded="lg"
          className="w-full p-0.5"
          tabClassName="flex-1 py-1 text-center"
        />

        {settings.colorMode === 'recolor' && (
          <InkColorSelector
            label="Target Ink"
            value={settings.recolorHex}
            presets={SIGNATURE_INK_COLORS}
            onChange={(recolorHex) => onUpdateSettings({ recolorHex })}
          />
        )}
      </div>

      {/* Edge Margin Crop */}
      <div className="space-y-3 border-t border-neutral-200/70 pt-4 dark:border-neutral-800">
        <div className="flex items-center justify-between">
          <SettingHeader label="Trim Photo Edges" icon={Crop} />
          <Button
            variant="ghost"
            size="xs"
            rounded="md"
            icon={RotateCcw}
            disabled={!isCropDirty}
            onClick={() => onUpdateSettings({ crop: DEFAULT_PHOTO_CROP })}
          >
            Reset
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {CROP_SIDES.map(({ key, label }) => (
            <Slider
              key={key}
              id={`photo-crop-${key}`}
              title={label}
              min={0}
              max={40}
              step={1}
              value={settings.crop[key]}
              showValueBadge
              unit="%"
              onChange={(e) => updateCropSide(key, Number(e.target.value))}
            />
          ))}
        </div>
      </div>
    </Surface>
  );
}
