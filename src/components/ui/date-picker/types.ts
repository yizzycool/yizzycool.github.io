export type DatePickerSize = 'sm' | 'base';

export interface DatePickerProps {
  /** Controlled date string (`YYYY-MM-DD`, or `YYYY-MM-DDTHH:mm` / `YYYY-MM-DDTHH:mm:ss` when `showTime` is enabled) */
  value: string;
  /** Change callback emitting formatted date (and time when `showTime` is enabled) */
  onChange: (value: string) => void;
  /** Enable hour/minute selector footer */
  showTime?: boolean;
  /** Enable seconds input alongside hours and minutes (requires `showTime`) */
  showSeconds?: boolean;
  /** Optional HTML id for the trigger button */
  id?: string;
  /** Placeholder shown when value is empty or unparseable */
  placeholder?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Visual size scale (default: 'sm') */
  size?: DatePickerSize;
  /** Minimum selectable year in dropdown (default: 1900) */
  minYear?: number;
  /** Maximum selectable year in dropdown (default: 2100) */
  maxYear?: number;
  /** Optional extra CSS classes for the trigger button */
  className?: string;
}
