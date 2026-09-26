'use client';

import type { PropertyResultSectionProps } from './types';

import { Copy, SquareSquare } from 'lucide-react';

import LabelBar from '@/components/tools/common/label-bar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';

import PropertyList from './property-list';

/**
 * Frameless result section component that wraps a `PropertyList` or custom children
 * with a standardized `LabelBar` header, result count badge, and optional Copy All action.
 */
export function PropertyResultSection({
  title = 'Results',
  titleIcon = SquareSquare,
  count,
  countBadgeText,
  headerActions,
  onCopyAll,
  scrollable = false,
  maxHeightClass = 'max-h-80',
  isLoading = false,
  loadingText,
  emptyText,
  emptyIcon,
  items,
  columns = 1,
  grouped,
  children,
  className,
}: PropertyResultSectionProps) {
  const hasCount = typeof count === 'number';
  const badgeLabel = countBadgeText || `${count} Found`;

  return (
    <div className={cn('w-full text-left', className)}>
      <LabelBar
        icon={titleIcon}
        label={
          <div className="flex items-center gap-2.5">
            <span>{title}</span>
            {hasCount && (
              <Badge
                variant="neutral"
                size="sm"
                rounded="base"
                className="font-mono text-xs"
              >
                {badgeLabel}
              </Badge>
            )}
          </div>
        }
      >
        <div className="flex items-center gap-2">
          {headerActions}
          {onCopyAll && (
            <Button
              variant="outline"
              size="xs"
              rounded="lg"
              icon={Copy}
              onClick={onCopyAll}
              disabled={isLoading || (!items?.length && !children)}
              title="Copy all results to clipboard"
            >
              Copy All
            </Button>
          )}
        </div>
      </LabelBar>

      <div className={cn(scrollable && ['overflow-y-auto', maxHeightClass])}>
        {children || (
          <PropertyList
            items={items}
            columns={columns}
            grouped={grouped}
            isLoading={isLoading}
            loadingText={loadingText}
            emptyText={emptyText}
            emptyIcon={emptyIcon}
          />
        )}
      </div>
    </div>
  );
}

export default PropertyResultSection;
