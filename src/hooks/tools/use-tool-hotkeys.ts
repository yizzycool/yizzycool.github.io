'use client';

import { useEffect, useRef, useSyncExternalStore } from 'react';

export interface HotkeyHandlers {
  /** Triggered on Cmd+Enter / Ctrl+Enter (Format / Process / Execute) */
  onExecute?: (e: KeyboardEvent) => void;
  /** Triggered on Cmd+Shift+C / Ctrl+Shift+C (Copy Result) */
  onCopy?: (e: KeyboardEvent) => void;
  /** Triggered on Escape (Clear Input / Reset) */
  onClear?: (e: KeyboardEvent) => void;
}

export interface HotkeyOptions {
  /** Whether the hotkey listener is active (default: true) */
  enabled?: boolean;
  /** If true, prevents default browser behavior when hotkey matches (default: true) */
  preventDefault?: boolean;
}

/**
 * Universal hook for tool keyboard shortcuts:
 * - Ctrl/Cmd + Enter (Execute / Format)
 * - Ctrl/Cmd + Shift + C (Copy Result)
 * - Esc (Clear / Reset)
 *
 * @example
 * ```ts
 * useToolHotkeys({
 *   onExecute: handleFormat,
 *   onCopy: handleCopy,
 *   onClear: handleClear,
 * });
 * ```
 */
export function useToolHotkeys(
  handlers: HotkeyHandlers,
  options: HotkeyOptions = {}
) {
  const { enabled = true, preventDefault = true } = options;
  const isMac = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // Store handlers in ref to ensure fresh closure without re-subscribing event listener
  const handlersRef = useRef(handlers);
  useEffect(() => {
    handlersRef.current = handlers;
  }, [handlers]);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const isCmdOrCtrl = event.metaKey || event.ctrlKey;
      const isShift = event.shiftKey;
      const key = event.key;

      // 1. Ctrl/Cmd + Enter (Execute / Format)
      if (isCmdOrCtrl && !isShift && key === 'Enter') {
        if (handlersRef.current.onExecute) {
          if (preventDefault) event.preventDefault();
          handlersRef.current.onExecute(event);
        }
        return;
      }

      // 2. Ctrl/Cmd + Shift + C (Copy Result)
      if (isCmdOrCtrl && isShift && (key === 'C' || key === 'c')) {
        if (handlersRef.current.onCopy) {
          if (preventDefault) event.preventDefault();
          handlersRef.current.onCopy(event);
        }
        return;
      }

      // 3. Esc (Clear / Reset)
      if (key === 'Escape') {
        if (handlersRef.current.onClear) {
          if (preventDefault) event.preventDefault();
          handlersRef.current.onClear(event);
        }
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, preventDefault]);

  return {
    /**
     * Helper to get OS-aware keyboard shortcut symbols for UI badges/tooltips.
     */
    hotkeySymbols: {
      isMac,
      modKey: isMac ? '⌘' : 'Ctrl',
      executeSymbol: isMac ? '⌘ ↵' : 'Ctrl ↵',
      copySymbol: isMac ? '⌘ Shift C' : 'Ctrl Shift C',
      clearSymbol: 'Esc',
    },
  };
}

function subscribe() {
  return () => {};
}

function getSnapshot() {
  return (
    typeof window !== 'undefined' &&
    /Mac|iPod|iPhone|iPad/.test(navigator.platform || '')
  );
}

function getServerSnapshot() {
  return false;
}
