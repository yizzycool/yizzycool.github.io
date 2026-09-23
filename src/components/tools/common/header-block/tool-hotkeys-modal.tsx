'use client';

import type { HotkeyItem } from '@/components/ui/badge';

import { Keyboard, CircleAlert } from 'lucide-react';

import { TOOL_HOTKEYS } from '@/hooks/tools/use-tool-hotkeys';
import { BaseDialog, DialogHeader } from '@/components/ui/dialog';
import { HotkeyBadge } from '@/components/ui/badge';
import {
  TooltipPopup,
  TooltipRoot,
  TooltipTrigger,
} from '@/components/ui/tooltip';

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
      dialogClassName="w-full max-w-sm p-6"
    >
      {/* Header */}
      <DialogHeader
        icon={Keyboard}
        title="Keyboard Shortcuts"
        description="Boost your productivity with shortcuts"
        onClose={onClose}
        closeAriaLabel="Close keyboard shortcuts"
      />

      {/* List */}
      <div className="divide-y divide-neutral-100 py-3 dark:divide-neutral-800/80">
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
                      className="cursor-pointer text-slate-400 dark:text-slate-500"
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
            <HotkeyBadge layout="combined" symbol={item.symbol} />
          </div>
        ))}
      </div>
    </BaseDialog>
  );
}

export default ToolHotkeysModal;
