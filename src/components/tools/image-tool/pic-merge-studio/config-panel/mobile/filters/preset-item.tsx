'use client';

import type { PresetFilterType } from '../../../data/fabric-filters';

import Image from 'next/image';

import { cn } from '@/utils/cn';

type Props = {
  type: PresetFilterType;
  activePresetTypes: PresetFilterType[];
  onToggle: (type: PresetFilterType) => void;
};

export default function PresetItem({
  type,
  activePresetTypes,
  onToggle,
}: Props) {
  const isActive = activePresetTypes.includes(type);
  const orderNumber = isActive
    ? activePresetTypes.indexOf(type) + 1
    : undefined;

  return (
    <div
      onClick={() => onToggle(type)}
      className="relative shrink-0 cursor-pointer space-y-1 transition-transform active:scale-95"
    >
      <div
        className={cn(
          'h-[60px] w-[60px] rounded-lg border border-neutral-200/80 p-0.5 transition-all dark:border-neutral-800',
          isActive
            ? 'border-sky-500 bg-sky-50/50 ring-2 ring-sky-500/30 dark:border-sky-500 dark:bg-sky-950/30'
            : 'hover:border-neutral-300 dark:hover:border-neutral-700'
        )}
      >
        <div className="relative h-full w-full overflow-hidden rounded-md">
          <Image
            src={`/assets/images/tools/image-tool/pic-merge-studio/filters/cat_${type}.jpeg`}
            alt={type}
            fill
            className="object-cover"
          />
        </div>
      </div>

      <div className="w-[60px] truncate text-center text-[10px] font-medium text-neutral-600 dark:text-neutral-300">
        {type}
      </div>

      {isActive && orderNumber !== undefined && (
        <span
          className={cn(
            'absolute -left-1 -top-1',
            'flex h-4 w-4 items-center justify-center rounded-full',
            'border border-white bg-sky-500 shadow-sm dark:border-neutral-900',
            'text-[9px] font-semibold text-white'
          )}
        >
          {orderNumber}
        </span>
      )}
    </div>
  );
}
