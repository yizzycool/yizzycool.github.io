import type { BlogArticle } from '@/types/blog';
import clsx from 'clsx';
import { useEffect, useRef, useState } from 'react';
import useGetTransitionClass from '@/hooks/animation/use-get-transition-class';
import strapiUtils from '@/utils/strapi-utils';
import _get from 'lodash/get';

type Props = {
  article: BlogArticle;
};

export default function Banner({ article }: Props) {
  const data = _get(article, 'data.0') || {};
  const { banner } = data;

  const [bannerLoaded, setBannerLoaded] = useState(false);

  const imgRef = useRef<HTMLImageElement | null>(null);

  const { getSlideUpClass } = useGetTransitionClass();

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    if (img.complete && img.naturalWidth > 0) {
      // Image is in Cache
      setBannerLoaded(true);
    }
  }, []);

  return (
    <div className={clsx('relative mb-20 mt-10', getSlideUpClass('delay-300'))}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        className={clsx(
          'aspect-video w-full object-cover',
          bannerLoaded ? 'opacity-100' : 'opacity-0'
        )}
        src={strapiUtils.toMediaUrl(banner.url)}
        srcSet={strapiUtils.buildSrcSet(banner.formats)}
        sizes="(max-width: 1024px) 100vw, 1024px"
        alt={banner.alternativeText ?? ''}
        loading="eager"
        onLoad={() => setBannerLoaded(true)}
      />
    </div>
  );
}
