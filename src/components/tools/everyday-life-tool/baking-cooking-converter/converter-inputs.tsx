'use client';

import type { RefObject } from 'react';
import type { MeasurementUnit } from './types';

import { Scale } from 'lucide-react';

import { DeleteAction } from '@/components/shared/action-button';
import { Chip } from '@/components/ui/chip';
import { Input } from '@/components/ui/input';
import { Selector } from '@/components/ui/selector';
import { Slider } from '@/components/ui/slider';

import LabelBar from '../../common/label-bar';
import {
  AMOUNT_PRESETS,
  MEASUREMENT_UNIT_OPTIONS,
  PAN_SCALE_PRESETS,
  SCALE_PRESETS,
} from './constants';

type Props = {
  amountInput: string;
  onAmountChange: (value: string) => void;
  amountInputRef: RefObject<HTMLInputElement | null>;
  unit: MeasurementUnit;
  onUnitChange: (unit: MeasurementUnit) => void;
  scaleMultiplier: number;
  onScaleChange: (scale: number) => void;
  onReset: () => void;
};

/**
 * Frameless measurement input, unit selector, and recipe batch / cake pan scaler.
 */
export default function ConverterInputs({
  amountInput,
  onAmountChange,
  amountInputRef,
  unit,
  onUnitChange,
  scaleMultiplier,
  onScaleChange,
  onReset,
}: Props) {
  return (
    <section aria-labelledby="converter-inputs-heading" className="text-left">
      <LabelBar
        id="converter-inputs-heading"
        label="2. Amount, Unit & Recipe Scale"
        icon={Scale}
        htmlFor="baking-amount-input"
      >
        <DeleteAction label="Reset" successToast={false} onClick={onReset} />
      </LabelBar>

      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-12">
          <div className="sm:col-span-5">
            <Input
              ref={amountInputRef}
              id="baking-amount-input"
              type="number"
              inputMode="decimal"
              value={amountInput}
              onChange={(e) => onAmountChange(e.target.value)}
              onClear={() => onAmountChange('')}
              placeholder="Enter quantity (e.g. 1.5)"
              className="font-mono text-sm"
            />
          </div>
          <div className="sm:col-span-7">
            <Selector
              size="sm"
              options={MEASUREMENT_UNIT_OPTIONS.map((opt) => ({
                label: opt.label,
                value: opt.value,
              }))}
              value={unit}
              onChange={(val) => onUnitChange(val as MeasurementUnit)}
            />
          </div>
        </div>

        {/* Quick Quantity Chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
            Quick Amount:
          </span>
          {AMOUNT_PRESETS.map((preset) => (
            <Chip
              key={preset}
              selected={Number(amountInput) === preset}
              onClick={() => onAmountChange(String(preset))}
              className="px-2.5 py-0.5 font-mono text-xs"
            >
              {preset}
            </Chip>
          ))}
        </div>

        {/* Recipe Batch & Pan Scaler */}
        <div className="space-y-3 rounded-xl border border-neutral-200/80 bg-white/55 p-3.5 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-900/40">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-200">
              Recipe Scale Multiplier
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              {SCALE_PRESETS.map((preset) => (
                <Chip
                  key={preset}
                  selected={scaleMultiplier === preset}
                  onClick={() => onScaleChange(preset)}
                  className="px-2 py-0.5 font-mono text-[11px]"
                >
                  {preset}×
                </Chip>
              ))}
            </div>
          </div>

          <Slider
            min={0.25}
            max={4}
            step={0.25}
            value={scaleMultiplier}
            showValueBadge
            unit="×"
            onChange={(e) => onScaleChange(Number(e.target.value))}
            ariaLabel="Recipe batch scale multiplier"
          />

          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="mr-1 text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
              Round Pan Size:
            </span>
            {PAN_SCALE_PRESETS.map((pan) => (
              <Chip
                key={pan.id}
                selected={Math.abs(scaleMultiplier - pan.multiplier) < 0.01}
                onClick={() => onScaleChange(pan.multiplier)}
                title={pan.detail}
                className="px-2.5 py-0.5 text-[11px]"
              >
                {pan.label} ({pan.multiplier}×)
              </Chip>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
