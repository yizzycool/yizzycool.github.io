'use client';

import type { LucideIcon } from 'lucide-react';

import { cn } from '@/utils/cn';

type Props = {
  label: string;
  icon: LucideIcon;
  isActive?: boolean;
  isDanger?: boolean;
  onClick: () => void;
};

/**
 * Single action pill button in the mobile studio bottom bar.
 */
export default function MobileStudioBarItem({
  label,
  icon: Icon,
  isActive = false,
  isDanger = false,
  onClick,
}: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex h-11 min-w-[60px] shrink-0 flex-col items-center justify-center gap-0.5 rounded-xl px-2 text-[10px] font-semibold transition-colors',
        isActive
          ? 'shadow-xs bg-sky-500 text-white'
          : isDanger
            ? 'text-red-500 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40'
            : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800'
      )}
    >
      <Icon className="h-4 w-4" />
      <span className="whitespace-nowrap">{label}</span>
    </button>
  );
}
