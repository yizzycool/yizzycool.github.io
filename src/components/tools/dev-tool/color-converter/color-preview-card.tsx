'use client';

import type { BadgeVariant } from '@/types/common/badge';
import type { ContrastResult, NormalizedRgba, WcagRating } from './types';

import { Grid2x2 } from 'lucide-react';
import { useState } from 'react';

import { CopyAction } from '@/components/shared/action-button';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';

type ColorPreviewCardProps = {
  rgba: NormalizedRgba;
  hex: string;
  oklchString: string;
  hslString: string;
  rgbString: string;
  contrastAgainstBlack: ContrastResult;
  contrastAgainstWhite: ContrastResult;
};

function getContrastBadgeVariant(rating: WcagRating): BadgeVariant {
  if (rating === 'AAA') return 'success';
  if (rating === 'AA') return 'amber';
  return 'error';
}

export default function ColorPreviewCard({
  rgba,
  hex,
  oklchString,
  hslString,
  rgbString,
  contrastAgainstBlack,
  contrastAgainstWhite,
}: ColorPreviewCardProps) {
  const [showCheckerboard, setShowCheckerboard] = useState(true);
  const rgbaCssString = `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${rgba.a})`;
  const glowCssString = `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, 0.24)`;

  return (
    <div className="relative">
      {/* Subtle Ambient Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-2 -z-10 rounded-3xl opacity-75 blur-2xl transition-colors duration-300 dark:opacity-55"
        style={{ backgroundColor: glowCssString }}
      />

      <div className="relative overflow-hidden rounded-2xl border border-neutral-200/80 bg-white/80 shadow-sm backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-900/70">
        {/* Hero Swatch Canvas */}
        <div
          className={cn(
            'relative h-44 w-full transition-colors sm:h-52',
            !showCheckerboard && 'bg-white dark:bg-neutral-950'
          )}
          style={
            showCheckerboard
              ? {
                  backgroundImage:
                    'linear-gradient(45deg, #e5e5e5 25%, transparent 25%), linear-gradient(-45deg, #e5e5e5 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e5e5 75%), linear-gradient(-45deg, transparent 75%, #e5e5e5 75%)',
                  backgroundSize: '16px 16px',
                  backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
                }
              : undefined
          }
        >
          {/* Active Color Fill */}
          <div
            className="h-full w-full transition-colors duration-150"
            style={{ backgroundColor: rgbaCssString }}
          />

          {/* Top-Right Studio Controls */}
          <div className="absolute right-3 top-3 flex items-center gap-1.5">
            {rgba.a < 1 && (
              <span className="rounded-lg bg-black/55 px-2 py-1 font-mono text-[11px] font-semibold text-white backdrop-blur-md">
                Alpha {Math.round(rgba.a * 100)}%
              </span>
            )}
            <Button
              variant="ghost"
              size="xs"
              rounded="lg"
              icon={Grid2x2}
              onClick={() => setShowCheckerboard((prev) => !prev)}
              ariaLabel="Toggle transparency checkerboard"
              title={
                showCheckerboard
                  ? 'Hide transparency checkerboard'
                  : 'Show transparency checkerboard'
              }
              className={cn(
                'border border-white/25 backdrop-blur-md',
                showCheckerboard
                  ? 'bg-black/60 text-white hover:bg-black/75'
                  : 'bg-black/35 text-white/85 hover:bg-black/55'
              )}
            >
              Grid
            </Button>
          </div>

          {/* Floating WCAG Contrast Corner Badges */}
          <div className="absolute inset-x-3 bottom-3 flex flex-wrap items-end justify-between gap-2">
            {/* Black Text Sample Badge */}
            <div
              className="flex items-center gap-2 rounded-xl border border-black/15 px-3 py-1.5 shadow-sm backdrop-blur-sm"
              style={{ backgroundColor: rgbaCssString, color: '#000000' }}
            >
              <span className="text-sm font-bold">Aa</span>
              <span className="font-mono text-xs font-semibold">
                {contrastAgainstBlack.ratio.toFixed(2)}:1
              </span>
              <Badge
                variant={getContrastBadgeVariant(
                  contrastAgainstBlack.normalText
                )}
                size="xs"
                rounded="md"
              >
                {contrastAgainstBlack.normalText}
              </Badge>
            </div>

            {/* White Text Sample Badge */}
            <div
              className="flex items-center gap-2 rounded-xl border border-white/25 px-3 py-1.5 shadow-sm backdrop-blur-sm"
              style={{ backgroundColor: rgbaCssString, color: '#FFFFFF' }}
            >
              <span className="text-sm font-bold">Aa</span>
              <span className="font-mono text-xs font-semibold">
                {contrastAgainstWhite.ratio.toFixed(2)}:1
              </span>
              <Badge
                variant={getContrastBadgeVariant(
                  contrastAgainstWhite.normalText
                )}
                size="xs"
                rounded="md"
              >
                {contrastAgainstWhite.normalText}
              </Badge>
            </div>
          </div>
        </div>

        {/* Bottom Studio Readout Bar */}
        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="font-mono text-xl font-bold tracking-tight text-neutral-900 sm:text-2xl dark:text-neutral-50">
                {hex}
              </span>
              <span className="truncate font-mono text-xs font-medium text-sky-600 dark:text-sky-400">
                {oklchString}
              </span>
            </div>
            <div className="mt-1 flex flex-wrap gap-x-2.5 text-xs text-neutral-500 dark:text-neutral-400">
              <span>{rgbString}</span>
              <span aria-hidden="true">•</span>
              <span>{hslString}</span>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <CopyAction
              content={oklchString}
              label="Copy OKLCH"
              variant="outline"
              ariaLabel="Copy OKLCH color code"
              successToast={`Copied ${oklchString}!`}
            />
            <CopyAction
              content={hex}
              label="Copy HEX"
              ariaLabel="Copy HEX color code"
              successToast={`Copied ${hex}!`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
