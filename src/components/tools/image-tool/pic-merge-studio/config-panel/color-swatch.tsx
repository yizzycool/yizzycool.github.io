'use client';

import { Ban } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';

export type ColorSwatchProps = {
  color: string;
  isActive: boolean;
  onClick: (color: string) => void;
  isBan?: boolean;
  title?: string;
  showTitle?: boolean;
  className?: string;
  buttonClassName?: string;
};

export function ColorSwatch({
  color,
  isActive,
  onClick,
  isBan = false,
  title,
  showTitle = true,
  className,
  buttonClassName,
}: ColorSwatchProps) {
  return (
    <div
      className={cn(
        'flex aspect-square items-center justify-center p-0.5',
        className
      )}
    >
      <Button
        title={showTitle ? title || (isBan ? 'No Border' : color) : undefined}
        onClick={() => onClick(color)}
        icon={isBan ? Ban : undefined}
        iconClassName="h-full w-full"
        variant="ghost"
        rounded="full"
        bordered={false}
        hoverEffect={false}
        style={isBan ? undefined : { backgroundColor: color }}
        className={cn(
          'aspect-square h-full w-full p-0',
          isBan
            ? 'bg-white text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400'
            : 'border border-black/10 dark:border-white/15',
          isActive
            ? 'ring-2 ring-sky-500 ring-offset-2 ring-offset-white dark:ring-sky-400 dark:ring-offset-neutral-900'
            : '',
          buttonClassName
        )}
      />
    </div>
  );
}

export default ColorSwatch;
