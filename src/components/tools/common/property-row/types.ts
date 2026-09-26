import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

import type { BadgeVariant } from '@/components/ui/badge';
import type { SurfaceVariant } from '@/components/ui/surface';

/**
 * Data structure representing an individual key-value property item.
 */
export type PropertyItem = {
  /**
   * Optional unique identifier for the property item.
   * Useful as a React key or for DOM referencing.
   */
  id?: string;

  /**
   * The structural label / property name displayed at the top or left (e.g. "SHA-256", "QR Code").
   */
  label: string;

  /**
   * Primary raw value used for clipboard copying and default display.
   */
  value?: string | number | null;

  /**
   * Optional custom ReactNode for custom rendering (e.g. difference highlighting, color swatches).
   * When provided, this takes precedence over `value` in the visual presentation, while `value` is still used for copying.
   */
  displayValue?: ReactNode;

  /**
   * Supplementary badge text or custom badge element (e.g. "256-bit", "98%", status icon).
   */
  badge?: ReactNode | string;

  /**
   * Color variant for the badge when `badge` is provided as a string (e.g. "neutral", "success", "primary").
   */
  badgeVariant?: BadgeVariant;

  /**
   * Optional supplementary helper text or element displayed beneath the value (e.g. binary representation, IP address range).
   */
  subText?: ReactNode | string;

  /**
   * Visual surface variant of the row container (e.g. "default", "subtle", "elevated").
   */
  variant?: SurfaceVariant;

  /**
   * Whether to display the copy-to-clipboard action button. Defaults to true.
   */
  copyable?: boolean;

  /**
   * If true, the copy action is hidden on desktop until hover (`group-hover:opacity-100`), while remaining visible on mobile.
   */
  hoverAction?: boolean;

  /**
   * Custom action element to render on the right, overriding or augmenting the default copy action.
   */
  action?: ReactNode;

  /**
   * Whether the value should use a monospaced font family (`font-mono`). Defaults to true.
   */
  mono?: boolean;

  /**
   * Optional click handler for the entire row container (e.g. selecting, focusing canvas object).
   */
  onClick?: () => void;

  /**
   * Custom CSS class names applied to the outer container.
   */
  className?: string;

  /**
   * Custom CSS class names applied to the value text element.
   */
  valueClassName?: string;

  /**
   * Custom CSS class names applied to the label text element.
   */
  labelClassName?: string;
};

/**
 * Props for the `PropertyRow` component.
 */
export type PropertyRowProps = PropertyItem & {
  /**
   * Custom CSS class names applied to the outer surface container.
   */
  className?: string;
};

/**
 * Grid column layout configuration for responsive lists.
 */
export type PropertyColumns =
  | 1
  | 2
  | 3
  | 4
  | {
      sm?: 1 | 2 | 3 | 4;
      md?: 1 | 2 | 3 | 4;
      lg?: 1 | 2 | 3 | 4;
    };

/**
 * Props for the `PropertyList` component.
 */
export type PropertyListProps = {
  /**
   * Array of property items to render.
   */
  items?: PropertyItem[];

  /**
   * Optional child elements if items are composed manually.
   */
  children?: ReactNode;

  /**
   * Responsive column layout configuration (1, 2, 3, 4 columns, or responsive object). Defaults to 1.
   */
  columns?: PropertyColumns;

  /**
   * Default surface variant applied to all rendered items unless overridden per item.
   */
  variant?: SurfaceVariant;

  /**
   * Default copyable flag applied to all rendered items unless overridden per item.
   */
  copyable?: boolean;

  /**
   * Default hoverAction flag applied to all rendered items unless overridden per item.
   */
  hoverAction?: boolean;

  /**
   * Default monospaced font flag applied to all rendered items unless overridden per item.
   */
  mono?: boolean;

  /**
   * Spacing gap between list items ('sm' | 'base' | 'lg').
   */
  gap?: 'sm' | 'base' | 'lg';

  /**
   * Whether data is currently loading/processing. Displays a loading indicator.
   */
  isLoading?: boolean;

  /**
   * Loading status message displayed alongside the spinner (defaults to "Processing...").
   */
  loadingText?: string;

  /**
   * Message displayed when the items array is empty and not loading.
   */
  emptyText?: string;

  /**
   * Optional custom Lucide icon for the empty state.
   */
  emptyIcon?: LucideIcon;

  /**
   * Custom CSS class names applied to the list container.
   */
  className?: string;
};

/**
 * Props for the `PropertyResultCard` component.
 */
export type PropertyResultCardProps = {
  /**
   * Card title displayed in the header (defaults to "Results").
   */
  title?: string;

  /**
   * Lucide icon displayed alongside the card title.
   */
  titleIcon?: LucideIcon;

  /**
   * Total number of results / items to show in the count badge.
   */
  count?: number;

  /**
   * Custom badge text override (e.g. "5 Found", "10 Hashes").
   */
  countBadgeText?: string;

  /**
   * Additional action elements rendered in the card header.
   */
  headerActions?: ReactNode;

  /**
   * Callback invoked to copy all result values to clipboard. When provided, renders a "Copy All" action.
   */
  onCopyAll?: () => void;

  /**
   * Whether to constrain the list within a scrollable container. Defaults to true.
   */
  scrollable?: boolean;

  /**
   * CSS class controlling the maximum height when `scrollable` is enabled (defaults to "max-h-80").
   */
  maxHeightClass?: string;

  /**
   * Whether results are currently processing or loading.
   */
  isLoading?: boolean;

  /**
   * Loading message displayed while processing.
   */
  loadingText?: string;

  /**
   * Message displayed when no results are found.
   */
  emptyText?: string;

  /**
   * Optional custom Lucide icon for the empty state.
   */
  emptyIcon?: LucideIcon;

  /**
   * Array of property items to render.
   */
  items?: PropertyItem[];

  /**
   * Column configuration for the internal PropertyList.
   */
  columns?: PropertyColumns;

  /**
   * Optional custom child elements rendered inside the card body.
   */
  children?: ReactNode;

  /**
   * Custom CSS class names applied to the outer Card.
   */
  className?: string;
};
