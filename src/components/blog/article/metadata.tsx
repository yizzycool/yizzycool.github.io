'use client';

import type { BlogArticle } from '@/types/blog';

import Link from 'next/link';
import { CircleUserRound, Clock, RefreshCw } from 'lucide-react';
import { get } from 'lodash';
import { useSyncExternalStore } from 'react';

import { cn } from '@/utils/cn';
import useGetTransitionClass from '@/hooks/animation/use-get-transition-class';
import { ResponsiveStrapiImage } from '@/components/shared/responsive-strapi-image';
import { Separator } from '@/components/ui/separator';

type Props = { article: BlogArticle };

export default function Metadata({ article }: Props) {
  const data = get(article, 'data.0') || {};
  const { author, createdAt, updatedAt, publishedAt, readTime } = data;
  const authorName = author?.name || process.env.NEXT_PUBLIC_AUTHOR_NAME || '';

  const locale = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  const updateDateSource = (publishedAt ?? updatedAt ?? createdAt) as
    | string
    | undefined;
  const updateDate = updateDateSource ? new Date(updateDateSource) : null;
  const updateDateString =
    updateDate && !Number.isNaN(updateDate.getTime())
      ? updateDate.toLocaleDateString(locale, {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      : '';

  const { getFadeUpClass } = useGetTransitionClass();

  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-x-4 gap-y-2',
        'mb-6 text-sm',
        'text-slate-500 dark:text-slate-400',
        getFadeUpClass('animate-delay-200')
      )}
    >
      {authorName && (
        <>
          <Link
            href="/resume"
            rel="author"
            className="group inline-flex items-center gap-2 font-medium transition-colors hover:text-slate-900 dark:hover:text-slate-100"
          >
            <ResponsiveStrapiImage
              media={author?.avatar}
              width={22}
              height={22}
              sizes="22px"
              alt={author?.avatar?.alternativeText || `${authorName} avatar`}
              objectFit="cover"
              rounded="full"
              className="h-[22px] w-[22px] shrink-0 ring-1 ring-slate-200 transition-transform group-hover:scale-105 dark:ring-slate-700"
              srcSetOptions={{
                formats: ['thumbnail', 'small'],
                includeOriginal: false,
                fallbackFormat: 'thumbnail',
              }}
              fallback={
                <CircleUserRound
                  size={18}
                  className="shrink-0 text-slate-400 dark:text-slate-500"
                />
              }
            />
            <span>{authorName}</span>
          </Link>

          <Separator orientation="vertical" className="hidden h-3.5 sm:block" />
        </>
      )}

      <time
        dateTime={updateDateSource}
        className="flex items-center gap-2"
        title="Last updated"
      >
        <RefreshCw size={14} className="shrink-0" />
        <span>{updateDateString}</span>
      </time>

      <Separator orientation="vertical" className="hidden h-3.5 sm:block" />

      <span className="flex items-center gap-2" title="Estimated reading time">
        <Clock size={14} className="shrink-0" />
        <span>{readTime * 2} min read</span>
      </span>
    </div>
  );
}

function subscribe() {
  return () => {};
}

function getSnapshot() {
  return typeof navigator !== 'undefined' ? navigator.language : 'en-US';
}

function getServerSnapshot() {
  return 'en-US';
}
