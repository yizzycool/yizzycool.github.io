'use client';

import type { HotkeyItem } from '@/components/common/badge/hotkey';

import { useEffect, useRef } from 'react';

type HotkeyTarget =
  | HTMLElement
  | Window
  | Document
  | null
  | undefined
  | React.RefObject<HTMLElement | null | undefined>;

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
  const { enabled = true, preventDefault = true, target } = options;

  // Store handlers in ref to ensure fresh closure without re-subscribing event listener
  const handlersRef = useRef(handlers);
  useEffect(() => {
    handlersRef.current = handlers;
  }, [handlers]);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    let targetElement: HTMLElement | null = null;
    if (target) {
      if ('current' in target) {
        targetElement = (target.current as HTMLElement) ?? null;
      } else if (target instanceof HTMLElement) {
        targetElement = target;
      }
    }

    // 1. Target-bound listener for Target-level shortcuts:
    // - Esc (Clear/Reset)
    const handleTargetKeyDown = (event: KeyboardEvent) => {
      const key = event.key;

      // Esc: Clear / Reset
      if (key === 'Escape') {
        if (handlersRef.current.onClear) {
          if (preventDefault) event.preventDefault();
          handlersRef.current.onClear(event);
        }
        return;
      }
    };

    if (targetElement) {
      targetElement.addEventListener('keydown', handleTargetKeyDown);
    }

    // 2. Window-bound listener for Global shortcuts:
    // - Ctrl/Cmd + Enter (Execute)
    // - Ctrl/Cmd + Shift + C (Copy Result)
    // - Ctrl/Cmd + Shift + V (Paste & Focus Target)
    // - Ctrl/Cmd + / (Swap Input & Output)
    // - Ctrl/Cmd + S (Save / Export)
    // - ? (Shortcuts Modal)
    // - Esc fallback if target is not specified
    const handleWindowKeyDown = (event: KeyboardEvent) => {
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
        if (targetElement && typeof targetElement.focus === 'function') {
          targetElement.focus();
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

      // Fallback for Target listener if target is not specified
      if (!targetElement) {
        if (key === 'Escape' && handlersRef.current.onClear) {
          if (preventDefault) event.preventDefault();
          handlersRef.current.onClear(event);
          return;
        }
      }
    };

    window.addEventListener('keydown', handleWindowKeyDown);

    return () => {
      if (targetElement) {
        targetElement.removeEventListener('keydown', handleTargetKeyDown);
      }
      window.removeEventListener('keydown', handleWindowKeyDown);
    };
  }, [enabled, preventDefault, target]);
}

export const TOOL_HOTKEYS: Record<HotkeyName, HotkeyItem> = {
  process: {
    symbol: 'Mod + Enter',
    label: 'Execute / Format / Convert',
  },
  copy: {
    symbol: 'Mod + Shift + C',
    label: 'Copy Result',
  },
  paste: {
    symbol: 'Mod + Shift + V',
    label: 'Paste into Input',
  },
  clear: {
    symbol: 'Esc',
    label: 'Clear / Reset',
  },
  swap: {
    symbol: 'Mod + /',
    label: 'Swap Input & Output',
  },
  help: {
    symbol: '?',
    label: 'Keyboard Shortcuts Help',
  },
  save: {
    symbol: 'Mod + S',
    label: 'Save / Export',
  },
  history: {
    symbol: 'Mod + H',
    label: 'Open History Records',
  },
};
