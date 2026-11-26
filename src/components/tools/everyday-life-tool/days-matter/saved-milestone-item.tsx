'use client';

import type { SavedMilestone } from './types';

import { Trash2 } from 'lucide-react';

import { InsetGroupRow } from '@/components/tools/common/inset-group';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import { computeCountdown } from './utils/date-math';

type Props = {
  item: SavedMilestone;
  nowMs: number;
  onLoad: (item: SavedMilestone) => void;
  onDelete: (id: string) => void;
};

/**
 * Single saved milestone row inside an InsetGroup displaying day delta and load/delete actions.
 */
export default function SavedMilestoneItem({
  item,
  nowMs,
  onLoad,
  onDelete,
}: Props) {
  const breakdown = computeCountdown(
    item.date,
    nowMs > 0 ? nowMs : new Date('2026-11-26T00:00:00').getTime()
  );

  const badgeText = !breakdown.isValid
    ? item.date
    : breakdown.mode === 'today'
      ? 'Today'
      : breakdown.mode === 'future'
        ? `In ${breakdown.totalDays}d`
        : `${breakdown.totalDays}d ago`;

  const badgeVariant =
    breakdown.mode === 'today'
      ? 'success'
      : breakdown.mode === 'future'
        ? 'primary'
        : 'neutral';

  return (
    <InsetGroupRow className="flex items-center justify-between gap-2.5">
      <button
        type="button"
        onClick={() => onLoad(item)}
        className="min-w-0 flex-1 text-left"
      >
        <p className="truncate text-xs font-semibold text-neutral-800 transition-colors group-hover:text-sky-600 dark:text-neutral-100 dark:group-hover:text-sky-400">
          {item.title}
        </p>
        <p className="mt-0.5 truncate font-mono text-[11px] text-neutral-500 dark:text-neutral-400">
          {item.date}
        </p>
      </button>

      <div className="flex shrink-0 items-center gap-1.5">
        <Badge
          variant={badgeVariant}
          size="xs"
          rounded="full"
          className="font-mono text-[10px]"
        >
          {badgeText}
        </Badge>
        <Button
          variant="ghost"
          size="xs"
          icon={Trash2}
          onClick={() => onDelete(item.id)}
          ariaLabel={`Remove ${item.title}`}
          className="h-7 w-7 justify-center p-0 text-neutral-400 hover:text-rose-500"
        />
      </div>
    </InsetGroupRow>
  );
}
