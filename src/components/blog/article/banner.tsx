'use client';

import type { BlogArticle } from '@/types/blog';

import { useEffect, useRef, useState } from 'react';
import { get } from 'lodash';

import { cn } from '@/utils/cn';
import useGetTransitionClass from '@/hooks/animation/use-get-transition-class';
import {
  ResponsiveStrapiImage,
  STRAPI_IMAGE_SIZES,
} from '@/components/shared/responsive-strapi-image';

type Props = {
  article: BlogArticle;
};

export default function Banner({ article }: Props) {
  const data = get(article, 'data.0') || {};
  const { banner, title } = data;

  const [bannerLoaded, setBannerLoaded] = useState(false);

  const imgRef = useRef<HTMLImageElement | null>(null);

  const { getFadeUpClass } = useGetTransitionClass();

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    if (img.complete && img.naturalWidth > 0) {
      // Image is in Cache
      setBannerLoaded(true);
    }
  }, []);

  if (!banner?.url) return null;

  return (
    <figure
      className={cn(
        'relative mb-20 mt-10',
        'overflow-hidden rounded-lg shadow-sm',
        getFadeUpClass('animate-delay-300')
      )}
    >
      <ResponsiveStrapiImage
        ref={imgRef}
        media={banner}
        priority
        sizes={STRAPI_IMAGE_SIZES.articleBanner}
        alt={banner.alternativeText || title || 'banner image'}
        aspectRatio="video"
        objectFit="cover"
        className={cn('w-full', bannerLoaded ? 'opacity-100' : 'opacity-0')}
        onLoad={() => setBannerLoaded(true)}
      />
    </figure>
  );
}
