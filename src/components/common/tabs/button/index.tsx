import type { ButtonSize, ButtonVariant } from '@/types/common/button';
import type { LucideIcon } from 'lucide-react';
import type { Rounded } from '@/types/common';

import clsx from 'clsx';
import { useEffect, useState } from 'react';

import Button from '@/components/common/button';
import customEventUtils, { CustomEvents } from '@/utils/custom-event-utils';

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
  gap = 'gap-2',
  variant = 'ghost',
  rounded = 'base',
  bordered = true,
  size = 'base',
  className = '',
  activeClassName = '',
  onChange = () => {},
}: Props) {
  const [tab, setTab] = useState(defaultActiveTab || tabs[0]);

  // Bind a event listener to trigger tab switch
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
    <div className={`flex ${gap} overflow-x-auto`}>
      {tabs.map((mode, idx) => (
        <Button
          key={mode}
          variant={variant}
          size={size}
          bordered={bordered}
          rounded={rounded}
          onClick={() => onTabClick(mode)}
          icon={tabIcons[idx]}
          className={clsx(
            className,
            tab === mode &&
              clsx(
                'text-sky-600 dark:text-sky-600',
                'border-sky-500 dark:border-sky-600',
                'bg-sky-100/50 dark:bg-sky-900/50',
                'hover:bg-sky-100/50 hover:dark:bg-sky-900/50',
                activeClassName
              )
          )}
        >
          {mode}
        </Button>
      ))}
    </div>
  );
}
