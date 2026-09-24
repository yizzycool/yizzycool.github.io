'use client';

import type { filters } from 'fabric';
import type { FabricFilterValuesMap } from '../../../types/fabric-helper';
import type {
  AdjustmentFilterConfig,
  PresetFilterType,
} from '../../../data/fabric-filters';

import { useState } from 'react';
import { RotateCcw, SlidersHorizontal, Sparkles } from 'lucide-react';
import { round, xor } from 'lodash';

import { PillTabs } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';

import {
  ADJUSTMENT_FILTER_CONFIGS,
  PRESET_FILTER_TYPES,
} from '../../../data/fabric-filters';
import PresetCard from './preset-card';
import AdjustmentItem from './adjustment-item';

type Props = {
  filters: filters.BaseFilter<string>[];
  setFilters: (filters: string[], params?: FabricFilterValuesMap) => void;
  onChangeEnd?: () => void;
};

type TabType = 'presets' | 'adjustments';

export default function Filters({ filters, setFilters, onChangeEnd }: Props) {
  const [activeTab, setActiveTab] = useState<TabType>('presets');

  const activePresetTypes = filters
    .map((f) => f.type)
    .filter((type): type is PresetFilterType =>
      (PRESET_FILTER_TYPES as readonly string[]).includes(type)
    );

  const getAdjustmentValue = (config: AdjustmentFilterConfig) => {
    const f = filters.find((item) => item.type === config.type);
    if (!f) return config.neutral;
    const record = f as unknown as Record<string, number | undefined>;
    const val = record[config.paramKey];
    return val !== undefined ? round(val, 2) : config.default;
  };

  const handleTogglePreset = (type: PresetFilterType) => {
    const nextPresets = xor(activePresetTypes, [type]);

    const activeAdjConfigs = ADJUSTMENT_FILTER_CONFIGS.filter((cfg) => {
      const val = getAdjustmentValue(cfg);
      return Math.abs(val - cfg.neutral) > 0.0001;
    });

    const adjTypes = activeAdjConfigs.map((cfg) => cfg.type);
    const params: FabricFilterValuesMap = {};
    activeAdjConfigs.forEach((cfg) => {
      const val = getAdjustmentValue(cfg);
      const paramVal =
        cfg.type === 'Pixelate' && val > 0 ? Math.max(2, Math.round(val)) : val;
      params[cfg.type] = {
        [cfg.paramKey]: paramVal,
      };
    });

    setFilters([...nextPresets, ...adjTypes], params);
  };

  const handleResetPresets = () => {
    const activeAdjConfigs = ADJUSTMENT_FILTER_CONFIGS.filter((cfg) => {
      const val = getAdjustmentValue(cfg);
      return Math.abs(val - cfg.neutral) > 0.0001;
    });

    const adjTypes = activeAdjConfigs.map((cfg) => cfg.type);
    const params: FabricFilterValuesMap = {};
    activeAdjConfigs.forEach((cfg) => {
      const val = getAdjustmentValue(cfg);
      const paramVal =
        cfg.type === 'Pixelate' && val > 0 ? Math.max(2, Math.round(val)) : val;
      params[cfg.type] = {
        [cfg.paramKey]: paramVal,
      };
    });

    setFilters(adjTypes, params);
  };

  const handleAdjustmentChange = (
    config: AdjustmentFilterConfig,
    rawVal: number
  ) => {
    const nextVal = round(rawVal, 2);
    const isTargetNeutral = Math.abs(nextVal - config.neutral) < 0.0001;

    const nextAdjustments: Array<{
      config: AdjustmentFilterConfig;
      val: number;
    }> = [];

    ADJUSTMENT_FILTER_CONFIGS.forEach((cfg) => {
      if (cfg.type === config.type) {
        if (!isTargetNeutral) {
          nextAdjustments.push({ config: cfg, val: nextVal });
        }
      } else {
        const val = getAdjustmentValue(cfg);
        if (Math.abs(val - cfg.neutral) > 0.0001) {
          nextAdjustments.push({ config: cfg, val });
        }
      }
    });

    const adjTypes = nextAdjustments.map((a) => a.config.type);
    const params: FabricFilterValuesMap = {};
    nextAdjustments.forEach((a) => {
      const paramVal =
        a.config.type === 'Pixelate' && a.val > 0
          ? Math.max(2, Math.round(a.val))
          : a.val;
      params[a.config.type] = {
        [a.config.paramKey]: paramVal,
      };
    });

    setFilters([...activePresetTypes, ...adjTypes], params);
  };

  const handleResetSingleAdjustment = (config: AdjustmentFilterConfig) => {
    handleAdjustmentChange(config, config.neutral);
  };

  const handleResetAllAdjustments = () => {
    setFilters([...activePresetTypes], {});
  };

  const hasActivePresets = activePresetTypes.length > 0;
  const hasActiveAdjustments = ADJUSTMENT_FILTER_CONFIGS.some((cfg) => {
    const val = getAdjustmentValue(cfg);
    return Math.abs(val - cfg.neutral) > 0.0001;
  });

  return (
    <div className="space-y-3">
      <PillTabs<TabType>
        tabs={['presets', 'adjustments']}
        activeTab={activeTab}
        onChange={(tab) => setActiveTab(tab)}
        tabLabels={{
          presets: 'Presets',
          adjustments: 'Adjust',
        }}
        tabIcons={{
          presets: Sparkles,
          adjustments: SlidersHorizontal,
        }}
        tabBadges={{
          presets: hasActivePresets ? (
            <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
          ) : null,
          adjustments: hasActiveAdjustments ? (
            <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
          ) : null,
        }}
        size="xs"
        fullWidth
        className="mb-3.5"
      />

      {activeTab === 'presets' && (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2.5">
            {PRESET_FILTER_TYPES.map((type) => (
              <PresetCard
                key={type}
                type={type}
                activePresetTypes={activePresetTypes}
                onToggle={handleTogglePreset}
              />
            ))}
          </div>

          <div className="pt-1">
            <Button
              variant="outline"
              size="xs"
              icon={RotateCcw}
              onClick={handleResetPresets}
              className="w-full text-neutral-600 dark:text-neutral-300"
              disabled={!hasActivePresets}
            >
              Reset Presets
            </Button>
          </div>
        </div>
      )}

      {activeTab === 'adjustments' && (
        <div className="space-y-3.5">
          <div className="space-y-3 px-0.5">
            {ADJUSTMENT_FILTER_CONFIGS.map((config) => (
              <AdjustmentItem
                key={config.type}
                config={config}
                value={getAdjustmentValue(config)}
                onChange={handleAdjustmentChange}
                onReset={handleResetSingleAdjustment}
                onChangeEnd={onChangeEnd}
              />
            ))}
          </div>

          <div className="pt-1">
            <Button
              variant="outline"
              size="xs"
              icon={RotateCcw}
              onClick={handleResetAllAdjustments}
              className="w-full text-neutral-600 dark:text-neutral-300"
              disabled={!hasActiveAdjustments}
            >
              Reset Adjustments
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
