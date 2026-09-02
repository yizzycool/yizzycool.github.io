import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import type { ButtonSize } from '@/types/common/button';
import type { Rounded } from '@/types/common';

export type PillTabsVariant =
  | 'segment'
  | 'default'
  | 'neutral'
  | 'primary'
  | 'ghost'
  | 'outline'
  | 'blue';

export type PillTabsSize = ButtonSize;

export type PillTabsProps<T extends ReactNode = string> = {
  tabs: T[];
  activeTab?: T;
  defaultActiveTab?: T | '';
  tabIcons?: Array<LucideIcon> | Record<string, LucideIcon>;
  tabLabels?:
    | Record<string, ReactNode>
    | ((tab: T, index: number) => ReactNode);
  tabBadges?:
    | Record<string, ReactNode>
    | ((tab: T, index: number) => ReactNode);
  variant?: PillTabsVariant;
  rounded?: Rounded;
  size?: PillTabsSize;
  fullWidth?: boolean;
  disabled?: boolean | ((tab: T, index: number) => boolean);
  className?: string;
  tabClassName?: string;
  activeClassName?: string;
  inactiveClassName?: string;
  onChange?: (tab: T) => void;
};

export type PillTabItemProps<T extends ReactNode = string> = {
  mode: T;
  index: number;
  isActive: boolean;
  isDisabled: boolean;
  icon?: LucideIcon;
  label: ReactNode;
  badge?: ReactNode;
  size: PillTabsSize;
  rounded: Rounded;
  variant: PillTabsVariant;
  fullWidth?: boolean;
  tabClassName?: string;
  activeClassName?: string;
  inactiveClassName?: string;
  onClick: (mode: T) => void;
};
