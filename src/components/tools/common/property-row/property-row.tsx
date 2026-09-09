'use client';

import type { PropertyRowProps } from './types';

import useIsClient from '@/hooks/lifecycle/use-is-client';
import { cn } from '@/utils/cn';
import { CopyAction } from '@/components/shared/action-button';
import { Badge } from '@/components/ui/badge';
import { Surface } from '@/components/ui/surface';

export function PropertyRow({
  label,
  value,
  badge,
  variant = 'default',
  copyable = true,
  action,
  mono = true,
  className,
  valueClassName,
  labelClassName,
}: PropertyRowProps) {
  const isClient = useIsClient();
  const displayValue = isClient ? (value ?? '---') : '---';
  const copyContent =
    value !== undefined && value !== null ? String(value) : '';

  return (
    <Surface variant={variant} className={cn('group p-3.5', className)}>
      <div className="mb-1 flex items-center justify-between">
        <p
          className={cn(
            'text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400',
            labelClassName
          )}
        >
          {label}
        </p>
        {badge && (
          <Badge
            variant="neutral"
            size="xs"
            rounded="base"
            className="font-mono text-[10px]"
          >
            {badge}
          </Badge>
        )}
      </div>
      <div className="flex items-center justify-between gap-3">
        <code
          className={cn(
            'break-all text-sm font-medium leading-relaxed text-slate-800 dark:text-slate-200',
            mono && 'font-mono',
            valueClassName
          )}
        >
          {displayValue}
        </code>
        {action !== undefined ? (
          action
        ) : copyable ? (
          <CopyAction
            variant="neutral"
            display="icon"
            content={copyContent}
            disabled={!copyContent}
            ariaLabel={`Copy ${label}`}
          />
        ) : null}
      </div>
    </Surface>
  );
}

export default PropertyRow;
