'use client';

import type { ReactNode } from 'react';
import type { PropertyRowProps } from './types';

import useIsClient from '@/hooks/lifecycle/use-is-client';
import { cn } from '@/utils/cn';
import { CopyAction } from '@/components/shared/action-button';
import { Badge } from '@/components/ui/badge';
import { Surface } from '@/components/ui/surface';

export function PropertyRow({
  label,
  value,
  displayValue: customDisplayValue,
  badge,
  badgeVariant = 'neutral',
  subText,
  variant = 'default',
  copyable = true,
  hoverAction = false,
  action,
  mono = true,
  onClick,
  className,
  valueClassName,
  labelClassName,
}: PropertyRowProps) {
  const isClient = useIsClient();
  const renderedValue: ReactNode =
    customDisplayValue !== undefined
      ? customDisplayValue
      : isClient
        ? (value ?? '---')
        : '---';

  const copyContent =
    value !== undefined && value !== null ? String(value) : '';

  const renderBadge = () => {
    if (!badge) return null;
    if (typeof badge === 'string') {
      return (
        <Badge
          variant={badgeVariant}
          size="xs"
          rounded="base"
          className="font-mono text-[10px]"
        >
          {badge}
        </Badge>
      );
    }
    return badge;
  };

  return (
    <Surface
      variant={variant}
      onClick={onClick}
      className={cn(
        'group p-3.5 text-left',
        onClick && 'cursor-pointer transition-colors hover:border-sky-500',
        className
      )}
    >
      <div className="mb-1 flex items-center justify-between gap-2">
        <p
          className={cn(
            'text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400',
            labelClassName
          )}
        >
          {label}
        </p>
        {renderBadge()}
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <code
            className={cn(
              'break-all text-sm font-medium leading-relaxed text-slate-800 dark:text-slate-200',
              mono && 'font-mono',
              valueClassName
            )}
          >
            {renderedValue}
          </code>
          {subText && (
            <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {subText}
            </div>
          )}
        </div>

        <div
          className={cn(
            'shrink-0',
            hoverAction &&
              'opacity-100 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100'
          )}
        >
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
      </div>
    </Surface>
  );
}

export default PropertyRow;
