import { cn } from '@/utils/cn';

type Props = {
  className?: string;
};

/**
 * A reusable loading skeleton component with a soft pulse breathing effect.
 */
export default function Pulse({ className = '' }: Props) {
  return (
    <div
      className={cn(
        'animate-pulse bg-neutral-200/50 dark:bg-neutral-500/50',
        className
      )}
    />
  );
}
