'use client';

import type { BlogArticleData } from '@/types/blog/article';

import { useEffect, useRef, useState } from 'react';

import { cn } from '@/utils/cn';
import { Shimmer } from '@/components/ui/skeleton';
import {
  ResponsiveStrapiImage,
  STRAPI_IMAGE_SIZES,
} from '@/components/shared/responsive-strapi-image';

type Props = {
  article: BlogArticleData;
  priority?: boolean;
};

export default function Banner({ article, priority = false }: Props) {
  const { banner } = article;

  const [bannerLoaded, setBannerLoaded] = useState(false);

  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    if (img.complete && img.naturalWidth > 0) {
      // Image is in Cache
      setBannerLoaded(true);
    }
  }, []);

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Loading Skeleton */}
      {!bannerLoaded && Boolean(banner?.url) && (
        <Shimmer className="absolute inset-0 z-0" />
      )}

      {/* Mask */}
      {bannerLoaded && (
        <div
          className={cn(
            'absolute inset-0 z-10 transition-colors',
            'bg-neutral-100/10 group-hover:bg-transparent dark:bg-neutral-900/30'
          )}
        />
      )}

      <ResponsiveStrapiImage
        ref={imgRef}
        media={banner}
        priority={priority}
        sizes={STRAPI_IMAGE_SIZES.articleCard}
        objectFit="cover"
        className={cn(
          'h-full w-full transform transition-transform duration-700 ease-out group-hover:scale-105',
          bannerLoaded ? 'opacity-100' : 'opacity-0'
        )}
        onLoad={() => setBannerLoaded(true)}
      />
    </div>
  );
}
