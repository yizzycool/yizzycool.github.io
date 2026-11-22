import type { Rounded } from '@/types/common';
import type {
  ResponsiveStrapiImageAspectRatio,
  ResponsiveStrapiImageObjectFit,
} from './types';

export const responsiveStrapiImageBaseStyles = 'block';

export const responsiveStrapiImageFillStyles = 'absolute inset-0 h-full w-full';

export const responsiveStrapiImageObjectFitVariants: Record<
  ResponsiveStrapiImageObjectFit,
  string
> = {
  cover: 'object-cover',
  contain: 'object-contain',
  fill: 'object-fill',
  none: 'object-none',
  'scale-down': 'object-scale-down',
};

export const responsiveStrapiImageAspectRatioVariants: Record<
  ResponsiveStrapiImageAspectRatio,
  string
> = {
  auto: 'aspect-auto',
  video: 'aspect-video',
  square: 'aspect-square',
  '4/3': 'aspect-[4/3]',
  '3/2': 'aspect-[3/2]',
  '16/10': 'aspect-[16/10]',
};

export const responsiveStrapiImageRoundedVariants: Record<Rounded, string> = {
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

export const responsiveStrapiImageFigureBaseStyles = 'm-0';

export const responsiveStrapiImageCaptionBaseStyles =
  'mt-2 text-center text-sm text-neutral-500 dark:text-neutral-400';
