'use client';

import { usePathname } from 'next/navigation';

import { cn } from '@/utils/cn';

import { TEXT_AI_TABS } from './data/text-ai-tabs';

import TextTabItem from './text-tab-item';

type Props = {
  className?: string;
};

export default function TextTabs({ className = '' }: Props) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Text AI tools navigation"
      className={cn('flex flex-wrap items-center gap-2', className)}
    >
      <div className="inline-flex flex-wrap items-center gap-1 rounded-2xl border border-neutral-200/80 bg-neutral-100/80 p-1 dark:border-neutral-800 dark:bg-neutral-900/80">
        {TEXT_AI_TABS.map((tab) => (
          <TextTabItem
            key={tab.href}
            tab={tab}
            isActive={pathname === tab.href}
          />
        ))}
      </div>
    </nav>
  );
}
