'use client';

import type { PropertyColumns, PropertyListProps } from './types';

import { cn } from '@/utils/cn';
import { PropertyRow } from './property-row';

function getColumnClasses(columns?: PropertyColumns): string {
  if (!columns || columns === 1) {
    return 'flex flex-col gap-3';
  }

  if (typeof columns === 'number') {
    switch (columns) {
      case 2:
        return 'grid grid-cols-1 gap-2.5 sm:grid-cols-2';
      case 3:
        return 'grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3';
      case 4:
        return 'grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4';
      default:
        return 'flex flex-col gap-3';
    }
  }

  return cn(
    'grid grid-cols-1 gap-2.5',
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
  variant,
  copyable,
  mono,
  className,
}: PropertyListProps) {
  const columnClasses = getColumnClasses(columns);

  return (
    <div className={cn(columnClasses, className)}>
      {items
        ? items.map((item, idx) => (
            <PropertyRow
              key={item.id || item.label || idx}
              variant={item.variant || variant}
              copyable={item.copyable ?? copyable}
              mono={item.mono ?? mono}
              {...item}
            />
          ))
        : children}
    </div>
  );
}

export default PropertyList;
