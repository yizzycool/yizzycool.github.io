'use client';

import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import type { PillTabsProps, PillTabItemProps } from './types';

import { useEffect, useState } from 'react';

import { cn } from '@/utils/cn';
import customEventUtils, { CustomEvents } from '@/utils/custom-event-utils';

import {
  pillTabsVariantStyles,
  pillTabsSizeStyles,
  pillTabsRoundedMap,
} from './pill-tabs.variants';
import {
  DEFAULT_PILL_TABS_VARIANT,
  DEFAULT_PILL_TABS_SIZE,
  DEFAULT_PILL_TABS_ROUNDED,
} from './constants';

function PillTabs<const T extends ReactNode = string>({
  tabs,
  activeTab,
  defaultActiveTab = '',
  tabIcons,
  tabLabels,
  tabBadges,
  variant = DEFAULT_PILL_TABS_VARIANT,
  rounded = DEFAULT_PILL_TABS_ROUNDED,
  size = DEFAULT_PILL_TABS_SIZE,
  fullWidth = false,
  disabled = false,
  className = '',
  tabClassName = '',
  activeClassName = '',
  inactiveClassName = '',
  onChange = () => {},
}: PillTabsProps<T>) {
  const [internalTab, setInternalTab] = useState(defaultActiveTab || tabs[0]);

  // Support controlled vs uncontrolled mode
  const currentTab = activeTab !== undefined ? activeTab : internalTab;

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

  const currentVariant =
    pillTabsVariantStyles[variant] || pillTabsVariantStyles.default;
  const currentRounded = pillTabsRoundedMap[rounded] || pillTabsRoundedMap.base;

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
    <div
      className={cn(
        'inline-flex items-center',
        currentRounded.container,
        currentVariant.container,
        fullWidth && 'w-full',
        className
      )}
    >
      {tabs.map((mode, idx) => (
        <PillTabItem
          key={idx}
          mode={mode}
          index={idx}
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
    </div>
  );
}

function PillTabItem<const T extends ReactNode = string>({
  mode,
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
}: PillTabItemProps<T>) {
  const currentVariant =
    pillTabsVariantStyles[variant] || pillTabsVariantStyles.default;
  const currentRounded = pillTabsRoundedMap[rounded] || pillTabsRoundedMap.base;
  const currentSize = pillTabsSizeStyles[size] || pillTabsSizeStyles.xs;

  return (
    <button
      type="button"
      disabled={isDisabled}
      onClick={() => onClick(mode)}
      className={cn(
        'flex select-none items-center justify-center font-medium transition-all duration-200',
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
      {Icon && <Icon size={currentSize.iconSize} className="shrink-0" />}
      <span>{label}</span>
      {badge}
    </button>
  );
}

export { PillTabs };
