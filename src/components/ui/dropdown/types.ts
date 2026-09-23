import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

/**
 * Supported placement positions for the dropdown menu relative to the trigger.
 */
export type DropdownPlacement =
  | 'bottom'
  | 'bottom start'
  | 'bottom end'
  | 'top'
  | 'top start'
  | 'top end'
  | 'left'
  | 'left start'
  | 'left end'
  | 'right'
  | 'right start'
  | 'right end';

/**
 * Item data configuration when passing items as an array to Dropdown.
 */
export type DropdownItemType = {
  /** Unique identifier for the item (falls back to index if not provided) */
  id?: string;
  /** Display label or custom node rendered inside the item */
  label: ReactNode;
  /** Optional icon component rendered to the left of the label */
  icon?: LucideIcon;
  /** Click event handler invoked when the item is selected */
  onClick?: () => void;
  /** Whether the item is disabled and non-interactive */
  disabled?: boolean;
  /** Whether this is a destructive or danger action (rendered in red styling) */
  isDanger?: boolean;
  /** Whether the item represents the currently active / selected state */
  isActive?: boolean;
  /** Additional CSS class names for custom item styling */
  className?: string;
};

/**
 * Props for the Dropdown component.
 */
export type DropdownProps = {
  /** Trigger element that toggles the dropdown menu when clicked */
  trigger: ReactNode;
  /** Optional list of menu items to render; alternatively use declarative children */
  items?: DropdownItemType[];
  /** Anchor placement direction relative to the trigger (default: 'bottom end') */
  placement?: DropdownPlacement;
  /** Additional CSS classes for the outer Menu container */
  className?: string;
  /** Additional CSS classes for the floating dropdown panel */
  menuClassName?: string;
  /**
   * Whether to enable modal mode in MenuItems.
   * When true, window scrollbar is locked while menu is open.
   * When false (default), window scrolling remains unlocked to prevent scrollbar layout shift.
   * @default false
   */
  modal?: boolean;
  /** Declarative child elements (such as DropdownItem or DropdownSeparator) */
  children?: ReactNode;
};

/**
 * Props for the DropdownItem subcomponent.
 */
export type DropdownItemProps = {
  /** Display label for the item */
  label?: ReactNode;
  /** Optional Lucide icon displayed on the left */
  icon?: LucideIcon;
  /** Click callback invoked when the item is activated */
  onClick?: () => void;
  /** Disables click interaction and dims appearance */
  disabled?: boolean;
  /** Applies danger / destructive red styling */
  isDanger?: boolean;
  /** Highlights the item as currently active / selected */
  isActive?: boolean;
  /** Additional custom class names for the button */
  className?: string;
  /** Alternative or custom child node content */
  children?: ReactNode;
};
