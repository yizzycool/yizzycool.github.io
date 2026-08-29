'use client';

import type { HotkeyItem } from '@/components/common/badge/hotkey';

import { X, Keyboard, CircleAlert } from 'lucide-react';

import { TOOL_HOTKEYS } from '@/hooks/tools/use-tool-hotkeys';
import BaseDialog from '@/components/common/dialog/base';
import HotkeyBadge from '@/components/common/badge/hotkey';
import {
  TooltipPopup,
  TooltipRoot,
  TooltipTrigger,
} from '@/components/common/tooltip';

const DEFAULT_TOOL_HOTKEYS: HotkeyItem[] = [
  TOOL_HOTKEYS.process,
  TOOL_HOTKEYS.paste,
  TOOL_HOTKEYS.copy,
  TOOL_HOTKEYS.clear,
  TOOL_HOTKEYS.swap,
  TOOL_HOTKEYS.save,
  TOOL_HOTKEYS.history,
  TOOL_HOTKEYS.help,
];

type ToolHotkeysModalProps = {
  isOpen: boolean;
  onClose: () => void;
  customShortcuts?: HotkeyItem[];
};

export function ToolHotkeysModal({
  isOpen,
  onClose,
  customShortcuts,
}: ToolHotkeysModalProps) {
  const shortcuts = customShortcuts || DEFAULT_TOOL_HOTKEYS;

  return (
    <BaseDialog
      isOpen={isOpen}
      onClose={onClose}
      className="w-full max-w-sm p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-700">
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
            <div className="flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-300">
              <span>{item.label}</span>
              {item.hint && (
                <TooltipRoot>
                  <TooltipTrigger>
                    <span
                      tabIndex={0}
                      role="button"
                      className="cursor-help text-slate-400 dark:text-slate-500"
                      aria-label={item.hint}
                    >
                      <CircleAlert size={13} />
                    </span>
                  </TooltipTrigger>
                  <TooltipPopup
                    placement="top"
                    variant="dark"
                    showArrow
                    className="max-w-xs px-2.5 py-1.5 text-[11px] font-normal leading-snug"
                  >
                    {item.hint}
                  </TooltipPopup>
                </TooltipRoot>
              )}
            </div>
            <HotkeyBadge symbol={item.symbol} />
          </div>
        ))}
      </div>
    </BaseDialog>
  );
}

export default ToolHotkeysModal;
