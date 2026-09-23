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

/**
 * Props for the PillTabs component.
 */
export type PillTabsProps<T extends ReactNode = string> = {
  /** Array of tab keys or values */
  tabs: T[];
  /** Controlled active tab value */
  activeTab?: T;
  /** Uncontrolled default active tab value */
  defaultActiveTab?: T | '';
  /** Optional icon mapping (by index or tab key) */
  tabIcons?: Array<LucideIcon> | Record<string, LucideIcon>;
  /** Optional label mapping or function */
  tabLabels?:
    | Record<string, ReactNode>
    | ((tab: T, index: number) => ReactNode);
  /** Optional badge content mapping or function */
  tabBadges?:
    | Record<string, ReactNode>
    | ((tab: T, index: number) => ReactNode);
  /** Visual variant style for the pills (default: 'default') */
  variant?: PillTabsVariant;
  /** Rounded corner style */
  rounded?: Rounded;
  /** Size scale (default: 'base') */
  size?: PillTabsSize;
  /** Whether the tabs expand to fill the full container width */
  fullWidth?: boolean;
  /** Whether tabs are disabled (boolean for all or predicate per tab) */
  disabled?: boolean | ((tab: T, index: number) => boolean);
  /** Additional CSS classes for outer container */
  className?: string;
  /** Additional CSS classes for each tab button */
  tabClassName?: string;
  /** Additional CSS classes applied only to the active tab */
  activeClassName?: string;
  /** Additional CSS classes applied only to inactive tabs */
  inactiveClassName?: string;
  /** Callback fired when the active tab changes */
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
