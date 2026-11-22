'use client';

import type { NoteColor } from './types';

import { Check } from 'lucide-react';

import { cn } from '@/utils/cn';

import { NOTE_COLOR_ORDER, NOTE_COLOR_STYLES } from './constants';

type Props = {
  value: NoteColor;
  onChange: (color: NoteColor) => void;
  size?: 'sm' | 'md';
  className?: string;
};

export default function NoteColorPicker({
  value,
  onChange,
  size = 'sm',
  className,
}: Props) {
  return (
    <div
      className={cn('flex flex-wrap items-center gap-1.5', className)}
      role="radiogroup"
      aria-label="Note color"
    >
      {NOTE_COLOR_ORDER.map((colorKey) => {
        const config = NOTE_COLOR_STYLES[colorKey];
        const isSelected = value === colorKey;

        return (
          <button
            key={colorKey}
            type="button"
            role="radio"
            aria-checked={isSelected}
            aria-label={config.name}
            title={config.name}
            onClick={(e) => {
              e.stopPropagation();
              onChange(colorKey);
            }}
            className={cn(
              'flex items-center justify-center rounded-full border transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-sky-500/40',
              size === 'sm' ? 'size-5' : 'size-6',
              config.swatch,
              isSelected &&
                'ring-2 ring-sky-500 ring-offset-1 dark:ring-offset-neutral-900'
            )}
          >
            {isSelected && (
              <Check
                size={size === 'sm' ? 11 : 13}
                strokeWidth={3}
                className="text-slate-700 dark:text-slate-100"
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
