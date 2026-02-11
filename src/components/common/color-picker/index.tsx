'use client';

import clsx from 'clsx';

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
      className={clsx(
        'h-10 w-10 cursor-pointer rounded-lg bg-transparent',
        className
      )}
      aria-label={ariaLabel ?? 'Color picker'}
    />
  );
}
