'use client';

import type { LucideIcon } from 'lucide-react';

import { cn } from '@/utils/cn';
import { Separator } from '@/components/ui/separator';

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
        'flex items-center gap-2 text-neutral-500 dark:text-neutral-400',
        className
      )}
    >
      {!!Icon && <Icon size={13} className="min-w-[13px] max-w-[13px]" />}
      <h3 className="whitespace-nowrap text-xs font-semibold uppercase tracking-wider">
        {text}
      </h3>
      <Separator />
    </div>
  );
}
