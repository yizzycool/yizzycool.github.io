'use client';

import { BlogArticle } from '@/types/blog';
import clsx from 'clsx';
import { useMemo, useState } from 'react';
import useGetTransitionClass from '@/hooks/animation/use-get-transition-class';
import strapiUtils from '@/utils/strapi-utils';
import Image from 'next/image';
import Breadcrumb from './components/breadcrumb';
import Tags from './components/tags';
import Metadata from './components/metadata';
import ProseMarkdown from '@/components/common/prose-markdown';
import _get from 'lodash/get';

export default function Article({
  article,
  toc,
}: {
  article: BlogArticle;
  toc: string;
}) {
  const [bannerLoaded, setBannerLoaded] = useState(false);

  const { getSlideUpClass } = useGetTransitionClass();

  const data = _get(article, 'data.0') || {};
  const { title, content, banner } = data;

  const bannerUrl = useMemo(() => {
    const largePath = _get(banner, 'formats.large.url') || '';
    if (largePath) {
      return strapiUtils.toMediaUrl(largePath);
    }
    const mediumPath = _get(banner, 'formats.medium.url') || '';
    if (mediumPath) {
      return strapiUtils.toMediaUrl(mediumPath);
    }
    const originalPath = _get(banner, 'url') || '';
    if (originalPath) {
      return strapiUtils.toMediaUrl(originalPath);
    }
    return '';
  }, [banner]);

  return (
    <>
      <div className="mx-auto flex-grow overflow-hidden px-5 py-5 lg:max-w-screen-lg lg:px-8 lg:py-10">
        <Breadcrumb article={article} />

        {/* Title */}
        <h1
          className={clsx(
            'mb-6 text-4xl font-extrabold tracking-tight md:text-5xl',
            'bg-gradient-to-r from-neutral-900 to-neutral-600 bg-clip-text',
            'dark:from-white dark:to-neutral-400',
            getSlideUpClass('delay-100')
          )}
        >
          {title}
        </h1>

        <Tags article={article} />

        <Metadata article={article} />

        {/* Separator */}
        <div
          className={clsx(
            'my-6 border-b border-neutral-100 dark:border-neutral-800',
            getSlideUpClass('delay-200')
          )}
        />

        {/* Banner Image  */}
        <div className={clsx('mb-20 mt-10', getSlideUpClass('delay-300'))}>
          <Image
            className={clsx(
              'aspect-video w-full object-cover transition-opacity',
              bannerLoaded ? 'opacity-100' : 'opacity-0'
            )}
            src={bannerUrl}
            width="1600"
            height="900"
            alt="banner"
            onLoad={() => setBannerLoaded(true)}
          />
        </div>

        {/* Main Content */}
        <ProseMarkdown
          className={clsx('[&_*]:scroll-mt-20', getSlideUpClass('delay-300'))}
        >
          {content}
        </ProseMarkdown>
      </div>

      {/* Toc on right side */}
      <div
        className={clsx(
          'sticky top-[68px] hidden h-dvh w-64 shrink-0 border-l-[1px] border-neutral-400/20 p-4 lg:block',
          getSlideUpClass()
        )}
      >
        <div className={clsx('mt-6 font-bold', getSlideUpClass('delay-150'))}>
          Table of Content
        </div>
        <div
          className={clsx(
            'mt-6 text-sm leading-normal transition-all [&_*]:my-2 [&_a:hover]:brightness-200 [&_a]:block [&_ol_ol]:ps-5 [&_ul_ul]:ps-8',
            getSlideUpClass('delay-200')
          )}
        >
          <div dangerouslySetInnerHTML={{ __html: toc }} />
        </div>
      </div>
    </>
  );
}
