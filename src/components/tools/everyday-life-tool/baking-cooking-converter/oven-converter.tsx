'use client';

import type { OvenConversionResult, OvenTempUnit } from './types';

import { Flame } from 'lucide-react';

import { Chip } from '@/components/ui/chip';
import { Input } from '@/components/ui/input';
import { Tabs } from '@/components/ui/tabs';

import LabelBar from '../../common/label-bar';
import { PropertyResultSection } from '../../common/property-row';
import {
  OVEN_TEMP_PRESETS,
  OVEN_UNIT_LABELS,
  OVEN_UNIT_TABS,
} from './constants';

type Props = {
  ovenValue: string;
  onOvenValueChange: (val: string) => void;
  ovenUnit: OvenTempUnit;
  onSelectOvenUnit: (unit: OvenTempUnit) => void;
  ovenResult: OvenConversionResult;
  onCopyAll: () => void;
};

/**
 * Oven temperature converter translating Celsius, Fahrenheit, Convection fan offset, and UK Gas Mark.
 */
export default function OvenConverter({
  ovenValue,
  onOvenValueChange,
  ovenUnit,
  onSelectOvenUnit,
  ovenResult,
  onCopyAll,
}: Props) {
  return (
    <div className="space-y-6 text-left">
      <section aria-labelledby="oven-input-heading">
        <LabelBar
          id="oven-input-heading"
          label="Oven Temperature Input"
          description="Automatically calculates Conventional °C / °F, Fan Convection (-20°C rule), and UK Gas Mark."
          icon={Flame}
          htmlFor="oven-temp-input"
        />

        <div className="space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Input
              id="oven-temp-input"
              type="number"
              inputMode="decimal"
              value={ovenValue}
              onChange={(e) => onOvenValueChange(e.target.value)}
              placeholder={ovenUnit === 'c' ? '180' : '356'}
              className="font-mono text-sm sm:w-48"
            />
            <Tabs<OvenTempUnit>
              tabs={OVEN_UNIT_TABS}
              activeTab={ovenUnit}
              onChange={onSelectOvenUnit}
              tabLabels={OVEN_UNIT_LABELS}
              size="sm"
              variant="segment"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mr-1 text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
              Baking Heat Presets:
            </span>
            {OVEN_TEMP_PRESETS.map((preset) => (
              <Chip
                key={preset.id}
                selected={Math.round(ovenResult.celsius) === preset.celsius}
                onClick={() => {
                  onOvenValueChange(
                    ovenUnit === 'c'
                      ? String(preset.celsius)
                      : String(Math.round((preset.celsius * 9) / 5 + 32))
                  );
                }}
                className="px-2.5 py-1 text-xs"
              >
                {preset.label} · {preset.useCase}
              </Chip>
            ))}
          </div>
        </div>
      </section>

      <PropertyResultSection
        title="Oven Temperature Equivalents"
        titleIcon={Flame}
        grouped
        columns={1}
        count={ovenResult.items.length}
        countBadgeText="5 Settings"
        items={ovenResult.items}
        onCopyAll={onCopyAll}
      />
    </div>
  );
}
