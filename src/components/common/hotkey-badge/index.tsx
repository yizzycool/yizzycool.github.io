'use client';

import { cn } from '@/utils/cn';
import HotkeySymbol from './hotkey-symbol';

export type HotkeyItem = {
  symbol: string;
  label?: string;
};

type Props = {
  /** Array of hotkey items to render as a group */
  items?: HotkeyItem[];
  /** Single hotkey symbol (e.g. "⌘ + ↵") */
  symbol?: string;
  /** Single hotkey label (e.g. "Format") */
  label?: string;
  className?: string;
};

export default function HotkeyBadge({
  items,
  symbol,
  label,
  className = '',
}: Props) {
  // If rendering a group of hotkeys
  if (items && items.length > 0) {
    return (
      <div className={cn('flex items-center gap-3', className)}>
        {items.map((item, index) => (
          <HotkeyBadge
            key={`${item.symbol}-${index}`}
            symbol={item.symbol}
            label={item.label}
          />
        ))}
      </div>
    );
  }

  if (!symbol) return null;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500',
        className
      )}
    >
      <kbd className="inline-flex items-center gap-1 rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-slate-600 dark:bg-neutral-800 dark:text-slate-300">
        <HotkeySymbol symbol={symbol} />
      </kbd>
      {label && <span>{label}</span>}
    </span>
  );
}
