import type { ChangeEvent } from 'react';

/**
 * Props for the range Slider component.
 */
export type SliderProps = {
  /** Form field title text */
  title?: string;
  /** Subtitle / helper description text */
  desc?: string;
  /** Minimum allowable numeric value */
  min: number;
  /** Maximum allowable numeric value */
  max: number;
  /** Current numeric slider value */
  value: number;
  /** Step increment between values (default: 1) */
  step?: number;
  /** Whether to show a floating value bubble while sliding */
  showBubble?: boolean;
  /** Whether to show a current numeric value badge */
  showValueBadge?: boolean;
  /** Unit suffix to append after value in badge/bubble (e.g. 'px', '%') */
  unit?: string;
  /** Change callback fired when the slider value changes */
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  /** Accessible label for the range input */
  ariaLabel?: string;
  /** HTML id attribute */
  id?: string;
  /** Additional CSS class names for outer wrapper */
  className?: string;
  /** Additional CSS classes for the title */
  titleClassName?: string;
  /** Additional CSS classes for the description */
  descClassName?: string;
};
