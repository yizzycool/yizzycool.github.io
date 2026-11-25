'use client';

import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import type { TabItemProps, TabsProps } from './types';

import { Tab, TabGroup, TabList } from '@headlessui/react';
import { motion } from 'motion/react';
import { useEffect, useId, useState } from 'react';

import { cn } from '@/utils/cn';
import customEventUtils, { CustomEvents } from '@/utils/custom-event-utils';

import {
  DEFAULT_TABS_ROUNDED,
  DEFAULT_TABS_SIZE,
  DEFAULT_TABS_VARIANT,
} from './constants';
import {
  tabsRoundedMap,
  tabsSizeStyles,
  tabsVariantStyles,
} from './tabs.variants';

export function Tabs<const T extends ReactNode = string>({
  tabs,
  activeTab,
  defaultActiveTab = '',
  tabIcons,
  tabLabels,
  tabBadges,
  variant = DEFAULT_TABS_VARIANT,
  rounded = DEFAULT_TABS_ROUNDED,
  size = DEFAULT_TABS_SIZE,
  fullWidth = false,
  disabled = false,
  className = '',
  tabClassName = '',
  activeClassName = '',
  inactiveClassName = '',
  onChange = () => {},
}: TabsProps<T>) {
  const [internalTab, setInternalTab] = useState(defaultActiveTab || tabs[0]);
  const instanceId = useId();

  const currentTab = activeTab !== undefined ? activeTab : internalTab;

  const currentIdx = Math.max(
    0,
    tabs.findIndex((t) => t === currentTab)
  );

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
  const currentRounded = tabsRoundedMap[rounded] || tabsRoundedMap.base;

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
          'inline-flex max-w-full items-center overflow-x-auto overflow-y-hidden',
          currentRounded.container,
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
            indicatorLayoutId={`tabs-indicator-${instanceId}`}
            isActive={currentTab === mode}
            isDisabled={getIsDisabled(mode, idx)}
            icon={getTabIcon(mode, idx)}
            label={getTabLabel(mode, idx)}
            badge={getTabBadge(mode, idx)}
            size={size}
            rounded={rounded}
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
  indicatorLayoutId,
  isActive,
  isDisabled,
  icon: Icon,
  label,
  badge,
  size,
  rounded,
  variant,
  fullWidth,
  tabClassName,
  activeClassName,
  inactiveClassName,
  onClick,
}: TabItemProps<T>) {
  const currentVariant =
    tabsVariantStyles[variant] || tabsVariantStyles.default;
  const currentRounded = tabsRoundedMap[rounded] || tabsRoundedMap.base;
  const currentSize = tabsSizeStyles[size] || tabsSizeStyles.xs;

  return (
    <Tab
      disabled={isDisabled}
      onClick={() => onClick(mode)}
      className={cn(
        'relative z-0 flex shrink-0 cursor-pointer select-none items-center justify-center whitespace-nowrap font-medium outline-none transition-colors duration-200',
        currentRounded.item,
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
      {isActive && (
        <motion.div
          layoutId={indicatorLayoutId}
          transition={{ type: 'spring', stiffness: 440, damping: 34 }}
          className={cn(
            'absolute inset-0 -z-10',
            currentRounded.item,
            currentVariant.indicator
          )}
        />
      )}
      {Icon && (
        <Icon size={currentSize.iconSize} className="relative z-10 shrink-0" />
      )}
      <span className="relative z-10">{label}</span>
      {badge && <span className="relative z-10">{badge}</span>}
    </Tab>
  );
}
