'use client';

import clsx from 'clsx';
import { Frame, Image, LucideIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

import customEventUtils, { CustomEvents } from '@/utils/custom-event-utils';
import Button from '@/components/common/button';

import _zip from 'lodash/zip';

type Props = {
  discardActiveObject: () => void;
  children: JSX.Element;
};

const tabs: string[] = ['Canvas', 'Image'];
const tabsIcon: LucideIcon[] = [Frame, Image];

export default function Tabs({ discardActiveObject, children }: Props) {
  const [activeTab, setActiveTab] = useState(tabs[0]);

  // Bind a event listener to trigger tab switch
  useEffect(() => {
    const handler = (e: CustomEvent) => {
      const { tab = '' } = e.detail;
      if (!tabs.includes(tab)) return;
      setActiveTab(tab);
      onChange(tab);
    };

    const unsubscriber = customEventUtils.on(
      CustomEvents.common.switchTab,
      handler
    );

    return () => unsubscriber();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onChange = (tab: string) => {
    setActiveTab(tab);

    if (tab === tabs[0]) {
      discardActiveObject();
    }
  };

  return (
    <>
      <div className="max-w-full overflow-x-hidden">
        <div
          className="flex flex-1 flex-nowrap transition-all duration-500 *:min-w-full"
          style={{
            transform: `translate3d(-${100 * tabs.indexOf(activeTab)}%, 0, 0)`,
          }}
        >
          {children}
        </div>
      </div>
      {/* Tabs */}
      <div className="flex w-full *:flex-1">
        {(_zip(tabs, tabsIcon) as [string, LucideIcon][]).map(([tab, Icon]) => (
          <Button
            key={tab}
            variant="ghost"
            rounded="none"
            onClick={() => onChange(tab)}
            className={clsx(
              'flex-col items-center space-y-2 hover:bg-transparent dark:hover:bg-transparent',
              activeTab === tab && 'text-sky-600 dark:text-sky-600'
            )}
          >
            <Icon size={20} />
            <div className="text-xs font-bold uppercase">{tab}</div>
          </Button>
        ))}
      </div>
      <div id="pic-merge-studio-mobile-config-drawer" />
    </>
  );
}
