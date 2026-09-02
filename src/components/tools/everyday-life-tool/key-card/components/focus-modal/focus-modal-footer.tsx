import { HotkeyBadge } from '@/components/common/badge';
import { FOCUS_MODAL_SHORTCUTS, FOCUS_MODAL_CLOSE_SHORTCUT } from './constants';

export function FocusModalFooter() {
  return (
    <div className="flex shrink-0 flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-neutral-200/80 bg-neutral-50/80 px-5 py-2.5 text-[11px] text-slate-400 sm:px-6 dark:border-neutral-800/80 dark:bg-neutral-900/60 dark:text-slate-500">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        {FOCUS_MODAL_SHORTCUTS.map((item) => (
          <HotkeyBadge
            key={item.symbol}
            size="xs"
            symbol={item.symbol}
            label={item.label}
            className="inline-flex"
          />
        ))}
      </div>

      <HotkeyBadge
        size="xs"
        symbol={FOCUS_MODAL_CLOSE_SHORTCUT.symbol}
        label={FOCUS_MODAL_CLOSE_SHORTCUT.label}
        className="inline-flex"
      />
    </div>
  );
}
