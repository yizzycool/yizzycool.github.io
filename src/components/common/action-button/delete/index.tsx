'use client';

import clsx from 'clsx';
import { Trash2 } from 'lucide-react';

export default function DeleteAction({
  disabled = false,
  onClick = () => {},
  size = 12,
}: {
  disabled?: boolean;
  onClick?: () => void;
  size?: number;
}) {
  const onButtonClick = () => {
    if (disabled) return;

    onClick();
  };

  return (
    <button
      onClick={onButtonClick}
      className={clsx(
        'flex items-center gap-1 rounded px-2 py-1 text-xs text-red-600 transition',
        'bg-red-500/10 hover:bg-red-600/20',
        'dark:text-red-400 dark:hover:bg-red-400/20',
        disabled && 'pointer-events-none opacity-50'
      )}
    >
      <Trash2 size={size} /> Clear
    </button>
  );
}
