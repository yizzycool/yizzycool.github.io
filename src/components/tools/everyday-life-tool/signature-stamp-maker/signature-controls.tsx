'use client';

import type { PaperGuide, SignatureSettings } from './types';

import { SlidersHorizontal, Touchpad } from 'lucide-react';

import SettingHeader from '@/components/tools/common/setting-header';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Surface } from '@/components/ui/surface';
import { Switch } from '@/components/ui/switch';
import { PillTabs } from '@/components/ui/tabs';
import { cn } from '@/utils/cn';

import {
  PAPER_GUIDES,
  PAPER_GUIDE_LABELS,
  SIGNATURE_INK_COLORS,
} from './constants';

import InkColorSelector from './ink-color-selector';

interface Props {
  settings: SignatureSettings;
  isTrackpadDrawing: boolean;
  onUpdateSettings: (patch: Partial<SignatureSettings>) => void;
}

export default function SignatureControls({
  settings,
  isTrackpadDrawing,
  onUpdateSettings,
}: Props) {
  return (
    <Surface rounded="2xl" className="space-y-5 p-5 text-left">
      <div className="flex items-center gap-2 border-b border-neutral-200/70 pb-3 dark:border-neutral-800">
        <SlidersHorizontal className="h-4 w-4 text-sky-500" />
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
          Pen & Input Settings
        </h2>
      </div>

      {/* Trackpad Mode (Hold Shift to Draw without clicking) */}
      <Surface
        variant={settings.trackpadMode ? 'blue' : 'default'}
        rounded="xl"
        className="p-3.5"
      >
        <Switch
          checked={settings.trackpadMode}
          onChange={(trackpadMode) => onUpdateSettings({ trackpadMode })}
          label="Trackpad Mode"
          icon={Touchpad}
          highlightIconOnChecked
          size="sm"
          className="w-full justify-between"
        />

        {settings.trackpadMode && (
          <div className="mt-2.5 flex items-center">
            <Badge
              variant={isTrackpadDrawing ? 'success' : 'blue'}
              size="xs"
              rounded="full"
              className="gap-1.5"
            >
              <span
                className={cn(
                  'h-1.5 w-1.5 rounded-full',
                  isTrackpadDrawing ? 'bg-emerald-500' : 'bg-sky-500'
                )}
              />
              {isTrackpadDrawing
                ? 'Drawing — Release Shift to Lift'
                : 'Hold Shift + Glide Trackpad'}
            </Badge>
          </div>
        )}

        <p className="mt-2 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
          Hold{' '}
          <strong className="font-mono text-slate-700 dark:text-slate-200">
            Shift
          </strong>{' '}
          and glide lightly on MacBook or laptop trackpads to sign without
          holding down a click. Release{' '}
          <strong className="font-mono text-slate-700 dark:text-slate-200">
            Shift
          </strong>{' '}
          to lift pen.
        </p>
      </Surface>

      {/* Ink Color */}
      <InkColorSelector
        label="Ink Color"
        value={settings.color}
        presets={SIGNATURE_INK_COLORS}
        onChange={(color) => onUpdateSettings({ color })}
      />

      {/* Stroke Thickness */}
      <Slider
        id="sig-stroke-width"
        title="Stroke Weight"
        min={2}
        max={12}
        step={0.5}
        value={settings.baseWidth}
        showValueBadge
        unit=" px"
        onChange={(e) =>
          onUpdateSettings({ baseWidth: Number(e.target.value) })
        }
      />

      {/* Anti-Jitter Smoothing */}
      <Slider
        id="sig-smoothing"
        title="Ink Smoothing"
        min={0}
        max={100}
        step={5}
        value={settings.smoothing}
        showValueBadge
        unit="%"
        onChange={(e) =>
          onUpdateSettings({ smoothing: Number(e.target.value) })
        }
      />

      {/* Canvas Paper Guide */}
      <div className="space-y-2">
        <SettingHeader label="Paper Guide" />
        <PillTabs<PaperGuide>
          tabs={PAPER_GUIDES}
          activeTab={settings.guide}
          onChange={(guide) => onUpdateSettings({ guide })}
          tabLabels={PAPER_GUIDE_LABELS}
          variant="segment"
          size="xs"
          rounded="lg"
          className="w-full p-0.5"
          tabClassName="flex-1 py-1 text-center"
        />
      </div>
    </Surface>
  );
}
