'use client';

import type {
  CinemaEffectsConfig,
  HslBandId,
  ImageFilterValues,
  LevelsConfig,
} from './types/studio';

import { RotateCcw, Sparkles, Upload } from 'lucide-react';
import { useRef, useState } from 'react';
import { xor } from 'lodash';

import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Selector } from '@/components/ui/selector';
import { Slider } from '@/components/ui/slider';
import { Tabs } from '@/components/ui/tabs';

import {
  BUILTIN_LUT_PRESETS,
  DEFAULT_CINEMA_EFFECTS,
  DEFAULT_FILTER_VALUES,
  DEFAULT_LEVELS_CONFIG,
  DEFAULT_LUT_CONFIG,
  FILTER_PRESETS,
  HSL_BAND_META,
} from './constants';
import CurvesEditor from './curves-editor';
import HistogramCanvas from './histogram-canvas';

type AdjustSubTab = 'basic' | 'curves' | 'hsl' | 'fx';

type Props = {
  isImageSelected: boolean;
  filterValues: ImageFilterValues;
  activeImageEl: HTMLCanvasElement | HTMLImageElement | null;
  filterRevision: number;
  onUpdateFilters: (next: ImageFilterValues, commitLabel?: string) => void;
  onLoadCubeLut: (file: File) => Promise<void>;
};

type SliderSpec = {
  key: Exclude<
    keyof ImageFilterValues,
    'presets' | 'levels' | 'curves' | 'selectiveHsl' | 'cinema' | 'lut'
  >;
  label: string;
  min: number;
  max: number;
  step: number;
  unit?: string;
};

const ADJUSTMENT_SLIDERS: SliderSpec[] = [
  { key: 'brightness', label: 'Brightness', min: -1, max: 1, step: 0.02 },
  { key: 'contrast', label: 'Contrast', min: -1, max: 1, step: 0.02 },
  { key: 'saturation', label: 'Saturation', min: -1, max: 1, step: 0.02 },
  { key: 'vibrance', label: 'Vibrance', min: -1, max: 1, step: 0.02 },
  { key: 'hue', label: 'Hue Shift', min: -180, max: 180, step: 1, unit: '°' },
  { key: 'blur', label: 'Gaussian Blur', min: 0, max: 1, step: 0.01 },
  { key: 'sharpen', label: 'Sharpen', min: 0, max: 1.5, step: 0.05 },
  { key: 'noise', label: 'Film Noise', min: 0, max: 400, step: 10 },
  { key: 'pixelate', label: 'Pixelate', min: 0, max: 40, step: 1, unit: 'px' },
  { key: 'gamma', label: 'Gamma', min: 0.2, max: 2.2, step: 0.05 },
];

const SUB_TABS: AdjustSubTab[] = ['basic', 'curves', 'hsl', 'fx'];

/**
 * Right Inspector Adjust tab featuring Basic WebGL presets, Live Histogram + Levels +
 * 4-Channel RGB Tone Curves, 7-Band Selective HSL, Cinematic GLSL FX, and 3D .cube LUTs.
 */
export default function InspectorAdjustTab({
  isImageSelected,
  filterValues,
  activeImageEl,
  filterRevision,
  onUpdateFilters,
  onLoadCubeLut,
}: Props) {
  const [subTab, setSubTab] = useState<AdjustSubTab>('basic');
  const [activeBand, setActiveBand] = useState<HslBandId>('reds');
  const cubeInputRef = useRef<HTMLInputElement>(null);

  if (!isImageSelected) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-neutral-200 px-4 py-12 text-center text-xs text-neutral-400 dark:border-neutral-800 dark:text-neutral-500">
        <Sparkles className="mb-2 h-7 w-7 stroke-[1.3] opacity-50" />
        <p className="font-semibold text-neutral-500 dark:text-neutral-400">
          Select an Image Layer
        </p>
        <p className="mt-1 text-[11px]">
          WebGL presets, Tone Curves, Selective HSL, Cinematic FX, and 3D LUTs
          apply directly to the selected image layer.
        </p>
      </div>
    );
  }

  const togglePreset = (presetId: string) => {
    const nextPresets = xor(filterValues.presets, [presetId]);
    onUpdateFilters(
      { ...filterValues, presets: nextPresets },
      `Toggle ${presetId} Filter`
    );
  };

  const updateLevels = (patch: Partial<LevelsConfig>, commitLabel?: string) => {
    const nextLevels = { ...filterValues.levels, ...patch };
    onUpdateFilters({ ...filterValues, levels: nextLevels }, commitLabel);
  };

  const currentBandVal = filterValues.selectiveHsl[activeBand];
  const updateBand = (
    patch: Partial<{ hue: number; sat: number; lum: number }>,
    commitLabel?: string
  ) => {
    const nextHsl = {
      ...filterValues.selectiveHsl,
      [activeBand]: { ...currentBandVal, ...patch },
    };
    onUpdateFilters({ ...filterValues, selectiveHsl: nextHsl }, commitLabel);
  };

  const updateCinema = (
    patch: Partial<CinemaEffectsConfig>,
    commitLabel?: string
  ) => {
    const nextCinema = { ...filterValues.cinema, ...patch };
    onUpdateFilters({ ...filterValues, cinema: nextCinema }, commitLabel);
  };

  const lutSelectorOptions =
    filterValues.lut.customDataBase64 && filterValues.lut.id !== 'none'
      ? [
          ...BUILTIN_LUT_PRESETS,
          { label: `★ ${filterValues.lut.name}`, value: filterValues.lut.id },
        ]
      : BUILTIN_LUT_PRESETS;

  return (
    <div className="space-y-4">
      <Tabs<AdjustSubTab>
        tabs={SUB_TABS}
        activeTab={subTab}
        onChange={setSubTab}
        tabLabels={{
          basic: 'Basic',
          curves: 'Curves',
          hsl: 'HSL',
          fx: 'FX & LUT',
        }}
        size="xs"
        fullWidth
        tabClassName="px-1.5"
      />

      {subTab === 'basic' && (
        <div className="space-y-5">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                WebGL Presets
              </Label>
              {filterValues.presets.length > 0 && (
                <button
                  type="button"
                  onClick={() =>
                    onUpdateFilters(
                      { ...filterValues, presets: [] },
                      'Clear Presets'
                    )
                  }
                  className="text-[11px] font-medium text-sky-600 hover:underline dark:text-sky-400"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              {FILTER_PRESETS.map((preset) => (
                <Button
                  key={preset.id}
                  size="xs"
                  variant={
                    filterValues.presets.includes(preset.id)
                      ? 'primary'
                      : 'secondary'
                  }
                  bordered={!filterValues.presets.includes(preset.id)}
                  onClick={() => togglePreset(preset.id)}
                  className="justify-center text-[11px]"
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-3 border-t border-neutral-200/80 pt-4 dark:border-neutral-800/80">
            <Label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              Color &amp; Detail
            </Label>
            {ADJUSTMENT_SLIDERS.map((spec) => (
              <Slider
                key={spec.key}
                title={spec.label}
                min={spec.min}
                max={spec.max}
                step={spec.step}
                unit={spec.unit}
                value={filterValues[spec.key]}
                showValueBadge
                onChange={(e) =>
                  onUpdateFilters({
                    ...filterValues,
                    [spec.key]: parseFloat(e.target.value),
                  })
                }
                onChangeEnd={() =>
                  onUpdateFilters(filterValues, `Adjust ${spec.label}`)
                }
              />
            ))}
          </div>
        </div>
      )}

      {subTab === 'curves' && (
        <div className="space-y-4">
          <HistogramCanvas
            imageElement={activeImageEl}
            revision={filterRevision}
          />

          <div className="space-y-2.5 border-t border-neutral-200/80 pt-3 dark:border-neutral-800/80">
            <div className="flex items-center justify-between">
              <Label className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                Levels
              </Label>
              <button
                type="button"
                onClick={() =>
                  onUpdateFilters(
                    { ...filterValues, levels: DEFAULT_LEVELS_CONFIG },
                    'Reset Levels'
                  )
                }
                className="text-[11px] font-medium text-sky-600 hover:underline dark:text-sky-400"
              >
                Reset
              </button>
            </div>
            <Slider
              title="Black Point"
              min={0}
              max={0.6}
              step={0.01}
              showValueBadge
              value={filterValues.levels.black}
              onChange={(e) =>
                updateLevels({ black: parseFloat(e.target.value) })
              }
              onChangeEnd={() => updateLevels({}, 'Adjust Levels Black Point')}
            />
            <Slider
              title="Midtones (Gamma)"
              min={0.25}
              max={2.5}
              step={0.02}
              showValueBadge
              value={filterValues.levels.midtone}
              onChange={(e) =>
                updateLevels({ midtone: parseFloat(e.target.value) })
              }
              onChangeEnd={() => updateLevels({}, 'Adjust Levels Midtone')}
            />
            <Slider
              title="White Point"
              min={0.4}
              max={1}
              step={0.01}
              showValueBadge
              value={filterValues.levels.white}
              onChange={(e) =>
                updateLevels({ white: parseFloat(e.target.value) })
              }
              onChangeEnd={() => updateLevels({}, 'Adjust Levels White Point')}
            />
          </div>

          <div className="space-y-2 border-t border-neutral-200/80 pt-3 dark:border-neutral-800/80">
            <Label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              Tone Curves
            </Label>
            <CurvesEditor
              curves={filterValues.curves}
              onChange={(nextCurves) =>
                onUpdateFilters({ ...filterValues, curves: nextCurves })
              }
              onChangeEnd={(nextCurves, label) =>
                onUpdateFilters({ ...filterValues, curves: nextCurves }, label)
              }
            />
          </div>
        </div>
      )}

      {subTab === 'hsl' && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              Selective Color Mixer
            </Label>
            <div className="grid grid-cols-7 gap-1">
              {HSL_BAND_META.map((band) => (
                <button
                  key={band.id}
                  type="button"
                  title={band.label}
                  aria-label={band.label}
                  onClick={() => setActiveBand(band.id)}
                  style={{ backgroundColor: band.color }}
                  className={cn(
                    'h-7 rounded-lg transition-transform',
                    activeBand === band.id
                      ? 'scale-105 ring-2 ring-neutral-900 ring-offset-1 dark:ring-white dark:ring-offset-neutral-900'
                      : 'opacity-70 hover:opacity-100'
                  )}
                />
              ))}
            </div>
            <div className="flex items-center justify-between text-xs font-semibold text-neutral-700 dark:text-neutral-200">
              <span className="capitalize">{activeBand}</span>
              <button
                type="button"
                onClick={() =>
                  updateBand({ hue: 0, sat: 0, lum: 0 }, `Reset ${activeBand}`)
                }
                className="text-[11px] font-medium text-sky-600 hover:underline dark:text-sky-400"
              >
                Reset Band
              </button>
            </div>
          </div>

          <Slider
            title="Hue Shift"
            min={-60}
            max={60}
            step={1}
            unit="°"
            showValueBadge
            value={currentBandVal.hue}
            onChange={(e) => updateBand({ hue: Number(e.target.value) })}
            onChangeEnd={() => updateBand({}, `Adjust ${activeBand} Hue`)}
          />
          <Slider
            title="Saturation"
            min={-100}
            max={100}
            step={2}
            unit="%"
            showValueBadge
            value={currentBandVal.sat}
            onChange={(e) => updateBand({ sat: Number(e.target.value) })}
            onChangeEnd={() =>
              updateBand({}, `Adjust ${activeBand} Saturation`)
            }
          />
          <Slider
            title="Luminance"
            min={-100}
            max={100}
            step={2}
            unit="%"
            showValueBadge
            value={currentBandVal.lum}
            onChange={(e) => updateBand({ lum: Number(e.target.value) })}
            onChangeEnd={() => updateBand({}, `Adjust ${activeBand} Luminance`)}
          />
        </div>
      )}

      {subTab === 'fx' && (
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                GLSL Cinema FX
              </Label>
              <button
                type="button"
                onClick={() =>
                  onUpdateFilters(
                    { ...filterValues, cinema: DEFAULT_CINEMA_EFFECTS },
                    'Reset Cinema FX'
                  )
                }
                className="text-[11px] font-medium text-sky-600 hover:underline dark:text-sky-400"
              >
                Reset
              </button>
            </div>
            <Slider
              title="Clarity (Midtone Pop)"
              min={-0.6}
              max={1}
              step={0.02}
              showValueBadge
              value={filterValues.cinema.clarity}
              onChange={(e) =>
                updateCinema({ clarity: parseFloat(e.target.value) })
              }
              onChangeEnd={() => updateCinema({}, 'Adjust Clarity')}
            />
            <Slider
              title="Vignette"
              min={0}
              max={1}
              step={0.02}
              showValueBadge
              value={filterValues.cinema.vignette}
              onChange={(e) =>
                updateCinema({ vignette: parseFloat(e.target.value) })
              }
              onChangeEnd={() => updateCinema({}, 'Adjust Vignette')}
            />
            <Slider
              title="Vignette Feather"
              min={0.15}
              max={1}
              step={0.02}
              showValueBadge
              value={filterValues.cinema.vignetteFeather}
              onChange={(e) =>
                updateCinema({ vignetteFeather: parseFloat(e.target.value) })
              }
              onChangeEnd={() => updateCinema({}, 'Adjust Vignette Feather')}
            />
            <Slider
              title="Film Grain"
              min={0}
              max={1}
              step={0.02}
              showValueBadge
              value={filterValues.cinema.grain}
              onChange={(e) =>
                updateCinema({ grain: parseFloat(e.target.value) })
              }
              onChangeEnd={() => updateCinema({}, 'Adjust Film Grain')}
            />
            <Slider
              title="Chromatic Aberration"
              min={0}
              max={1}
              step={0.02}
              showValueBadge
              value={filterValues.cinema.chromatic}
              onChange={(e) =>
                updateCinema({ chromatic: parseFloat(e.target.value) })
              }
              onChangeEnd={() =>
                updateCinema({}, 'Adjust Chromatic Aberration')
              }
            />
          </div>

          <div className="space-y-3 border-t border-neutral-200/80 pt-3 dark:border-neutral-800/80">
            <Label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              3D Color LUT (.cube)
            </Label>
            <Selector
              size="sm"
              options={lutSelectorOptions}
              value={filterValues.lut.id}
              onChange={(val) => {
                if (val === filterValues.lut.id) return;
                if (val === 'none') {
                  onUpdateFilters(
                    { ...filterValues, lut: DEFAULT_LUT_CONFIG },
                    'Remove 3D LUT'
                  );
                  return;
                }
                onUpdateFilters(
                  {
                    ...filterValues,
                    lut: {
                      id: val,
                      name: val,
                      size: 17,
                      intensity: filterValues.lut.intensity || 1,
                      customDataBase64: '',
                    },
                  },
                  `Apply ${val} LUT`
                );
              }}
            />

            <Button
              size="xs"
              variant="secondary"
              bordered
              icon={Upload}
              onClick={() => cubeInputRef.current?.click()}
              className="w-full"
            >
              Import Custom .cube LUT
            </Button>
            <input
              ref={cubeInputRef}
              type="file"
              accept=".cube"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void onLoadCubeLut(file);
                e.target.value = '';
              }}
            />

            {filterValues.lut.id !== 'none' && (
              <Slider
                title="LUT Intensity"
                min={0}
                max={1}
                step={0.02}
                showValueBadge
                value={filterValues.lut.intensity}
                onChange={(e) =>
                  onUpdateFilters({
                    ...filterValues,
                    lut: {
                      ...filterValues.lut,
                      intensity: parseFloat(e.target.value),
                    },
                  })
                }
                onChangeEnd={() => onUpdateFilters(filterValues, 'LUT Blend')}
              />
            )}
          </div>
        </div>
      )}

      <Button
        variant="outline"
        size="xs"
        icon={RotateCcw}
        onClick={() =>
          onUpdateFilters(DEFAULT_FILTER_VALUES, 'Reset All Filters')
        }
        className="w-full"
      >
        Reset All Adjustments
      </Button>
    </div>
  );
}
