import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import type { ButtonSize } from '@/types/common/button';

export type TabsVariant = 'default' | 'sky' | 'neutral' | 'pill-bottom';

export type TabsSize = ButtonSize;

export type TabsProps<T extends ReactNode = string> = {
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
  variant?: TabsVariant;
  size?: TabsSize;
  fullWidth?: boolean;
  disabled?: boolean | ((tab: T, index: number) => boolean);
  className?: string;
  tabClassName?: string;
  activeClassName?: string;
  inactiveClassName?: string;
  onChange?: (tab: T) => void;
};

export type TabItemProps<T extends ReactNode = string> = {
  mode: T;
  index: number;
  isActive: boolean;
  isDisabled: boolean;
  icon?: LucideIcon;
  label: ReactNode;
  badge?: ReactNode;
  size: TabsSize;
  variant: TabsVariant;
  fullWidth?: boolean;
  tabClassName?: string;
  activeClassName?: string;
  inactiveClassName?: string;
  onClick: (mode: T) => void;
};
