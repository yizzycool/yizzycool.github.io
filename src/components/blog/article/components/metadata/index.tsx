'use client';

import type { BlogArticle } from '@/types/blog';

import clsx from 'clsx';
import { Calendar, Clock, RefreshCw } from 'lucide-react';

import useGetTransitionClass from '@/hooks/animation/use-get-transition-class';
import Divider from '@/components/common/divider';

import _get from 'lodash/get';
import _map from 'lodash/map';

type Props = { article: BlogArticle };

export default function Metadata({ article }: Props) {
  const data = _get(article, 'data.0') || {};
  const { updatedAt, publishedAt, createdAt, readTime } = data;

  const publishDate = new Date((publishedAt ?? createdAt) as string);
  const publishDateString = publishDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const updateDate = new Date(updatedAt as string);
  const updateDateString = updateDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const { getSlideUpClass } = useGetTransitionClass();

  return (
    <div
      className={clsx(
        'flex flex-wrap items-center gap-x-4 gap-y-2',
        'mb-6 text-sm',
        'text-neutral-500 dark:text-neutral-400',
        getSlideUpClass('delay-200')
      )}
    >
      <span className="flex items-center gap-2">
        <Clock size={14} />
        <span>{readTime} min read</span>
      </span>

      <Divider orientation="vertical" className="my-1" />

      <time className="flex items-center gap-2">
        <Calendar size={14} />
        <span>{publishDateString}</span>
      </time>

      <Divider orientation="vertical" className="my-1" />

      <time className="flex items-center gap-2 italic">
        <RefreshCw size={14} />
        <span>{updateDateString}</span>
      </time>
    </div>
  );
}
