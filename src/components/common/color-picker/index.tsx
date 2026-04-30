'use client';

import { cn } from '@/utils/cn';

type Props = {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  id?: string;
  className?: string;
  ariaLabel?: string;
};

export default function ColorPicker({
  value,
  onChange,
  id,
  className,
  ariaLabel,
}: Props) {
  return (
    <input
      id={id}
      type="color"
      value={value}
      onChange={onChange}
      className={cn(
        'h-10 w-10 cursor-pointer rounded-lg bg-transparent',
        className
      )}
      aria-label={ariaLabel ?? 'Color picker'}
    />
  );
}
