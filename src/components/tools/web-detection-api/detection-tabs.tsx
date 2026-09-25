'use client';

import { usePathname } from 'next/navigation';

import { cn } from '@/utils/cn';

import { DETECTION_TABS } from './data/detection-tabs';

import DetectionTabItem from './detection-tab-item';

type Props = {
  className?: string;
};

export default function DetectionTabs({ className = '' }: Props) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Web Detection tools navigation"
      className={cn('flex flex-wrap items-center gap-2', className)}
    >
      <div className="inline-flex flex-wrap items-center gap-1 rounded-2xl border border-neutral-200/80 bg-neutral-100/80 p-1 dark:border-neutral-800 dark:bg-neutral-900/80">
        {DETECTION_TABS.map((tab) => (
          <DetectionTabItem
            key={tab.href}
            tab={tab}
            isActive={pathname === tab.href}
          />
        ))}
      </div>
    </nav>
  );
}
