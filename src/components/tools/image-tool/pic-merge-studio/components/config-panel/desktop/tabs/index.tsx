'use client';

import clsx from 'clsx';
import { useState } from 'react';

import BaseTabs from '@/components/common/tabs/base';

type Props = {
  tabs: string[];
  discardActiveObject: () => void;
  children: JSX.Element;
};

export default function Tabs({ tabs, discardActiveObject, children }: Props) {
  const [activeTab, setActiveTab] = useState(tabs[0]);

  const onChange = (tab: string) => {
    setActiveTab(tab);

    if (tab === tabs[0]) {
      discardActiveObject();
    }
  };

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <BaseTabs
        tabs={tabs}
        onChange={onChange}
        className="font-bold *:flex-1"
      />
      <div className="flex-1 overflow-hidden">
        <div
          className={clsx(
            'flex flex-1 flex-nowrap transition-all duration-500',
            'h-full *:min-w-full'
          )}
          style={{
            transform: `translate3d(-${100 * tabs.indexOf(activeTab)}%, 0, 0)`,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
