'use client';

import type { HotkeyItem } from '@/components/ui/badge';
import type { CountdownBreakdown, MilestoneState, PosterTheme } from './types';

import {
  BookmarkPlus,
  CalendarDays,
  Copy,
  Download,
  Link2,
  Maximize2,
  Sparkles,
} from 'lucide-react';

import { HotkeyBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';

import { POSTER_RATIO_DIMENSIONS } from './constants';

type Props = {
  state: MilestoneState;
  theme: PosterTheme;
  breakdown: CountdownBreakdown;
  isClientClockReady: boolean;
  isCopyingImage: boolean;
  customShortcuts: HotkeyItem[];
  onDownloadPng: () => void;
  onCopyShareLink: () => void;
  onCopyPng: () => void;
  onSaveMilestone: () => void;
  onOpenFullscreen: () => void;
};

/**
 * Sticky social poster live canvas stage with instant gradient preview, URL sharing, and PNG exports.
 */
export default function PosterPreview({
  state,
  theme,
  breakdown,
  isClientClockReady,
  isCopyingImage,
  customShortcuts,
  onDownloadPng,
  onCopyShareLink,
  onCopyPng,
  onSaveMilestone,
  onOpenFullscreen,
}: Props) {
  const ratioMeta = POSTER_RATIO_DIMENSIONS[state.ratio];

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

  return (
    <div className="w-full space-y-4">
      <div className="relative flex flex-col items-center justify-center rounded-2xl border border-neutral-200/80 bg-white/80 p-5 shadow-sm backdrop-blur-md sm:p-6 dark:border-neutral-800/80 dark:bg-neutral-900/60">
        {/* Top Meta Bar */}
        <div className="mb-4 flex w-full items-center justify-between gap-2 text-xs font-medium text-neutral-500 dark:text-neutral-400">
          <span className="flex items-center gap-1.5">
            <Sparkles size={14} className="text-sky-500" />
            <span>Poster Workshop</span>
          </span>
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-neutral-200/80 bg-white/90 px-2.5 py-0.5 font-mono text-[10px] font-semibold text-neutral-600 dark:border-neutral-700/80 dark:bg-neutral-800/90 dark:text-neutral-300">
              {ratioMeta.badge}
            </span>
            <Button
              variant="ghost"
              size="xs"
              rounded="full"
              bordered
              icon={Maximize2}
              onClick={onOpenFullscreen}
              title="Fullscreen display"
              ariaLabel="Open fullscreen countdown view"
              className="h-6 px-2 text-[11px]"
            >
              Fullscreen
            </Button>
          </div>
        </div>

        {/* Dot-Grid Studio Stage */}
        <div
          className={cn(
            'relative flex min-h-[380px] w-full items-center justify-center rounded-xl border p-5 transition-all duration-300 sm:p-7',
            'border-neutral-200/80 bg-neutral-50/70 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]',
            'dark:border-neutral-800/80 dark:bg-neutral-950/60 dark:bg-[radial-gradient(#262626_1px,transparent_1px)]'
          )}
        >
          {/* Live Poster Canvas Surface (use ring-inset instead of translucent border so gradient never wraps edge pixels) */}
          <div
            className={cn(
              'relative flex flex-col items-center justify-between overflow-hidden rounded-2xl p-6 text-center shadow-2xl ring-1 ring-inset ring-black/10 transition-all duration-300 dark:ring-white/15',
              state.ratio === 'story' &&
                'aspect-[9/16] w-[260px] py-8 sm:w-[290px]',
              state.ratio === 'square' &&
                'aspect-square w-[290px] py-7 sm:w-[340px]',
              state.ratio === 'wide' && 'aspect-video w-full max-w-[490px] py-6'
            )}
            style={{
              background: theme.gradientCss,
              color: theme.textPrimary,
            }}
          >
            {/* Ambient Glow Accent */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{
                background: `radial-gradient(circle at 50% 44%, ${theme.glowColor}, transparent 68%)`,
              }}
            />

            {/* Center Hero Group (Title + Counter) */}
            <div className="relative z-10 my-auto flex flex-col items-center">
              {state.title.trim() && (
                <h3
                  className={cn(
                    'mx-auto max-w-[260px] text-lg font-bold leading-snug tracking-tight sm:max-w-[340px] sm:text-xl',
                    state.ratio === 'wide' ? 'mb-2.5' : 'mb-4'
                  )}
                >
                  {state.title.trim()}
                </h3>
              )}
              <span
                className={cn(
                  'font-mono font-extrabold tabular-nums leading-none tracking-tight',
                  breakdown.mode === 'today'
                    ? 'text-4xl sm:text-5xl'
                    : state.ratio === 'wide'
                      ? 'text-5xl sm:text-6xl'
                      : 'text-6xl sm:text-7xl'
                )}
              >
                {heroValue}
              </span>
              <span
                className="mt-2 text-xs font-bold uppercase tracking-[0.2em]"
                style={{ color: theme.accent }}
              >
                {unitLabel}
              </span>

              {state.showLiveClock &&
                breakdown.isValid &&
                breakdown.mode !== 'today' && (
                  <span
                    className="mt-3 rounded-full border px-3 py-1 font-mono text-[11px] font-medium tabular-nums"
                    style={{
                      backgroundColor: theme.pillBg,
                      borderColor: theme.pillBorder,
                      color: theme.textSecondary,
                    }}
                  >
                    {liveClockLabel}
                  </span>
                )}
            </div>

            {/* Caption & Date Footer */}
            <div className="relative z-10 space-y-1.5">
              {state.note.trim() && (
                <p
                  className="mx-auto max-w-[250px] text-[11px] leading-relaxed sm:max-w-[340px]"
                  style={{ color: theme.textSecondary }}
                >
                  {state.note}
                </p>
              )}
              <p
                className="flex items-center justify-center gap-1.5 text-[11px] font-semibold"
                style={{ color: theme.textSecondary }}
              >
                <CalendarDays size={12} />
                <span>
                  {breakdown.formattedDate} · {breakdown.weekday}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Summary & Action Buttons */}
        <div className="mt-5 flex w-full flex-col gap-2.5">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Button
              variant="primary"
              size="sm"
              rounded="xl"
              icon={Download}
              onClick={onDownloadPng}
              disabled={!breakdown.isValid}
              className="shadow-xs w-full justify-center font-semibold"
              ariaLabel="Download Poster PNG"
            >
              Download PNG
            </Button>
            <Button
              variant="secondary"
              size="sm"
              rounded="xl"
              bordered
              icon={Link2}
              onClick={onCopyShareLink}
              className="w-full justify-center font-semibold"
              ariaLabel="Copy Shareable Link"
            >
              Copy Share Link
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="secondary"
              size="xs"
              rounded="lg"
              icon={Copy}
              onClick={onCopyPng}
              disabled={!breakdown.isValid || isCopyingImage}
              className="justify-center"
              ariaLabel="Copy Poster Image"
            >
              {isCopyingImage ? 'Copying...' : 'Copy Image'}
            </Button>
            <Button
              variant="ghost"
              size="xs"
              rounded="lg"
              bordered
              icon={BookmarkPlus}
              onClick={onSaveMilestone}
              disabled={!breakdown.isValid}
              className="justify-center"
              ariaLabel="Save Milestone Locally"
            >
              Save Milestone
            </Button>
          </div>

          {breakdown.isValid && (
            <div className="mt-1 flex flex-wrap items-center justify-between gap-2 border-t border-neutral-200/70 pt-3 text-[11px] text-neutral-500 dark:border-neutral-800/70 dark:text-neutral-400">
              <span>
                Span:{' '}
                <strong className="font-mono text-neutral-700 dark:text-neutral-200">
                  {breakdown.totalWeeks}
                </strong>
              </span>
              <div className="hidden sm:block">
                <HotkeyBadge items={customShortcuts.slice(0, 2)} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
