'use client';

import type { ColorSpaceItemData } from './types';

import { CopyAction } from '@/components/shared/action-button';

type ColorSpaceItemProps = {
  item: ColorSpaceItemData;
  colorSwatchHex: string;
};

export default function ColorSpaceItem({
  item,
  colorSwatchHex,
}: ColorSpaceItemProps) {
  return (
    <div className="group flex flex-col gap-2 p-3.5 transition-colors hover:bg-neutral-100/50 sm:flex-row sm:items-center sm:justify-between sm:gap-4 dark:hover:bg-neutral-800/40">
      {/* Left: Swatch circle + Format Label + Badge */}
      <div className="flex min-w-[160px] items-center gap-2.5 sm:w-1/3">
        <span
          className="shadow-xs h-4 w-4 flex-shrink-0 rounded-full border border-black/10 dark:border-white/20"
          style={{ backgroundColor: colorSwatchHex }}
          aria-hidden="true"
        />
        <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
          {item.label}
        </span>
      </div>

      {/* Middle: Monospace Color Value */}
      <div className="flex flex-1 items-center">
        <span className="select-all break-all font-mono text-xs font-medium text-neutral-900 sm:text-sm dark:text-neutral-100">
          {item.value}
        </span>
      </div>

      {/* Right: Copy Button */}
      <div className="flex items-center justify-end sm:w-auto">
        <CopyAction
          display="icon"
          variant="ghost"
          size="sm"
          content={item.value}
          ariaLabel={`Copy ${item.label} value`}
          successToast={`Copied ${item.label}!`}
          className="h-8 w-8 text-neutral-400 hover:text-neutral-700 dark:text-neutral-500 dark:hover:text-neutral-200"
        />
      </div>
    </div>
  );
}
