'use client';

import type { HotkeyBadgeProps } from './types';

import useIsMac from '@/hooks/window/use-is-mac';
import { cn } from '@/utils/cn';

import HotkeySymbolToken from './hotkey-symbol-token';
import HotkeyTooltip from './hotkey-tooltip';
import {
  hotkeyColors,
  hotkeyTextSizes,
  hotkeyPaddings,
  hotkeyRoundedMap,
} from './hotkey.variants';
import {
  DEFAULT_HOTKEY_BADGE_SIZE,
  DEFAULT_HOTKEY_BADGE_ROUNDED,
  DEFAULT_HOTKEY_BADGE_COLOR,
  DEFAULT_HOTKEY_BADGE_LAYOUT,
  DEFAULT_HOTKEY_BADGE_BORDERED,
} from './constants';

export function HotkeyBadge({
  color = DEFAULT_HOTKEY_BADGE_COLOR,
  layout = DEFAULT_HOTKEY_BADGE_LAYOUT,
  size = DEFAULT_HOTKEY_BADGE_SIZE,
  rounded = DEFAULT_HOTKEY_BADGE_ROUNDED,
  bordered = DEFAULT_HOTKEY_BADGE_BORDERED,
  items,
  symbol,
  label,
  className = '',
}: HotkeyBadgeProps) {
  const isMac = useIsMac();

  if (isMac === undefined) return null;

  // If rendering a group of hotkeys
  if (items && items.length > 0) {
    return (
      <div className={cn('flex items-center gap-3', className)}>
        {items.map((item, index) => (
          <HotkeyBadge
            key={`${item.symbol}-${index}`}
            color={color}
            layout={layout}
            size={size}
            rounded={rounded}
            bordered={bordered}
            symbol={item.symbol}
            label={item.label}
          />
        ))}
      </div>
    );
  }

  if (!symbol) return null;

  const currentColor = hotkeyColors[color] || hotkeyColors.neutral;

  const kbdClassName = cn(
    'inline-flex items-center justify-center gap-1 font-mono font-semibold',
    currentColor.bg,
    currentColor.text,
    currentColor.shadow,
    bordered &&
      (currentColor.border
        ? cn('border', currentColor.border)
        : 'border border-neutral-200 dark:border-neutral-700'),
    '*:leading-none',
    hotkeyRoundedMap[rounded],
    hotkeyTextSizes[size],
    hotkeyPaddings[size]
  );

  return (
    <span
      className={cn(
        'hidden items-center gap-1.5 text-xs text-slate-400 sm:inline-flex dark:text-slate-500',
        hotkeyTextSizes[size],
        className
      )}
    >
      <HotkeyTooltip isMac={isMac} symbol={symbol}>
        <HotkeySymbolToken
          isMac={isMac}
          symbol={symbol}
          layout={layout}
          kbdClassName={kbdClassName}
        />
      </HotkeyTooltip>
      {label && <span>{label}</span>}
    </span>
  );
}
