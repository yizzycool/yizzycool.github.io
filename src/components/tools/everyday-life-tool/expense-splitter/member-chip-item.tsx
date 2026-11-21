'use client';

import type { ExpenseMember } from './types';

import { X } from 'lucide-react';

import { cn } from '@/utils/cn';

type Props = {
  member: ExpenseMember;
  canRemove: boolean;
  onRemove: (id: string) => void;
};

export default function MemberChipItem({ member, canRemove, onRemove }: Props) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border py-1 pl-3 pr-1.5 text-xs font-medium transition-colors',
        'border-neutral-200/80 bg-neutral-100/70 text-slate-700',
        'dark:border-neutral-700/80 dark:bg-neutral-800/70 dark:text-slate-200'
      )}
    >
      <span className="max-w-[140px] truncate">{member.name}</span>
      <button
        type="button"
        onClick={() => onRemove(member.id)}
        disabled={!canRemove}
        aria-label={`Remove ${member.name}`}
        title={
          canRemove
            ? `Remove ${member.name}`
            : 'At least 2 members are required'
        }
        className={cn(
          'flex size-4 items-center justify-center rounded-full transition-colors',
          canRemove
            ? 'text-slate-400 hover:bg-rose-100 hover:text-rose-600 dark:text-slate-500 dark:hover:bg-rose-950/60 dark:hover:text-rose-400'
            : 'cursor-not-allowed text-slate-300 dark:text-slate-600'
        )}
      >
        <X size={12} />
      </button>
    </div>
  );
}
