'use client';

import type {
  StampBorderStyle,
  StampFontStyle,
  StampSettings,
  StampShape,
} from './types';

import { Stamp } from 'lucide-react';

import SettingHeader from '@/components/tools/common/setting-header';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Surface } from '@/components/ui/surface';
import { Tabs } from '@/components/ui/tabs';

import {
  STAMP_BORDER_LABELS,
  STAMP_BORDER_STYLES,
  STAMP_FONT_LABELS,
  STAMP_FONT_STYLES,
  STAMP_INK_COLORS,
  STAMP_SHAPES,
  STAMP_SHAPE_LABELS,
} from './constants';

import InkColorSelector from './ink-color-selector';

interface Props {
  settings: StampSettings;
  onUpdateSettings: (patch: Partial<StampSettings>) => void;
}

export default function StampControls({ settings, onUpdateSettings }: Props) {
  return (
    <Surface rounded="2xl" className="space-y-5 p-5 text-left">
      <div className="flex items-center gap-2 border-b border-neutral-200/70 pb-3 dark:border-neutral-800">
        <Stamp className="h-4 w-4 text-sky-500" />
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
          Stamp Customization
        </h2>
      </div>

      {/* Shape */}
      <div className="space-y-2">
        <SettingHeader label="Stamp Shape" />
        <Tabs<StampShape>
          tabs={STAMP_SHAPES}
          activeTab={settings.shape}
          onChange={(shape) => onUpdateSettings({ shape })}
          tabLabels={STAMP_SHAPE_LABELS}
          variant="segment"
          size="xs"
          rounded="lg"
          className="w-full p-0.5"
          tabClassName="flex-1 py-1 text-center"
        />
      </div>

      {/* Primary Text & Subtitle */}
      <div className="space-y-3">
        <div className="space-y-1.5">
          <label htmlFor="stamp-primary-text" className="block">
            <SettingHeader label="Primary Text / Name" />
          </label>
          <Input
            id="stamp-primary-text"
            value={settings.text}
            onChange={(e) =>
              onUpdateSettings({ text: e.target.value.slice(0, 24) })
            }
            placeholder="e.g. APPROVED or John Doe"
            className="text-xs"
          />
          <p className="text-[11px] text-slate-400 dark:text-slate-500">
            2–4 CJK characters auto-arrange in traditional vertical seal layout.
          </p>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="stamp-subtitle-text" className="block">
            <SettingHeader label="Subtitle (Optional)" />
          </label>
          <Input
            id="stamp-subtitle-text"
            value={settings.subtitle}
            onChange={(e) =>
              onUpdateSettings({ subtitle: e.target.value.slice(0, 24) })
            }
            placeholder="e.g. VERIFIED / 2026"
            className="text-xs"
          />
        </div>
      </div>

      {/* Typography Style */}
      <div className="space-y-2">
        <SettingHeader label="Typography Style" />
        <Tabs<StampFontStyle>
          tabs={STAMP_FONT_STYLES}
          activeTab={settings.fontStyle}
          onChange={(fontStyle) => onUpdateSettings({ fontStyle })}
          tabLabels={STAMP_FONT_LABELS}
          variant="segment"
          size="xs"
          rounded="lg"
          className="w-full p-0.5"
          tabClassName="flex-1 py-1 text-center"
        />
      </div>

      {/* Stamp Pad Color */}
      <InkColorSelector
        label="Stamp Pad Color"
        value={settings.color}
        presets={STAMP_INK_COLORS}
        onChange={(color) => onUpdateSettings({ color })}
      />

      {/* Border Style & Weight */}
      <div className="space-y-3">
        <SettingHeader label="Border Frame" />
        <Tabs<StampBorderStyle>
          tabs={STAMP_BORDER_STYLES}
          activeTab={settings.borderStyle}
          onChange={(borderStyle) => onUpdateSettings({ borderStyle })}
          tabLabels={STAMP_BORDER_LABELS}
          variant="segment"
          size="xs"
          rounded="lg"
          className="w-full p-0.5"
          tabClassName="flex-1 py-1 text-center"
        />

        <Slider
          id="stamp-border-width"
          title="Border Weight"
          min={2}
          max={12}
          step={1}
          value={settings.borderWidth}
          showValueBadge
          unit=" px"
          onChange={(e) =>
            onUpdateSettings({ borderWidth: Number(e.target.value) })
          }
        />
      </div>

      {/* Ink Distress Texture */}
      <Slider
        id="stamp-distress"
        title="Ink Grain / Vintage Wear"
        min={0}
        max={100}
        step={2}
        value={settings.distress}
        showValueBadge
        unit="%"
        onChange={(e) => onUpdateSettings({ distress: Number(e.target.value) })}
      />
    </Surface>
  );
}
