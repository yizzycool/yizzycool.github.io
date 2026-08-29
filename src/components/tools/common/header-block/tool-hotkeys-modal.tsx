'use client';

import type { HotkeyItem } from '@/components/common/badge/hotkey';
import type { HotkeyName } from '@/hooks/tools/use-tool-hotkeys';

import { useMemo } from 'react';
import { X, Keyboard } from 'lucide-react';

import { TOOL_HOTKEYS } from '@/hooks/tools/use-tool-hotkeys';
import BaseDialog from '@/components/common/dialog/base';
import HotkeyBadge from '@/components/common/badge/hotkey';

const DEFAULT_TOOL_HOTKEYS: HotkeyItem[] = [
  TOOL_HOTKEYS.process,
  TOOL_HOTKEYS.copy,
  TOOL_HOTKEYS.paste,
  TOOL_HOTKEYS.swap,
  TOOL_HOTKEYS.save,
  TOOL_HOTKEYS.clear,
  TOOL_HOTKEYS.history,
  TOOL_HOTKEYS.help,
];

type ToolHotkeysModalProps = {
  isOpen: boolean;
  onClose: () => void;
  customShortcuts?: HotkeyName[];
};

export function ToolHotkeysModal({
  isOpen,
  onClose,
  customShortcuts,
}: ToolHotkeysModalProps) {
  const shortcuts: HotkeyItem[] = useMemo(() => {
    if (!customShortcuts || customShortcuts.length === 0) {
      return DEFAULT_TOOL_HOTKEYS;
    }
    return customShortcuts
      .map((name) => TOOL_HOTKEYS[name])
      .filter((item): item is HotkeyItem => Boolean(item));
  }, [customShortcuts]);

  return (
    <BaseDialog
      isOpen={isOpen}
      onClose={onClose}
      className="w-full max-w-sm p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-blue-50 p-1.5 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
            <Keyboard size={18} />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">
              Keyboard Shortcuts
            </h3>
            <span className="text-xs text-slate-400">
              Boost your productivity with shortcuts
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          aria-label="Close keyboard shortcuts"
        >
          <X size={18} />
        </button>
      </div>

      {/* List */}
      <div className="divide-y divide-slate-100 py-3 dark:divide-slate-800">
        {shortcuts.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between py-2.5 text-xs"
          >
            <span className="font-medium text-slate-600 dark:text-slate-300">
              {item.label}
            </span>
            <HotkeyBadge size="sm" symbol={item.symbol} />
          </div>
        ))}
      </div>

      {/* Tip */}
      <div className="mt-2 rounded-xl bg-slate-50 p-2.5 text-center text-[11px] text-slate-400 dark:bg-slate-800/40">
        💡 Tip: Press shortcuts while focused on input to trigger actions
      </div>
    </BaseDialog>
  );
}

export default ToolHotkeysModal;
