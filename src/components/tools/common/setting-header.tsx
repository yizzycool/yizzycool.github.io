'use client';

import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { CircleAlert } from 'lucide-react';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { cn } from '@/utils/cn';

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
          <InfoTooltip
            size="xs"
            icon={CircleAlert}
            content={hint}
            ariaLabel={`Hint for ${label}`}
          />
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
