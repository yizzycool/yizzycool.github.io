'use client';

import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { CircleAlert } from 'lucide-react';
import { cn } from '@/utils/cn';
import {
  TooltipPopup,
  TooltipRoot,
  TooltipTrigger,
} from '@/components/common/tooltip';

type Props = {
  label: string;
  hint?: string;
  icon?: LucideIcon;
  value?: ReactNode;
  valueClassName?: string;
  className?: string;
  children?: ReactNode;
};

export default function SettingHeader({
  label,
  hint,
  icon: Icon,
  value,
  valueClassName,
  className,
  children,
}: Props) {
  return (
    <div className={cn('flex items-center justify-between', className)}>
      <div className="flex items-center gap-1.5">
        {Icon && (
          <Icon
            size={14}
            className="shrink-0 text-slate-400 dark:text-slate-500"
          />
        )}
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          {label}
        </span>

        {hint && (
          <TooltipRoot>
            <TooltipTrigger>
              <button
                type="button"
                className="inline-flex cursor-help text-slate-400 transition-colors hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                aria-label={`Hint for ${label}`}
              >
                <CircleAlert size={13} className="shrink-0" />
              </button>
            </TooltipTrigger>
            <TooltipPopup
              variant="dark"
              placement="top"
              showArrow
              className="max-w-xs px-2.5 py-1.5 text-xs leading-relaxed"
            >
              {hint}
            </TooltipPopup>
          </TooltipRoot>
        )}
      </div>

      {(value !== undefined || children !== undefined) && (
        <span
          className={cn(
            'font-mono text-xs text-slate-400 dark:text-slate-500',
            valueClassName
          )}
        >
          {value ?? children}
        </span>
      )}
    </div>
  );
}
