'use client';

import type { BlogArticle } from '@/types/blog';

import clsx from 'clsx';

import useGetTransitionClass from '@/hooks/animation/use-get-transition-class';
import Breadcrumb from './components/breadcrumb';
import Tags from './components/tags';
import Metadata from './components/metadata';
import Banner from './components/banner';
import ProseMarkdown from '@/components/common/markdown/prose-markdown';
import { TocDesktop, TocMobile } from './components/toc';
import SeriesGuide from './components/series-guide';

import _get from 'lodash/get';

type Props = {
  article: BlogArticle;
  toc: string;
};

export default function Article({ article, toc }: Props) {
  const data = _get(article, 'data.0') || {};
  const { title, content, collection, slug } = data;

  const { getSlideUpClass } = useGetTransitionClass();

  return (
    <>
      <article className="mx-auto flex-grow overflow-hidden px-5 pb-10 pt-5 lg:max-w-screen-lg lg:px-8 lg:py-10">
        <Breadcrumb article={article} />

        <header>
          {/* Title */}
          <h1
            className={clsx(
              'mb-6 text-4xl font-extrabold leading-normal tracking-tight',
              getSlideUpClass('delay-100')
            )}
          >
            {title}
          </h1>

          <Tags article={article} />

          <Metadata article={article} />
        </header>

        {/* Separator */}
        <div
          className={clsx(
            'my-6 border-b border-neutral-200 dark:border-neutral-700',
            getSlideUpClass('delay-200')
          )}
        />

        <Banner article={article} />

        {/* Toc between Banner & Content */}
        <TocMobile toc={toc} />

        {/* Show Series Guide if collection exists */}
        <SeriesGuide collection={collection} slug={slug} />

        <section>
          {/* Main Content */}
          <ProseMarkdown
            className={clsx('[&_*]:scroll-mt-20', getSlideUpClass('delay-300'))}
          >
            {content}
          </ProseMarkdown>
        </section>
      </article>

      {/* Toc on right side */}
      <TocDesktop toc={toc} />
    </>
  );
}
