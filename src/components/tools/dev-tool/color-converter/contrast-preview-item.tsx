import type { ContrastResult, NormalizedRgba, WcagRating } from './types';
import type { BadgeVariant } from '@/types/common/badge';

import { Badge } from '@/components/ui/badge';
import { InfoTooltip } from '@/components/ui/info-tooltip';

type ContrastPreviewItemProps = {
  title: string;
  textColorHex: string;
  textColorName: string;
  backgroundColorRgba: NormalizedRgba;
  result: ContrastResult;
};

function getBadgeVariant(rating: WcagRating): BadgeVariant {
  if (rating === 'AAA') return 'success';
  if (rating === 'AA') return 'amber';
  return 'error';
}

export default function ContrastPreviewItem({
  title,
  textColorHex,
  textColorName,
  backgroundColorRgba,
  result,
}: ContrastPreviewItemProps) {
  const bgCssString = `rgba(${backgroundColorRgba.r}, ${backgroundColorRgba.g}, ${backgroundColorRgba.b}, ${backgroundColorRgba.a})`;

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-neutral-200/80 bg-white/70 shadow-sm backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-900/60">
      {/* Top: Actual visual rendering sample */}
      <div
        className="flex min-h-[90px] flex-col justify-center p-4 transition-colors"
        style={{
          backgroundColor: bgCssString,
          color: textColorHex,
        }}
      >
        <span className="text-xs font-semibold opacity-80">
          {title} ({textColorName})
        </span>
        <span className="mt-1 text-sm font-medium tracking-tight sm:text-base">
          The quick brown fox jumps over the lazy dog
        </span>
        <span className="mt-0.5 text-xs opacity-75">
          Sample readability preview on selected background
        </span>
      </div>

      {/* Bottom: Metrics & Badges */}
      <div className="flex flex-col gap-3 p-4">
        {/* Contrast Ratio Heading */}
        <div className="flex items-baseline justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
              Contrast Ratio
            </span>
            <InfoTooltip
              content="Calculated using WCAG 2.1 relative luminance: (L1 + 0.05) / (L2 + 0.05)"
              ariaLabel="WCAG 2.1 ratio info"
            />
          </div>
          <span className="font-mono text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
            {result.ratio} : 1
          </span>
        </div>

        {/* Rating Badges */}
        <div className="grid grid-cols-2 gap-2">
          {/* Normal Text */}
          <div className="flex flex-col rounded-lg border border-neutral-200/60 bg-neutral-50/60 p-2.5 dark:border-neutral-800/60 dark:bg-neutral-950/40">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
                Normal Text (&lt;18pt)
              </span>
              <InfoTooltip
                size="xs"
                content="AA threshold ≥ 4.5:1, AAA threshold ≥ 7.0:1"
                ariaLabel="Normal text threshold info"
              />
            </div>
            <div className="mt-1.5">
              <Badge
                variant={getBadgeVariant(result.normalText)}
                size="xs"
                rounded="md"
                bordered
              >
                {result.normalText === 'Fail'
                  ? 'Fail'
                  : `${result.normalText} Passed`}
              </Badge>
            </div>
          </div>

          {/* Large Text */}
          <div className="flex flex-col rounded-lg border border-neutral-200/60 bg-neutral-50/60 p-2.5 dark:border-neutral-800/60 dark:bg-neutral-950/40">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
                Large Text (≥18pt)
              </span>
              <InfoTooltip
                size="xs"
                content="AA threshold ≥ 3.0:1, AAA threshold ≥ 4.5:1"
                ariaLabel="Large text threshold info"
              />
            </div>
            <div className="mt-1.5">
              <Badge
                variant={getBadgeVariant(result.largeText)}
                size="xs"
                rounded="md"
                bordered
              >
                {result.largeText === 'Fail'
                  ? 'Fail'
                  : `${result.largeText} Passed`}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
