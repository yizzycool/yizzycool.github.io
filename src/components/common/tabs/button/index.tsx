'use client';

import type { LucideIcon } from 'lucide-react';
import type { ButtonSize, ButtonVariant } from '@/types/common/button';
import type { Rounded } from '@/types/common';

import { cn } from '@/utils/cn';
import { useEffect, useState } from 'react';
import customEventUtils, { CustomEvents } from '@/utils/custom-event-utils';
import Button from '@/components/common/button';

type Props = {
  tabs: Array<string>;
  tabIcons?: Array<LucideIcon>;
  defaultActiveTab?: string;
  gap?: string;
  variant?: ButtonVariant;
  rounded?: Rounded;
  bordered?: boolean;
  size?: ButtonSize;
  className?: string;
  activeClassName?: string;
  onChange?: (tab: string) => void;
};

export default function ButtonTabs({
  tabs,
  tabIcons = [],
  defaultActiveTab = '',
  className = '',
  activeClassName = '',
  onChange = () => {},
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
        'inline-flex items-center rounded-lg p-1 shadow-inner',
        'bg-slate-100/80 dark:bg-neutral-800/80',
        className
      )}
    >
      {tabs.map((mode, idx) => (
        <TabItem
          key={mode}
          mode={mode}
          icon={tabIcons[idx]}
          isActive={tab === mode}
          activeClassName={activeClassName}
          onClick={onTabClick}
        />
      ))}
    </div>
  );
}

type TabItemProps = {
  mode: string;
  icon?: LucideIcon;
  isActive: boolean;
  activeClassName?: string;
  onClick: (mode: string) => void;
};

function TabItem({
  mode,
  icon,
  isActive,
  activeClassName = '',
  onClick,
}: TabItemProps) {
  return (
    <Button
      variant={isActive ? 'secondary' : 'ghost'}
      size="xs"
      rounded="lg"
      icon={icon}
      onClick={() => onClick(mode)}
      hoverEffect={!isActive}
      className={cn('select-none font-semibold', isActive && activeClassName)}
    >
      {mode}
    </Button>
  );
}
