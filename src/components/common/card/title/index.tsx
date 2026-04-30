'use client';

import type { LucideIcon } from 'lucide-react';
import { cn } from '@/utils/cn';

type Props = {
  icon?: LucideIcon;
  children?: React.ReactNode;
  className?: string;
};

export default function CardTitle({
  icon: Icon,
  children,
  className = '',
}: Props) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {!!Icon && <Icon className="h-5 w-5 text-neutral-500" />}
      {!!children && <h3 className="text-lg font-semibold">{children}</h3>}
    </div>
  );
}
