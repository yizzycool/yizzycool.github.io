export type SeparatorOrientation = 'vertical' | 'horizontal';

/**
 * Props for the Separator divider component.
 */
export type SeparatorProps = {
  /** Layout orientation of the divider (default: 'horizontal') */
  orientation?: SeparatorOrientation;
  /** Additional CSS class names */
  className?: string;
};
