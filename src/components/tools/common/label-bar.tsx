'use client';

import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { cn } from '@/utils/cn';
import Label from '@/components/common/label';

type Props = {
  label?: ReactNode;
  icon?: LucideIcon;
  htmlFor?: string;
  id?: string;
  className?: string;
  actionsClassName?: string;
  children?: ReactNode;
  actions?: ReactNode;
};

export default function LabelBar({
  label,
  icon,
  htmlFor,
  id,
  className,
  actionsClassName,
  children,
  actions,
}: Props) {
  const actionItems = actions ?? children;

  return (
    <div
      id={id}
      className={cn(
        'mb-3 flex w-full flex-col-reverse items-start justify-between gap-2 sm:flex-row sm:items-center',
        className
      )}
    >
      <Label htmlFor={htmlFor} icon={icon}>
        {label}
      </Label>
      {actionItems && (
        <div
          className={cn(
            'flex items-center gap-2 self-end sm:self-auto',
            actionsClassName
          )}
        >
          {actionItems}
        </div>
      )}
    </div>
  );
}
