'use client';

import type { Rounded } from '@/types/common';
import type { BadgeSize } from '@/types/common/badge';

import useIsMac from '@/hooks/window/use-is-mac';
import { cn } from '@/utils/cn';
import HotkeySymbolToken from './hotkey-symbol-token';
import HotkeyTooltip from './hotkey-tooltip';

export type HotkeySymbol =
  | 'Mod + Enter'
  | 'Mod + Shift + C'
  | 'Mod + Shift + V'
  | 'Esc'
  | 'Mod + /'
  | '?'
  | 'Mod + S'
  | 'Mod + H';

export type HotkeyItem = {
  symbol: HotkeySymbol;
  label?: string;
  hint?: string;
};

type Props = {
  /** Size variant of the badge (default: 'xs') */
  size?: BadgeSize;
  /** Border radius of the badge (default: 'base') */
  rounded?: Rounded;
  /** Array of hotkey items to render as a group */
  items?: HotkeyItem[];
  /** Single hotkey symbol */
  symbol?: HotkeySymbol;
  /** Single hotkey label (e.g. "Format") */
  label?: string;
  className?: string;
};

export default function HotkeyBadge({
  size = 'xs',
  rounded = 'base',
  items,
  symbol,
  label,
  className = '',
}: Props) {
  const isMac = useIsMac();

  if (isMac === undefined) return null;

  // If rendering a group of hotkeys
  if (items && items.length > 0) {
    return (
      <div className={cn('flex items-center gap-3', className)}>
        {items.map((item, index) => (
          <HotkeyBadge
            key={`${item.symbol}-${index}`}
            size={size}
            symbol={item.symbol}
            label={item.label}
          />
        ))}
      </div>
    );
  }

  if (!symbol) return null;

  const textSizes = {
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
  };

  const paddings = {
    xs: 'px-1.5 py-0.5',
    sm: 'px-2 py-1',
    base: 'px-2.5 py-1.5',
    lg: 'px-3 py-2',
    xl: 'px-3.5 py-2.5 ',
  };

  const roundedMap = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    base: 'rounded',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
    '3xl': 'rounded-3xl',
    full: 'rounded-full',
  };

  return (
    <span
      className={cn(
        'hidden items-center gap-1.5 text-xs text-slate-400 sm:inline-flex dark:text-slate-500',
        textSizes[size],
        className
      )}
    >
      <HotkeyTooltip isMac={isMac} symbol={symbol}>
        <kbd
          className={cn(
            'inline-flex items-center gap-1 rounded border px-1.5 py-0.5 font-mono text-[11px] font-semibold shadow-sm',
            'border-slate-200 dark:border-slate-700',
            'bg-slate-100 dark:bg-slate-800',
            'text-slate-700 dark:text-slate-200',
            '*:leading-none',
            roundedMap[rounded],
            textSizes[size],
            paddings[size]
          )}
        >
          <HotkeySymbolToken isMac={isMac} symbol={symbol} />
        </kbd>
      </HotkeyTooltip>
      {label && <span>{label}</span>}
    </span>
  );
}
