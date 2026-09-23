'use client';

import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import type { TabsProps, TabItemProps } from './types';

import { Tab, TabGroup, TabList } from '@headlessui/react';
import { useEffect, useState } from 'react';
import { motion } from 'motion/react';

import { cn } from '@/utils/cn';
import customEventUtils, { CustomEvents } from '@/utils/custom-event-utils';

import { tabsVariantStyles, tabsSizeStyles } from './tabs.variants';
import { DEFAULT_TABS_VARIANT, DEFAULT_TABS_SIZE } from './constants';

export function Tabs<const T extends ReactNode = string>({
  tabs,
  activeTab,
  defaultActiveTab = '',
  tabIcons,
  tabLabels,
  tabBadges,
  variant = DEFAULT_TABS_VARIANT,
  size = DEFAULT_TABS_SIZE,
  fullWidth = false,
  disabled = false,
  className,
  tabClassName,
  activeClassName,
  inactiveClassName,
  onChange = () => {},
}: TabsProps<T>) {
  const [internalTab, setInternalTab] = useState(defaultActiveTab || tabs[0]);

  // Support controlled vs uncontrolled mode
  const currentTab = activeTab !== undefined ? activeTab : internalTab;

  const currentIdx = Math.max(
    0,
    tabs.findIndex((t) => t === currentTab)
  );

  // Bind custom event listener to trigger tab switch remotely
  useEffect(() => {
    const handler = (e: CustomEvent) => {
      const { tab = '' } = e.detail;
      if (!tabs.includes(tab)) return;
      if (activeTab === undefined) {
        setInternalTab(tab);
      }
      onChange(tab);
    };

    const unsubscriber = customEventUtils.on(
      CustomEvents.common.switchTab,
      handler
    );

    return () => unsubscriber();
  }, [tabs, activeTab, onChange]);

  const onTabClick = (mode: T) => {
    if (mode === currentTab) return;
    if (activeTab === undefined) {
      setInternalTab(mode);
    }
    onChange(mode);
  };

  const handleIndexChange = (index: number) => {
    const target = tabs[index];
    if (target !== undefined) {
      onTabClick(target);
    }
  };

  const currentVariant =
    tabsVariantStyles[variant] || tabsVariantStyles.default;

  const getTabIcon = (mode: T, idx: number): LucideIcon | undefined => {
    if (!tabIcons) return undefined;
    if (Array.isArray(tabIcons)) return tabIcons[idx];
    if (typeof mode === 'string' && tabIcons[mode]) return tabIcons[mode];
    return undefined;
  };

  const getTabLabel = (mode: T, idx: number): ReactNode => {
    if (!tabLabels) return mode;
    if (typeof tabLabels === 'function') return tabLabels(mode, idx);
    if (typeof mode === 'string' && tabLabels[mode] !== undefined)
      return tabLabels[mode];
    return mode;
  };

  const getTabBadge = (mode: T, idx: number): ReactNode => {
    if (!tabBadges) return null;
    if (typeof tabBadges === 'function') return tabBadges(mode, idx);
    if (typeof mode === 'string' && tabBadges[mode] !== undefined)
      return tabBadges[mode];
    return null;
  };

  const getIsDisabled = (mode: T, idx: number): boolean => {
    if (typeof disabled === 'function') return disabled(mode, idx);
    return Boolean(disabled);
  };

  return (
    <TabGroup selectedIndex={currentIdx} onChange={handleIndexChange}>
      <TabList
        className={cn(
          'flex max-w-full items-stretch overflow-x-auto overflow-y-hidden',
          currentVariant.container,
          fullWidth && 'w-full',
          className
        )}
      >
        {tabs.map((mode, idx) => (
          <TabItem
            key={idx}
            mode={mode}
            index={idx}
            isActive={currentTab === mode}
            isDisabled={getIsDisabled(mode, idx)}
            icon={getTabIcon(mode, idx)}
            label={getTabLabel(mode, idx)}
            badge={getTabBadge(mode, idx)}
            size={size}
            variant={variant}
            fullWidth={fullWidth}
            tabClassName={tabClassName}
            activeClassName={activeClassName}
            inactiveClassName={inactiveClassName}
            onClick={onTabClick}
          />
        ))}
      </TabList>
    </TabGroup>
  );
}

function TabItem<const T extends ReactNode = string>({
  mode,
  isActive,
  isDisabled,
  icon: Icon,
  label,
  badge,
  size,
  variant,
  fullWidth,
  tabClassName,
  activeClassName,
  inactiveClassName,
  onClick,
}: TabItemProps<T>) {
  const currentVariant =
    tabsVariantStyles[variant] || tabsVariantStyles.default;
  const currentSize = tabsSizeStyles[size] || tabsSizeStyles.base;

  return (
    <Tab
      disabled={isDisabled}
      onClick={() => onClick(mode)}
      className={cn(
        'relative -mb-px flex select-none items-center justify-center outline-none transition-all duration-200 focus-visible:ring-2 focus-visible:ring-sky-500/50',
        currentSize.padding,
        currentSize.text,
        currentSize.gap,
        fullWidth && 'flex-1',
        isDisabled && 'cursor-not-allowed opacity-50',
        isActive
          ? cn(currentVariant.active, activeClassName)
          : cn(currentVariant.inactive, inactiveClassName),
        tabClassName
      )}
    >
      {Icon && <Icon className="h-4 w-4 shrink-0" />}
      <span>{label}</span>
      {badge}
      {isActive && (
        <motion.div
          layoutId="tab-underline"
          className="absolute bottom-0 h-1 w-full bg-sky-600 dark:bg-sky-400"
        />
      )}
    </Tab>
  );
}
