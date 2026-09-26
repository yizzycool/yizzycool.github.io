'use client';

import type { PropertyResultCardProps } from './types';

import { Copy, SquareSquare } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/utils/cn';

import PropertyList from './property-list';

export function PropertyResultCard({
  title = 'Results',
  titleIcon = SquareSquare,
  count,
  countBadgeText,
  headerActions,
  onCopyAll,
  scrollable = true,
  maxHeightClass = 'max-h-80',
  isLoading = false,
  loadingText,
  emptyText,
  emptyIcon,
  items,
  columns = 1,
  children,
  className,
}: PropertyResultCardProps) {
  const hasCount = typeof count === 'number';
  const badgeLabel = countBadgeText || `${count} Found`;

  return (
    <Card className={cn('text-left', className)}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <CardTitle icon={titleIcon}>{title}</CardTitle>
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
      </div>

      <Separator className="-mx-6 my-6" />

      <div
        className={cn(
          scrollable && ['-m-6 overflow-y-auto p-6', maxHeightClass]
        )}
      >
        {children || (
          <PropertyList
            items={items}
            columns={columns}
            isLoading={isLoading}
            loadingText={loadingText}
            emptyText={emptyText}
            emptyIcon={emptyIcon}
          />
        )}
      </div>
    </Card>
  );
}

export default PropertyResultCard;
