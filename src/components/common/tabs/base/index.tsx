'use client';

import type { LucideIcon } from 'lucide-react';

import { useEffect, useState } from 'react';

import { cn } from '@/utils/cn';
import customEventUtils, { CustomEvents } from '@/utils/custom-event-utils';
import Button from '@/components/common/button';

type Props = {
  tabs: Array<string>;
  tabIcons?: Array<LucideIcon>;
  defaultActiveTab?: string;
  onChange?: (tab: string) => void;
  className?: string;
};

export default function BaseTabs({
  tabs,
  tabIcons = [],
  defaultActiveTab = '',
  onChange = () => {},
  className,
}: Props) {
  const [tab, setTab] = useState(defaultActiveTab || tabs[0]);

  // Bind an event listener to trigger tab switch
  useEffect(() => {
    const handler = (e: CustomEvent) => {
      const { tab = '' } = e.detail;
      if (!tabs.includes(tab)) return;
      setTab(tab);
      onChange(tab);
    };

    const unsubscriber = customEventUtils.on(
      CustomEvents.common.switchTab,
      handler
    );

    return () => unsubscriber();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabs]);

  const onTabClick = (mode: string) => {
    if (mode === tab) return;
    setTab(mode);
    onChange(mode);
  };

  return (
    <div
      className={cn(
        'flex items-stretch border-b border-slate-200/80 dark:border-neutral-700',
        'max-w-full overflow-x-auto overflow-y-hidden',
        className
      )}
    >
      {tabs.map((mode, idx) => (
        <BaseTabItem
          key={mode}
          mode={mode}
          icon={tabIcons[idx]}
          isActive={tab === mode}
          onClick={onTabClick}
        />
      ))}
    </div>
  );
}

type BaseTabItemProps = {
  mode: string;
  icon?: LucideIcon;
  isActive: boolean;
  onClick: (mode: string) => void;
};

function BaseTabItem({ mode, icon, isActive, onClick }: BaseTabItemProps) {
  return (
    <Button
      variant="ghost"
      rounded="none"
      icon={icon}
      onClick={() => onClick(mode)}
      hoverEffect={false}
      className={cn(
        'relative -mb-px flex select-none items-center justify-center border-b-2 pb-2.5 pt-1 text-sm font-semibold transition-all duration-200',
        isActive
          ? 'border-sky-600 font-bold text-sky-600 dark:border-sky-400 dark:text-sky-400'
          : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
      )}
    >
      {mode}
    </Button>
  );
}
