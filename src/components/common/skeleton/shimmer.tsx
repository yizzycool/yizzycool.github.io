import { cn } from '@/utils/cn';

type Props = {
  className?: string;
};

/**
 * A reusable loading skeleton component with a 45-degree sweeping shimmer effect.
 */
export default function Shimmer({ className = '' }: Props) {
  return (
    <div
      className={cn(
        'relative overflow-hidden bg-neutral-200/50 dark:bg-neutral-500/50',
        className
      )}
    >
      <div
        className="shimmer-gradient animate-shimmer-sweep absolute"
        style={{
          width: '200%',
          height: '200%',
          top: '-50%',
          left: '-50%',
        }}
      />
    </div>
  );
}
