import type { ImgHTMLAttributes, ReactNode, Ref } from 'react';
import type { BlogMediaData } from '@/types/blog/media';
import type { Rounded } from '@/types/common';
import type { BuildStrapiSrcSetOptions } from '@/utils/strapi-utils';

export type ResponsiveStrapiImageObjectFit =
  | 'cover'
  | 'contain'
  | 'fill'
  | 'none'
  | 'scale-down';

export type ResponsiveStrapiImageAspectRatio =
  | 'auto'
  | 'video'
  | 'square'
  | '4/3'
  | '3/2'
  | '16/10';

/**
 * Props for the ResponsiveStrapiImage component.
 */
export type ResponsiveStrapiImageProps = Omit<
  ImgHTMLAttributes<HTMLImageElement>,
  | 'src'
  | 'srcSet'
  | 'alt'
  | 'width'
  | 'height'
  | 'loading'
  | 'decoding'
  | 'fetchPriority'
  | 'sizes'
> & {
  /** Optional React ref forwarded to the rendered `<img>` element */
  ref?: Ref<HTMLImageElement>;
  /** Strapi media object containing `url`, dimensions, metadata, and `formats` */
  media: BlogMediaData | null | undefined;
  /** Accessible alt text; falls back to `media.alternativeText` when omitted, or `""` when `decorative` is true */
  alt?: string;
  /** Marks the image as purely decorative (sets `alt=""`, `aria-hidden`, and `role="presentation"`) */
  decorative?: boolean;
  /** Responsive `sizes` hint paired with `srcSet` (default: `'100vw'`); omitted when `srcSet` is unavailable */
  sizes?: string;
  /** LCP priority shortcut: sets default `loading="eager"`, `fetchPriority="high"`, and `decoding="sync"` (default: `false`) */
  priority?: boolean;
  /** Native browser loading strategy; overrides the `priority`-derived default (`'eager'` vs `'lazy'`) */
  loading?: 'eager' | 'lazy';
  /** Network fetch priority hint; overrides the `priority`-derived default (`'high'` vs `'auto'`) */
  fetchPriority?: 'high' | 'low' | 'auto';
  /** Image decoding hint; overrides the `priority`-derived default (`'sync'` vs `'async'`) */
  decoding?: 'async' | 'sync' | 'auto';
  /** Intrinsic width attribute in pixels to prevent CLS; defaults to `media.width` unless `fill` is true */
  width?: number;
  /** Intrinsic height attribute in pixels to prevent CLS; defaults to `media.height` unless `fill` is true */
  height?: number;
  /** Stretches the image to fill its positioned parent (`absolute inset-0 h-full w-full`) and omits automatic intrinsic dimensions */
  fill?: boolean;
  /** CSS `object-fit` utility preset */
  objectFit?: ResponsiveStrapiImageObjectFit;
  /** Tailwind aspect-ratio preset */
  aspectRatio?: ResponsiveStrapiImageAspectRatio;
  /** Border radius preset */
  rounded?: Rounded;
  /** Enables a semantic `<figure>` + `<figcaption>` wrapper; pass `true` to use `media.caption` or a string to override */
  caption?: string | boolean;
  /** Applies Strapi v5 `media.focalPoint` (`{ x, y }`) as CSS `object-position` when present (default: `true`) */
  useFocalPoint?: boolean;
  /** Additional CSS class names for the `<figure>` wrapper when `caption` is rendered */
  figureClassName?: string;
  /** Additional CSS class names for the `<figcaption>` element when `caption` is rendered */
  captionClassName?: string;
  /** Options forwarded to `buildStrapiSrcSet` to customize included formats, original image inclusion, and fallback format */
  srcSetOptions?: BuildStrapiSrcSetOptions;
  /** Fallback node rendered when `media` or `media.url` is missing (default: `null`) */
  fallback?: ReactNode;
};
