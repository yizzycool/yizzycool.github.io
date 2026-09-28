'use client';

import type { NormalizedRgba } from './types';

import { CopyAction } from '@/components/shared/action-button';

type ColorPreviewCardProps = {
  rgba: NormalizedRgba;
  hex: string;
  hslString: string;
  rgbString: string;
};

export default function ColorPreviewCard({
  rgba,
  hex,
  hslString,
  rgbString,
}: ColorPreviewCardProps) {
  const rgbaCssString = `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${rgba.a})`;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-neutral-200/80 bg-white/70 shadow-sm backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-900/60">
      {/* Checkerboard background for alpha support */}
      <div
        className="relative h-28 w-full transition-colors sm:h-36"
        style={{
          backgroundImage:
            'linear-gradient(45deg, #e5e5e5 25%, transparent 25%), linear-gradient(-45deg, #e5e5e5 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e5e5 75%), linear-gradient(-45deg, transparent 75%, #e5e5e5 75%)',
          backgroundSize: '16px 16px',
          backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
        }}
      >
        {/* Actual color overlay */}
        <div
          className="h-full w-full transition-all duration-200"
          style={{ backgroundColor: rgbaCssString }}
        />
      </div>

      {/* Info bar below preview */}
      <div className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xl font-bold tracking-tight text-neutral-900 sm:text-2xl dark:text-neutral-50">
              {hex}
            </span>
            {rgba.a < 1 && (
              <span className="rounded bg-neutral-200/70 px-1.5 py-0.5 text-xs font-semibold text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                Alpha {Math.round(rgba.a * 100)}%
              </span>
            )}
          </div>
          <div className="mt-0.5 flex flex-wrap gap-x-3 text-xs text-neutral-500 dark:text-neutral-400">
            <span>{rgbString}</span>
            <span>•</span>
            <span>{hslString}</span>
          </div>
        </div>

        <CopyAction
          content={hex}
          label="Copy HEX"
          ariaLabel="Copy HEX color code"
          successToast={`Copied ${hex}!`}
          className="self-start sm:self-auto"
        />
      </div>
    </div>
  );
}
