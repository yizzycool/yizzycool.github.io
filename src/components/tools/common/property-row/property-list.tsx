'use client';

import type { PropertyColumns, PropertyListProps } from './types';

import { AlertCircle, Loader2 } from 'lucide-react';

import { cn } from '@/utils/cn';

import { PropertyRow } from './property-row';

function getColumnClasses(
  columns?: PropertyColumns,
  gap: 'sm' | 'base' | 'lg' = 'base'
): string {
  const gapClass = gap === 'sm' ? 'gap-2' : gap === 'lg' ? 'gap-4' : 'gap-3';
  const gridGapClass =
    gap === 'sm' ? 'gap-2' : gap === 'lg' ? 'gap-4' : 'gap-2.5';

  if (!columns || columns === 1) {
    return cn('flex flex-col', gapClass);
  }

  if (typeof columns === 'number') {
    switch (columns) {
      case 2:
        return cn('grid grid-cols-1 sm:grid-cols-2', gridGapClass);
      case 3:
        return cn(
          'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
          gridGapClass
        );
      case 4:
        return cn(
          'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
          gridGapClass
        );
      default:
        return cn('flex flex-col', gapClass);
    }
  }

  return cn(
    'grid grid-cols-1',
    gridGapClass,
    columns.sm === 2 && 'sm:grid-cols-2',
    columns.sm === 3 && 'sm:grid-cols-3',
    columns.sm === 4 && 'sm:grid-cols-4',
    columns.md === 2 && 'md:grid-cols-2',
    columns.md === 3 && 'md:grid-cols-3',
    columns.md === 4 && 'md:grid-cols-4',
    columns.lg === 2 && 'lg:grid-cols-2',
    columns.lg === 3 && 'lg:grid-cols-3',
    columns.lg === 4 && 'lg:grid-cols-4'
  );
}

export function PropertyList({
  items,
  children,
  columns = 1,
  grouped,
  variant,
  copyable,
  hoverAction,
  mono,
  gap = 'base',
  isLoading = false,
  loadingText = 'Processing...',
  emptyText = 'No results to display.',
  emptyIcon: EmptyIcon = AlertCircle,
  className,
}: PropertyListProps) {
  if (isLoading) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center py-10 text-slate-400 dark:text-neutral-500',
          className
        )}
      >
        <Loader2 className="mb-2.5 h-7 w-7 animate-spin text-sky-500" />
        <p className="text-sm font-medium">{loadingText}</p>
      </div>
    );
  }

  const hasItems = Boolean(items && items.length > 0);

  if (!hasItems && !children) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center py-10 text-center text-slate-400 dark:text-neutral-500',
          className
        )}
      >
        <EmptyIcon size={32} className="mb-2 opacity-50" />
        <p className="text-sm">{emptyText}</p>
      </div>
    );
  }

  const isSingleCol = !columns || columns === 1;
  const isGrouped = grouped ?? isSingleCol;

  if (isGrouped) {
    return (
      <div
        className={cn(
          'divide-y divide-neutral-200/70 overflow-hidden rounded-xl border border-neutral-200/80 bg-white/70 backdrop-blur-md dark:divide-neutral-800 dark:border-neutral-800 dark:bg-neutral-900/40',
          className
        )}
        role="region"
        aria-live="polite"
      >
        {items
          ? items.map((item, idx) => (
              <PropertyRow
                key={item.id || item.label || idx}
                variant={item.variant || variant}
                copyable={item.copyable ?? copyable}
                hoverAction={item.hoverAction ?? hoverAction}
                mono={item.mono ?? mono}
                grouped={item.grouped ?? true}
                {...item}
              />
            ))
          : children}
      </div>
    );
  }

  const columnClasses = getColumnClasses(columns, gap);

  return (
    <div
      className={cn(columnClasses, className)}
      role="region"
      aria-live="polite"
    >
      {items
        ? items.map((item, idx) => (
            <PropertyRow
              key={item.id || item.label || idx}
              variant={item.variant || variant}
              copyable={item.copyable ?? copyable}
              hoverAction={item.hoverAction ?? hoverAction}
              mono={item.mono ?? mono}
              grouped={item.grouped ?? false}
              {...item}
            />
          ))
        : children}
    </div>
  );
}

export default PropertyList;
