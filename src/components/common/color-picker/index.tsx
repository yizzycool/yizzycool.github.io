'use client';

import clsx from 'clsx';

type Props = {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
};

export default function ColorPicker({ value, onChange, className }: Props) {
  return (
    <input
      type="color"
      value={value}
      onChange={onChange}
      className={clsx(
        'h-10 w-10 cursor-pointer rounded-lg bg-transparent',
        className
      )}
    />
  );
}
