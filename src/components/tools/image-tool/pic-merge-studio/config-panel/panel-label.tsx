import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { cn } from '@/utils/cn';

export type PanelLabelProps = {
  htmlFor?: string;
  icon?: LucideIcon;
  badge?: ReactNode;
  className?: string;
  children: ReactNode;
};

export function PanelLabel({
  htmlFor,
  icon: Icon,
  badge,
  className,
  children,
}: PanelLabelProps) {
  const content = (
    <>
      {Icon && <Icon className="h-3.5 w-3.5 shrink-0 text-neutral-400" />}
      <span>{children}</span>
    </>
  );

  const baseClasses =
    'text-[11px] font-medium text-neutral-500 dark:text-neutral-400';

  if (badge) {
    return (
      <div
        className={cn(
          'mb-1.5 flex items-center justify-between text-xs',
          className
        )}
      >
        {htmlFor ? (
          <label
            htmlFor={htmlFor}
            className={cn('flex items-center gap-1.5', baseClasses)}
          >
            {content}
          </label>
        ) : (
          <span className={cn('flex items-center gap-1.5', baseClasses)}>
            {content}
          </span>
        )}
        {badge}
      </div>
    );
  }

  if (htmlFor) {
    return (
      <label
        htmlFor={htmlFor}
        className={cn(
          'block',
          baseClasses,
          Icon && 'flex items-center gap-1.5',
          className
        )}
      >
        {content}
      </label>
    );
  }

  return (
    <span
      className={cn(
        'block',
        baseClasses,
        Icon && 'flex items-center gap-1.5',
        className
      )}
    >
      {content}
    </span>
  );
}

export default PanelLabel;
