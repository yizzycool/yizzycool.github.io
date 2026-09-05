'use client';

import type { CardTitleProps } from './types';

import { cn } from '@/utils/cn';

export function CardTitle({
  icon: Icon,
  children,
  className = '',
}: CardTitleProps) {
  return (
    <div
      className={cn('flex items-center gap-2 dark:text-slate-300', className)}
    >
      {!!Icon && (
        <Icon className="h-5 w-5 text-slate-400 dark:text-slate-500" />
      )}
      {!!children && <h3 className="text-lg font-semibold">{children}</h3>}
    </div>
  );
}
