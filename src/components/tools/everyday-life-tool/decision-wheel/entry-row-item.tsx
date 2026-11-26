'use client';

import type { ChangeEvent, KeyboardEvent } from 'react';
import type { WheelEntry } from './types';

import { useState } from 'react';
import { X } from 'lucide-react';

import { cn } from '@/utils/cn';

import { MAX_LABEL_LENGTH, MAX_PERCENT, MIN_PERCENT } from './constants';
import { clampPercent } from './utils/wheel-math';

type Props = {
  entry: WheelEntry;
  disabled: boolean;
  onChangeLabel: (id: string, label: string) => void;
  onChangePercent: (id: string, percent: number) => void;
  onCycleColor: (id: string) => void;
  onRemove: (id: string) => void;
};

/**
 * Editable single wheel option row with color swatch cycling, label input,
 * and direct manual percentage input.
 */
export default function EntryRowItem({
  entry,
  disabled,
  onChangeLabel,
  onChangePercent,
  onCycleColor,
  onRemove,
}: Props) {
  const [isEditingPercent, setIsEditingPercent] = useState(false);
  const [rawPercent, setRawPercent] = useState('');

  const handlePercentFocus = () => {
    setRawPercent(String(clampPercent(entry.weight)));
    setIsEditingPercent(true);
  };

  const handlePercentChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setRawPercent(val);
    const parsed = Number(val);
    if (val.trim() !== '' && Number.isFinite(parsed)) {
      onChangePercent(entry.id, clampPercent(parsed));
    }
  };

  const handlePercentBlur = () => {
    const parsed = Number(rawPercent);
    if (rawPercent.trim() === '' || !Number.isFinite(parsed)) {
      onChangePercent(entry.id, 0);
    } else {
      onChangePercent(entry.id, clampPercent(parsed));
    }
    setIsEditingPercent(false);
  };

  const handlePercentKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    }
  };

  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-lg border px-2.5 py-1.5 transition-colors',
        entry.eliminated
          ? 'border-neutral-200/60 bg-neutral-100/70 opacity-60 dark:border-neutral-800/60 dark:bg-neutral-900/40'
          : 'border-neutral-200/80 bg-white/80 dark:border-neutral-800/80 dark:bg-neutral-900/70'
      )}
    >
      {/* Color Swatch Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => onCycleColor(entry.id)}
        title="Cycle slice color"
        aria-label={`Change color for ${entry.label}`}
        className="h-4 w-4 shrink-0 rounded-full ring-2 ring-white transition-transform hover:scale-110 disabled:cursor-not-allowed dark:ring-neutral-900"
        style={{ backgroundColor: entry.color }}
      />

      {/* Editable Label */}
      <input
        type="text"
        value={entry.label}
        maxLength={MAX_LABEL_LENGTH}
        disabled={disabled}
        onChange={(e) => onChangeLabel(entry.id, e.target.value)}
        aria-label="Option label"
        className={cn(
          'min-w-0 flex-1 bg-transparent text-xs font-medium text-neutral-800 outline-none placeholder:text-neutral-400 focus:text-sky-600 disabled:cursor-not-allowed sm:text-sm dark:text-neutral-100 dark:focus:text-sky-400',
          entry.eliminated && 'line-through'
        )}
      />

      {/* Manual Percentage Input or Eliminated Status */}
      {entry.eliminated ? (
        <span className="shrink-0 rounded-md bg-neutral-200/70 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
          Out
        </span>
      ) : (
        <label className="flex shrink-0 items-center rounded-md border border-neutral-200/80 bg-neutral-50/80 px-2 py-0.5 transition-colors focus-within:border-sky-500/60 focus-within:bg-white dark:border-neutral-700/80 dark:bg-neutral-800/70 dark:focus-within:border-sky-400/60 dark:focus-within:bg-neutral-900">
          <input
            type="number"
            inputMode="decimal"
            min={MIN_PERCENT}
            max={MAX_PERCENT}
            step="any"
            disabled={disabled}
            value={
              isEditingPercent ? rawPercent : String(clampPercent(entry.weight))
            }
            onFocus={handlePercentFocus}
            onChange={handlePercentChange}
            onBlur={handlePercentBlur}
            onKeyDown={handlePercentKeyDown}
            aria-label={`Percentage share for ${entry.label}`}
            className="w-12 bg-transparent text-right font-mono text-xs font-semibold text-neutral-800 outline-none disabled:cursor-not-allowed dark:text-neutral-100 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          <span className="ml-0.5 select-none font-mono text-[11px] font-medium text-neutral-400 dark:text-neutral-500">
            %
          </span>
        </label>
      )}

      {/* Delete Entry Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => onRemove(entry.id)}
        aria-label={`Remove ${entry.label}`}
        title="Remove option"
        className="shrink-0 rounded p-1 text-neutral-400 transition-colors hover:bg-rose-500/10 hover:text-rose-500 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <X size={13} />
      </button>
    </div>
  );
}
