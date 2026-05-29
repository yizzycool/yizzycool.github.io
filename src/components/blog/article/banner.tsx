import type { BlogArticle } from '@/types/blog';

import { cn } from '@/utils/cn';
import { useEffect, useRef, useState } from 'react';
import { get } from 'lodash';

import useGetTransitionClass from '@/hooks/animation/use-get-transition-class';
import strapiUtils from '@/utils/strapi-utils';

type Props = {
  article: BlogArticle;
};

export default function Banner({ article }: Props) {
  const data = get(article, 'data.0') || {};
  const { banner } = data;

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

  return (
    <figure
      className={cn(
        'relative mb-20 mt-10',
        getFadeUpClass('animate-delay-300')
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        className={cn(
          'aspect-video w-full object-cover',
          bannerLoaded ? 'opacity-100' : 'opacity-0'
        )}
        src={strapiUtils.toMediaUrl(banner.url)}
        srcSet={strapiUtils.buildSrcSet(banner.formats)}
        sizes="(max-width: 1024px) 100vw, 1024px"
        alt={banner.alternativeText ?? 'banner image'}
        loading="eager"
        onLoad={() => setBannerLoaded(true)}
      />
    </figure>
  );
}
