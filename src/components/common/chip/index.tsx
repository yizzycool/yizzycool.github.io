'use client';

import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

import { Check } from 'lucide-react';
import { cn } from '@/utils/cn';

export type ChipSize = 'xs' | 'sm' | 'md' | 'lg';

type Props = {
  children?: ReactNode;
  selected?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  title?: string;
  size?: ChipSize;
  icon?: LucideIcon;
  showCheck?: boolean;
  className?: string;
};

const sizeStyles: Record<ChipSize, string> = {
  xs: 'px-2.5 py-1.5 text-xs',
  sm: 'px-3 py-2 text-sm',
  md: 'px-3.5 py-2.5 text-base',
  lg: 'px-4 py-3 text-lg',
};

export default function Chip({
  children,
  selected = false,
  onClick,
  disabled = false,
  title,
  size = 'xs',
  icon: Icon,
  showCheck = false,
  className,
}: Props) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'group relative flex items-center gap-2 rounded-lg font-medium transition-all duration-200',
        'shadow-2xs border',
        sizeStyles[size],
        selected
          ? 'border-sky-500 bg-sky-50 text-sky-700 ring-2 ring-sky-500/20 dark:border-sky-500/80 dark:bg-sky-950/40 dark:text-sky-300'
          : 'border-neutral-200/80 bg-white/80 text-slate-600 hover:border-slate-300 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900/60 dark:text-slate-400 dark:hover:border-neutral-700 dark:hover:bg-neutral-800/80',
        disabled && 'cursor-not-allowed opacity-50',
        className
      )}
    >
      {Icon && <Icon size={size === 'xs' ? 14 : 16} className="shrink-0" />}
      {children}
      {selected && showCheck && (
        <Check
          size={size === 'xs' ? 12 : 14}
          className="shrink-0 text-sky-500 dark:text-sky-400"
        />
      )}
    </button>
  );
}
