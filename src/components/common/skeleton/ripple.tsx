import { ImageIcon } from 'lucide-react';
import { cn } from '@/utils/cn';

type Props = {
  className?: string;
};

/**
 * A reusable loading skeleton component with a central icon and concentric expanding ripples.
 */
export default function Ripple({ className = '' }: Props) {
  return (
    <div
      className={cn(
        'relative flex items-center justify-center overflow-hidden',
        className
      )}
    >
      {/* Concentric expanding ripples */}
      <div className="absolute h-12 w-12 animate-ping rounded-full border border-indigo-500/20 [animation-duration:3s] dark:border-indigo-300/50" />
      <div className="absolute h-24 w-24 animate-ping rounded-full border border-indigo-500/10 [animation-delay:1.5s] [animation-duration:3s] dark:border-indigo-300/40" />

      {/* Central glassmorphic icon block */}
      <div className="relative z-10 flex items-center justify-center rounded-full bg-white/30 p-3 backdrop-blur-sm dark:bg-neutral-600/30">
        <ImageIcon className="h-6 w-6 text-indigo-500 opacity-50 dark:text-indigo-300" />
      </div>
    </div>
  );
}
