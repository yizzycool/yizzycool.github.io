'use client';

import type { HotkeyItem } from '@/components/ui/badge';

import { useEffect, useRef } from 'react';

type HotkeyTarget =
  | HTMLElement
  | Window
  | Document
  | null
  | undefined
  | React.RefObject<HTMLElement | null | undefined>;

const MODAL_DIALOG_SELECTOR =
  '[role="dialog"][aria-modal="true"], [role="alertdialog"][aria-modal="true"], dialog[open]';

/**
 * Returns the number of currently open modal dialogs or drawers in the DOM.
 */
export function getOpenModalDialogCount(): number {
  if (typeof document === 'undefined') return 0;
  return document.querySelectorAll(MODAL_DIALOG_SELECTOR).length;
}

/**
 * Returns true if any modal dialog or drawer (e.g., SearchDialog, BaseDialog,
 * ConfirmDialog, ToolHistoryDrawer, ToolHotkeysModal) is currently open.
 */
export function hasOpenModalDialog(): boolean {
  return getOpenModalDialogCount() > 0;
}

function resolveTargetElement(target: HotkeyTarget): HTMLElement | null {
  if (!target) return null;
  if ('current' in target) {
    return (target.current as HTMLElement) ?? null;
  }
  if (target instanceof HTMLElement) {
    return target;
  }
  return null;
}

type HotkeyHandlers = {
  /** Triggered on Cmd+Enter / Ctrl+Enter (Format / Process / Execute) - Window listener */
  onExecute?: (e: KeyboardEvent) => void;
  /** Triggered on Cmd+Shift+C / Ctrl+Shift+C (Copy Result) - Window listener */
  onCopy?: (e: KeyboardEvent) => void;
  /** Triggered on Cmd+Shift+V / Ctrl+Shift+V (Paste into Target & Focus) - Window listener */
  onPaste?: (e: KeyboardEvent) => void;
  /** Triggered on Escape (Clear Input / Reset) - Target listener */
  onClear?: (e: KeyboardEvent) => void;
  /** Triggered on Cmd+/ / Ctrl+/ (Swap Input & Output for reversible tools) - Window listener */
  onSwap?: (e: KeyboardEvent) => void;
  /** Triggered on '?' (Open Keyboard Shortcuts Help Modal) - Window listener */
  onHelp?: (e: KeyboardEvent) => void;
  /** Triggered on Cmd+S / Ctrl+S (Save Draft / Export File) - Window listener */
  onSave?: (e: KeyboardEvent) => void;
  /** Triggered on Cmd+H / Ctrl+H (Open Tool History Drawer) - Window listener */
  onHistory?: (e: KeyboardEvent) => void;
};

type HotkeyOptions = {
  /** Whether the hotkey listener is active (default: true) */
  enabled?: boolean;
  /** If true, prevents default browser behavior when hotkey matches (default: true) */
  preventDefault?: boolean;
  /** Target element or React Ref for target-bound listeners (Esc) and focusing target on paste. */
  target?: HotkeyTarget;
  /** If true, ignores tool hotkeys while any modal dialog or drawer is open (default: true) */
  ignoreWhenModalOpen?: boolean;
};

export type HotkeyName =
  | 'process'
  | 'copy'
  | 'paste'
  | 'clear'
  | 'swap'
  | 'help'
  | 'save'
  | 'history';

/**
 * Universal hook for tool keyboard shortcuts:
 * - Ctrl/Cmd + Enter: Execute (window)
 * - Ctrl/Cmd + Shift + C: Copy Result (window)
 * - Ctrl/Cmd + Shift + V: Paste & Focus Target (window)
 * - Esc: Clear / Reset (target)
 * - Ctrl/Cmd + /: Swap Input & Output (window)
 * - ?: Show Keyboard Shortcuts list (window)
 * - Ctrl/Cmd + S: Save Draft / Export (window)
 * - Ctrl/Cmd + H: Open History Drawer (window)
 *
 * @example
 * ```ts
 * const textareaRef = useRef<HTMLTextAreaElement>(null);
 * useToolHotkeys(
 *   {
 *     onExecute: handleProcess,
 *     onClear: handleClear,
 *     onPaste: handlePaste,
 *     onSwap: handleSwap,
 *   },
 *   { target: textareaRef }
 * );
 * ```
 */
export default function useToolHotkeys(
  handlers: HotkeyHandlers,
  options: HotkeyOptions = {}
) {
  const {
    enabled = true,
    preventDefault = true,
    target,
    ignoreWhenModalOpen = true,
  } = options;

  // Store handlers in ref to ensure fresh closure without re-subscribing event listener
  const handlersRef = useRef(handlers);
  useEffect(() => {
    handlersRef.current = handlers;
  }, [handlers]);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    const handleWindowKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return;
      if (ignoreWhenModalOpen && hasOpenModalDialog()) return;

      const isCmdOrCtrl = event.metaKey || event.ctrlKey;
      const isShift = event.shiftKey;
      const key = event.key;
      const code = event.code;

      // 1. Ctrl/Cmd + Enter (Execute)
      if (isCmdOrCtrl && !isShift && key === 'Enter') {
        if (handlersRef.current.onExecute) {
          if (preventDefault) event.preventDefault();
          handlersRef.current.onExecute(event);
        }
        return;
      }

      // 2. Ctrl/Cmd + Shift + C (Copy Result)
      if (
        isCmdOrCtrl &&
        isShift &&
        (key === 'c' || key === 'C' || code === 'KeyC')
      ) {
        if (handlersRef.current.onCopy) {
          if (preventDefault) event.preventDefault();
          handlersRef.current.onCopy(event);
        }
        return;
      }

      // 3. Ctrl/Cmd + Shift + V (Paste & Focus Target)
      if (
        isCmdOrCtrl &&
        isShift &&
        (key === 'v' || key === 'V' || code === 'KeyV')
      ) {
        const resolvedTarget = resolveTargetElement(target);
        if (resolvedTarget && typeof resolvedTarget.focus === 'function') {
          resolvedTarget.focus();
        }
        if (handlersRef.current.onPaste) {
          if (preventDefault) event.preventDefault();
          handlersRef.current.onPaste(event);
        }
        return;
      }

      // 4. Ctrl/Cmd + / (Swap Input & Output)
      if (isCmdOrCtrl && !isShift && (key === '/' || code === 'Slash')) {
        if (handlersRef.current.onSwap) {
          if (preventDefault) event.preventDefault();
          handlersRef.current.onSwap(event);
        }
        return;
      }

      // 5. Ctrl/Cmd + S (Save / Export)
      if (
        isCmdOrCtrl &&
        !isShift &&
        (key === 's' || key === 'S' || code === 'KeyS')
      ) {
        if (handlersRef.current.onSave) {
          if (preventDefault) event.preventDefault();
          handlersRef.current.onSave(event);
        }
        return;
      }

      // 6. Ctrl/Cmd + H (Open Tool History)
      if (
        isCmdOrCtrl &&
        !isShift &&
        (key === 'h' || key === 'H' || code === 'KeyH')
      ) {
        if (handlersRef.current.onHistory) {
          if (preventDefault) event.preventDefault();
          handlersRef.current.onHistory(event);
        }
        return;
      }

      // 7. ? (Shortcuts List)
      // Only triggered when not typing inside an input/textarea/contenteditable
      if (
        !isCmdOrCtrl &&
        (key === '?' || (isShift && (key === '/' || code === 'Slash')))
      ) {
        const activeEl = document.activeElement;
        const isEditingText =
          activeEl &&
          (activeEl.tagName === 'INPUT' ||
            activeEl.tagName === 'TEXTAREA' ||
            (activeEl as HTMLElement).isContentEditable);

        if (!isEditingText && handlersRef.current.onHelp) {
          if (preventDefault) event.preventDefault();
          handlersRef.current.onHelp(event);
        }
        return;
      }

      // 8. Escape (Clear / Reset)
      if (key === 'Escape' && handlersRef.current.onClear) {
        // Never intercept Escape while any modal dialog or drawer is open
        if (hasOpenModalDialog()) return;

        const hasExplicitTarget =
          target !== undefined &&
          target !== null &&
          target !== window &&
          target !== document;

        if (hasExplicitTarget) {
          const resolvedTarget = resolveTargetElement(target);
          if (
            !resolvedTarget ||
            !(event.target instanceof Node) ||
            (event.target !== resolvedTarget &&
              !resolvedTarget.contains(event.target))
          ) {
            return;
          }
        }

        if (preventDefault) event.preventDefault();
        handlersRef.current.onClear(event);
      }
    };

    window.addEventListener('keydown', handleWindowKeyDown);

    return () => {
      window.removeEventListener('keydown', handleWindowKeyDown);
    };
  }, [enabled, preventDefault, target, ignoreWhenModalOpen]);
}

export const TOOL_HOTKEYS: Record<HotkeyName, HotkeyItem> = {
  process: {
    symbol: 'Mod + Enter',
    label: 'Execute / Format / Convert',
  },
  paste: {
    symbol: 'Mod + Shift + V',
    label: 'Paste into Input',
  },
  copy: {
    symbol: 'Mod + Shift + C',
    label: 'Copy Result',
  },
  clear: {
    symbol: 'Esc',
    label: 'Clear / Reset',
    hint: 'Triggered only when focused on the input field',
  },
  swap: {
    symbol: 'Mod + /',
    label: 'Swap Input & Output',
  },
  save: {
    symbol: 'Mod + S',
    label: 'Save / Export',
  },
  history: {
    symbol: 'Mod + H',
    label: 'Open History Records',
  },
  help: {
    symbol: '?',
    label: 'Keyboard Shortcuts Help',
  },
};
