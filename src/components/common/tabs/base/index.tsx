import clsx from 'clsx';
import { useEffect, useState } from 'react';

import customEventUtils, { CustomEvents } from '@/utils/custom-event-utils';
import Button from '@/components/common/button';

type Props = {
  tabs: Array<string>;
  defaultActiveTab?: string;
  onChange?: (tab: string) => void;
  className?: string;
};

export default function BaseTabs({
  tabs,
  defaultActiveTab = '',
  onChange = () => {},
  className,
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
    <div className={clsx('flex', className)}>
      {tabs.map((mode) => (
        <Button
          key={mode}
          variant="ghost"
          rounded="none"
          onClick={() => onTabClick(mode)}
          className={
            tab === mode
              ? 'border-b-2 border-sky-600 text-sky-600 dark:border-sky-600 dark:text-sky-600'
              : 'border-b-2 border-neutral-300 dark:border-neutral-600'
          }
        >
          {mode}
        </Button>
      ))}
    </div>
  );
}
