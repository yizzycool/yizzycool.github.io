'use client';

import clsx from 'clsx';
import { ArrowRightLeft } from 'lucide-react';

export default function SwapAction({
  onClick = () => {},
  disabled = false,
  size = 18,
}: {
  onClick?: () => void;
  disabled?: boolean;
  size?: number;
}) {
  return (
    <button
      onClick={onClick}
      title="Swap contents"
      className={clsx(
        'group/switch flex items-center justify-center rounded-full border p-3 shadow-sm',
        'border-gray-200 bg-white text-gray-600 hover:bg-gray-50',
        'dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700',
        disabled && 'pointer-events-none opacity-50'
      )}
    >
      <ArrowRightLeft
        size={size}
        className="rotate-90 transition-all duration-500 group-active/switch:rotate-180"
      />
    </button>
  );
}
