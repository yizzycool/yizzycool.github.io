import type { ChangeEvent } from 'react';

export type SliderProps = {
  title?: string;
  desc?: string;
  min: number;
  max: number;
  value: number;
  step?: number;
  showBubble?: boolean;
  showValueBadge?: boolean;
  unit?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  ariaLabel?: string;
  id?: string;
  className?: string;
};
