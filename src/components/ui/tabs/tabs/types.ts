import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import type { ButtonSize } from '@/types/common/button';

export type TabsVariant = 'default' | 'sky' | 'neutral' | 'pill-bottom';

export type TabsSize = ButtonSize;

/**
 * Props for the Tabs component.
 */
export type TabsProps<T extends ReactNode = string> = {
  /** List of tab identifiers */
  tabs: T[];
  /** Controlled active tab value */
  activeTab?: T;
  /** Uncontrolled default active tab value */
  defaultActiveTab?: T | '';
  /** Optional icon mapping by index or tab value */
  tabIcons?: Array<LucideIcon> | Record<string, LucideIcon>;
  /** Optional label mapping or resolver function */
  tabLabels?:
    | Record<string, ReactNode>
    | ((tab: T, index: number) => ReactNode);
  /** Optional badge mapping or resolver function */
  tabBadges?:
    | Record<string, ReactNode>
    | ((tab: T, index: number) => ReactNode);
  /** Visual variant style (default: 'default') */
  variant?: TabsVariant;
  /** Size scale (default: 'base') */
  size?: TabsSize;
  /** Whether tabs expand to fill the entire container */
  fullWidth?: boolean;
  /** Disables tabs (globally or per tab) */
  disabled?: boolean | ((tab: T, index: number) => boolean);
  /** Additional CSS classes for outer container */
  className?: string;
  /** Additional CSS classes for tab items */
  tabClassName?: string;
  /** Additional CSS classes for active tab */
  activeClassName?: string;
  /** Additional CSS classes for inactive tabs */
  inactiveClassName?: string;
  /** Change callback fired when active tab changes */
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
