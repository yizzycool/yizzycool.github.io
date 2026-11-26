'use client';

import type { PointerEvent } from 'react';
import type { CountdownBreakdown, MilestoneState, PosterTheme } from './types';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CalendarDays, Minimize2 } from 'lucide-react';

import { cn } from '@/utils/cn';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  state: MilestoneState;
  theme: PosterTheme;
  breakdown: CountdownBreakdown;
  isClientClockReady: boolean;
};

/**
 * Full-viewport ambient presentation overlay inheriting the active gradient theme.
 */
export default function FullscreenPosterModal({
  isOpen,
  onClose,
  state,
  theme,
  breakdown,
  isClientClockReady,
}: Props) {
  const [showChrome, setShowChrome] = useState(false);
  const hideTimerRef = useRef<number | null>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  const clearHideTimer = useCallback(() => {
    if (hideTimerRef.current !== null) {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }, []);

  const handleClose = useCallback(() => {
    clearHideTimer();
    setShowChrome(false);
    onCloseRef.current();
  }, [clearHideTimer]);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      clearHideTimer();
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [clearHideTimer, handleClose, isOpen]);

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse') return;
    setShowChrome(true);
    clearHideTimer();
    hideTimerRef.current = window.setTimeout(() => {
      setShowChrome(false);
      hideTimerRef.current = null;
    }, 1500);
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse') return;
    if (event.target instanceof Element && event.target.closest('button')) {
      return;
    }
    clearHideTimer();
    setShowChrome((prev) => !prev);
  };

  if (!isOpen || typeof document === 'undefined') return null;

  const heroValue = !breakdown.isValid
    ? '--'
    : breakdown.mode === 'today'
      ? 'TODAY'
      : String(breakdown.totalDays);

  const unitLabel = !breakdown.isValid
    ? 'PICK A DATE'
    : breakdown.mode === 'today'
      ? 'IS THE DAY'
      : breakdown.totalDays === 1
        ? breakdown.mode === 'future'
          ? 'DAY LEFT'
          : 'DAY AGO'
        : breakdown.mode === 'future'
          ? 'DAYS LEFT'
          : 'DAYS AGO';

  const liveClockLabel = isClientClockReady
    ? `${String(breakdown.hours).padStart(2, '0')}h : ${String(breakdown.minutes).padStart(2, '0')}m : ${String(breakdown.seconds).padStart(2, '0')}s`
    : '--h : --m : --s';

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${state.title.trim() || 'Milestone'} fullscreen countdown`}
      onPointerMove={handlePointerMove}
      onPointerDown={handlePointerDown}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-between p-6 text-center sm:p-10"
      style={{
        background: theme.gradientCss,
        color: theme.textPrimary,
      }}
    >
      {/* Ambient Radial Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(circle at 50% 45%, ${theme.glowColor}, transparent 65%)`,
        }}
      />

      {/* Top Bar (auto-hides when idle on desktop or toggled via touch on mobile) */}
      <div
        className={cn(
          'relative z-10 flex w-full max-w-5xl items-center justify-end transition-opacity duration-300',
          showChrome ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
      >
        <button
          type="button"
          onClick={handleClose}
          className="inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold backdrop-blur-md transition-opacity hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
          style={{
            backgroundColor: theme.pillBg,
            borderColor: theme.pillBorder,
            color: theme.textPrimary,
          }}
        >
          <Minimize2 size={14} />
          <span>Exit (Esc)</span>
        </button>
      </div>

      {/* Center Display */}
      <div className="relative z-10 my-auto flex max-w-3xl flex-col items-center space-y-5">
        {state.title.trim() && (
          <h2 className="text-2xl font-bold leading-tight tracking-tight sm:text-4xl">
            {state.title.trim()}
          </h2>
        )}

        <div className="flex flex-col items-center">
          <span className="font-mono text-7xl font-extrabold tabular-nums leading-none tracking-tight sm:text-9xl">
            {heroValue}
          </span>
          <span
            className="mt-3 text-sm font-bold uppercase tracking-[0.25em] sm:text-base"
            style={{ color: theme.accent }}
          >
            {unitLabel}
          </span>
        </div>

        {state.showLiveClock &&
          breakdown.isValid &&
          breakdown.mode !== 'today' && (
            <span
              className="rounded-full border px-4 py-1.5 font-mono text-sm font-medium tabular-nums sm:text-base"
              style={{
                backgroundColor: theme.pillBg,
                borderColor: theme.pillBorder,
                color: theme.textSecondary,
              }}
            >
              {liveClockLabel}
            </span>
          )}

        {state.note.trim() && (
          <p
            className="max-w-lg text-sm leading-relaxed sm:text-base"
            style={{ color: theme.textSecondary }}
          >
            {state.note}
          </p>
        )}

        <p
          className="flex items-center gap-2 text-xs font-semibold sm:text-sm"
          style={{ color: theme.textSecondary }}
        >
          <CalendarDays size={15} />
          <span>
            {breakdown.formattedDate} · {breakdown.weekday}
          </span>
        </p>
      </div>

      {/* Bottom Anti-Spoofing Hint */}
      <div
        className={cn(
          'relative z-10 flex items-center gap-2 text-[11px] transition-opacity duration-300',
          showChrome ? 'opacity-75' : 'pointer-events-none opacity-0'
        )}
      >
        <span>Custom countdown</span>
        <span>·</span>
        <button
          type="button"
          onClick={handleClose}
          className="underline underline-offset-2 hover:opacity-100"
        >
          Close to edit
        </button>
      </div>
    </div>,
    document.body
  );
}
