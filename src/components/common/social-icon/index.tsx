'use client';

import { LucideIcon } from 'lucide-react';

import { cn } from '@/utils/cn';

type Props = {
  icon: LucideIcon;
  href?: string;
  size?: number;
};

export default function SocialIcon({
  icon: Icon,
  href = '',
  size = 20,
}: Props) {
  return (
    <a
      href={href}
      target="_blank"
      className={cn(
        'transform rounded-full p-2 transition-all duration-300',
        'hover:scale-110 hover:bg-neutral-100 dark:hover:bg-neutral-700',
        'text-slate-500 dark:text-slate-400',
        'hover:text-slate-900 dark:hover:text-white'
      )}
    >
      <Icon size={size} />
    </a>
  );
}
