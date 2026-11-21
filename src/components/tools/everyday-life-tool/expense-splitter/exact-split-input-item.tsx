'use client';

import type { ExpenseMember } from './types';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type Props = {
  member: ExpenseMember;
  currencySymbol: string;
  value: string;
  canFillRemainder: boolean;
  onChange: (memberId: string, value: string) => void;
  onFillRemainder: (memberId: string) => void;
};

export default function ExactSplitInputItem({
  member,
  currencySymbol,
  value,
  canFillRemainder,
  onChange,
  onFillRemainder,
}: Props) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-neutral-200/70 bg-neutral-50/70 px-3 py-2 dark:border-neutral-800 dark:bg-neutral-900/50">
      <span className="min-w-0 truncate text-xs font-semibold text-slate-700 dark:text-slate-200">
        {member.name}
      </span>
      <div className="flex items-center gap-1.5">
        <div className="w-28 sm:w-32">
          <Input
            type="number"
            inputMode="decimal"
            value={value}
            onChange={(e) => onChange(member.id, e.target.value)}
            placeholder={`${currencySymbol} 0`}
            className="h-8 py-1 text-right font-mono text-xs"
          />
        </div>
        <Button
          variant="ghost"
          size="xs"
          rounded="lg"
          disabled={!canFillRemainder}
          onClick={() => onFillRemainder(member.id)}
          title={`Fill remaining amount for ${member.name}`}
          className="px-2 text-[11px]"
        >
          Rest
        </Button>
      </div>
    </div>
  );
}
