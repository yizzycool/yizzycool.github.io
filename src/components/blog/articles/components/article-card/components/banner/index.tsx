import type { BlogArticleData } from '@/types/blog/article';
import clsx from 'clsx';
import { useEffect, useRef, useState } from 'react';
import strapiUtils from '@/utils/strapi-utils';
import _get from 'lodash/get';

type Props = {
  article: BlogArticleData;
};

export default function Banner({ article }: Props) {
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
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={imgRef}
      className={clsx(
        'h-full w-full transform object-cover transition-transform duration-700 ease-out group-hover:scale-105',
        bannerLoaded ? 'opacity-100' : 'opacity-0'
      )}
      src={strapiUtils.toMediaUrl(banner.url)}
      srcSet={strapiUtils.buildSrcSet(banner.formats)}
      sizes="(max-width: 768px) 100vw, 350px"
      alt={banner.alternativeText ?? ''}
      loading="lazy"
      onLoad={() => setBannerLoaded(true)}
    />
  );
}
