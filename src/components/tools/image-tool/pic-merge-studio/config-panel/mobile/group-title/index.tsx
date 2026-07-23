'use client';

import type { LucideIcon } from 'lucide-react';

import { cn } from '@/utils/cn';

type Props = {
  text: string;
  icon?: LucideIcon;
  className?: string;
};

export default function GroupTitle({
  text,
  icon: Icon,
  className = '',
}: Props) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 text-slate-600 dark:text-slate-300',
        className
      )}
    >
      {!!Icon && <Icon size={12} className="min-w-[12px] max-w-[12px]" />}
      <h3 className="whitespace-nowrap text-xs font-black uppercase tracking-[0.2em]">
        {text}
      </h3>
      <div className="h-px w-full bg-neutral-200 dark:bg-neutral-700" />
    </div>
  );
}
