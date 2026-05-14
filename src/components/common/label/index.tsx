'use client';

import type { LucideIcon } from 'lucide-react';
import { cn } from '@/utils/cn';

type Props = {
  htmlFor?: string;
  icon?: LucideIcon;
  className?: string;
  children: React.ReactNode;
};

const defaultClass =
  'flex items-center gap-2 font-semibold dark:text-neutral-300';

export default function Label({
  htmlFor,
  icon: Icon,
  className = '',
  children,
}: Props) {
  return !!htmlFor ? (
    <label htmlFor={htmlFor} className={cn(defaultClass, className)}>
      {!!Icon && <Icon className="inline-block" size={16} />}
      <span>{children}</span>
    </label>
  ) : (
    <div className={cn(defaultClass, className)}>
      {!!Icon && <Icon className="inline-block" size={16} />}
      <span>{children}</span>
    </div>
  );
}
