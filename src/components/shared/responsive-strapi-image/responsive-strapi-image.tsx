import type { ResponsiveStrapiImageProps } from './types';

import { cn } from '@/utils/cn';
import { buildStrapiSrcSet } from '@/utils/strapi-utils';

import { DEFAULT_RESPONSIVE_STRAPI_IMAGE_SIZES } from './constants';
import {
  responsiveStrapiImageAspectRatioVariants,
  responsiveStrapiImageBaseStyles,
  responsiveStrapiImageCaptionBaseStyles,
  responsiveStrapiImageFigureBaseStyles,
  responsiveStrapiImageFillStyles,
  responsiveStrapiImageObjectFitVariants,
  responsiveStrapiImageRoundedVariants,
} from './responsive-strapi-image.variants';

/**
 * Responsive Strapi image component backed by native `<img>` with `srcSet`, `sizes`,
 * CLS-safe intrinsic dimensions, LCP priority controls, and optional semantic `<figure>` captioning.
 */
export function ResponsiveStrapiImage({
  ref,
  media,
  alt,
  decorative = false,
  sizes = DEFAULT_RESPONSIVE_STRAPI_IMAGE_SIZES,
  priority = false,
  loading,
  fetchPriority,
  decoding,
  width,
  height,
  fill = false,
  objectFit,
  aspectRatio,
  rounded,
  caption,
  useFocalPoint = true,
  figureClassName,
  captionClassName,
  srcSetOptions,
  fallback = null,
  className,
  style,
  'aria-hidden': ariaHidden,
  role,
  ...rest
}: ResponsiveStrapiImageProps) {
  if (!media?.url) {
    return fallback;
  }

  const { src, srcSet } = buildStrapiSrcSet(media, srcSetOptions);

  if (!src) {
    return fallback;
  }

  const resolvedAlt = decorative ? '' : (alt ?? media.alternativeText ?? '');
  const resolvedLoading = loading ?? (priority ? 'eager' : 'lazy');
  const resolvedFetchPriority = fetchPriority ?? (priority ? 'high' : 'auto');
  const resolvedDecoding = decoding ?? (priority ? 'sync' : 'async');
  const resolvedWidth =
    width ??
    (!fill && media.width != null && media.width > 0 ? media.width : undefined);
  const resolvedHeight =
    height ??
    (!fill && media.height != null && media.height > 0
      ? media.height
      : undefined);
  const resolvedSizes = srcSet ? sizes : undefined;
  const resolvedStyle =
    useFocalPoint &&
    media.focalPoint &&
    Number.isFinite(media.focalPoint.x) &&
    Number.isFinite(media.focalPoint.y)
      ? {
          objectPosition: `${media.focalPoint.x}% ${media.focalPoint.y}%`,
          ...style,
        }
      : style;

  const imgClassName = cn(
    responsiveStrapiImageBaseStyles,
    fill && responsiveStrapiImageFillStyles,
    objectFit && responsiveStrapiImageObjectFitVariants[objectFit],
    aspectRatio && responsiveStrapiImageAspectRatioVariants[aspectRatio],
    rounded && responsiveStrapiImageRoundedVariants[rounded],
    className
  );

  const imgElement = (
    /* Native <img> preserves Strapi's pre-generated format srcSet under `output: 'export'` (`images.unoptimized: true`). */
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      ref={ref}
      src={src}
      srcSet={srcSet}
      sizes={resolvedSizes}
      alt={resolvedAlt}
      width={resolvedWidth}
      height={resolvedHeight}
      loading={resolvedLoading}
      decoding={resolvedDecoding}
      fetchPriority={resolvedFetchPriority}
      aria-hidden={decorative ? true : ariaHidden}
      role={decorative ? 'presentation' : role}
      className={imgClassName}
      style={resolvedStyle}
      {...rest}
    />
  );

  const resolvedCaption =
    typeof caption === 'string'
      ? caption.trim()
      : caption === true
        ? (media.caption?.trim() ?? '')
        : '';

  if (resolvedCaption) {
    return (
      <figure
        className={cn(responsiveStrapiImageFigureBaseStyles, figureClassName)}
      >
        {imgElement}
        <figcaption
          className={cn(
            responsiveStrapiImageCaptionBaseStyles,
            captionClassName
          )}
        >
          {resolvedCaption}
        </figcaption>
      </figure>
    );
  }

  return imgElement;
}
