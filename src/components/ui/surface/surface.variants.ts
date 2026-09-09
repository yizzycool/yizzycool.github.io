import type { Animation, Rounded } from '@/types/common';
import type { SurfaceVariant } from '@/types/common/surface';
import { cn } from '@/utils/cn';

export const surfaceBaseStyles = 'relative transition-all duration-200';

export const surfaceRoundedMap: Record<Rounded, string> = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  base: 'rounded',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  '3xl': 'rounded-3xl',
  full: 'rounded-full',
};

export const surfaceAnimations: Record<Animation, string> = {
  none: '',
  'fade-in': 'animate-in fade-in duration-500',
};

export const getSurfaceVariants = (
  hoverEffect: boolean = true
): Record<SurfaceVariant, string> => ({
  default: cn(
    'border-neutral-200/90 bg-white/60 dark:border-neutral-700/80 dark:bg-neutral-800/40',
    hoverEffect && 'hover:border-neutral-300 dark:hover:border-neutral-600'
  ),
  elevated: cn(
    'border-neutral-200/80 bg-white shadow-2xs dark:border-neutral-800 dark:bg-neutral-900/80 dark:shadow-black/20',
    hoverEffect &&
      'hover:border-neutral-300 hover:shadow-xs dark:hover:border-neutral-700 dark:hover:shadow-black/40'
  ),
  ghost: cn(
    'border-transparent bg-transparent',
    hoverEffect &&
      'hover:border-neutral-200/80 hover:bg-neutral-100/60 dark:hover:border-neutral-700/60 dark:hover:bg-neutral-800/40'
  ),
  glass: cn(
    'border-white/60 bg-white/40 shadow-2xs backdrop-blur-md dark:border-neutral-700/50 dark:bg-neutral-900/40 dark:backdrop-blur-md',
    hoverEffect &&
      'hover:border-white/80 hover:bg-white/60 hover:shadow-xs dark:hover:border-neutral-600/70 dark:hover:bg-neutral-900/60'
  ),
  glow: cn(
    'border-sky-200/60 bg-white/70 backdrop-blur-xs dark:border-sky-900/40 dark:bg-neutral-900/60',
    hoverEffect &&
      'hover:border-sky-400 hover:shadow-[0_0_15px_-3px_rgba(56,189,248,0.2)] dark:hover:border-sky-500/70 dark:hover:shadow-[0_0_15px_-3px_rgba(56,189,248,0.25)]'
  ),
  blue: cn(
    'border-blue-200/80 bg-blue-50/40 dark:border-blue-900/40 dark:bg-blue-950/20',
    hoverEffect &&
      'hover:border-blue-300 hover:bg-blue-50/60 dark:hover:border-blue-800/60 dark:hover:bg-blue-950/30'
  ),
  purple: cn(
    'border-purple-200/80 bg-purple-50/40 dark:border-purple-900/40 dark:bg-purple-950/20',
    hoverEffect &&
      'hover:border-purple-300 hover:bg-purple-50/60 dark:hover:border-purple-800/60 dark:hover:bg-purple-950/30'
  ),
  emerald: cn(
    'border-emerald-200/80 bg-emerald-50/40 dark:border-emerald-900/40 dark:bg-emerald-950/20',
    hoverEffect &&
      'hover:border-emerald-300 hover:bg-emerald-50/60 dark:hover:border-emerald-800/60 dark:hover:bg-emerald-950/30'
  ),
  amber: cn(
    'border-amber-200/80 bg-amber-50/40 dark:border-amber-900/40 dark:bg-amber-950/20',
    hoverEffect &&
      'hover:border-amber-300 hover:bg-amber-50/60 dark:hover:border-amber-800/60 dark:hover:bg-amber-950/30'
  ),
  rose: cn(
    'border-rose-200/80 bg-rose-50/40 dark:border-rose-900/40 dark:bg-rose-950/20',
    hoverEffect &&
      'hover:border-rose-300 hover:bg-rose-50/60 dark:hover:border-rose-800/60 dark:hover:bg-rose-950/30'
  ),
});
