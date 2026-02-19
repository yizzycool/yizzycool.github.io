'use client';

import type { BlogArticle } from '@/types/blog';

import clsx from 'clsx';
import { Calendar, Clock } from 'lucide-react';

import useGetTransitionClass from '@/hooks/animation/use-get-transition-class';
import Divider from '@/components/common/divider';

import _get from 'lodash/get';
import _map from 'lodash/map';

type Props = { article: BlogArticle };

export default function Metadata({ article }: Props) {
  const data = _get(article, 'data.0') || {};
  const { updatedAt, publishedAt, readTime } = data;

  const publishDate = new Date((publishedAt ?? updatedAt) as string);
  const publishDateString = publishDate.toLocaleDateString('en-US', {
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
      <time className="flex items-center gap-2">
        <Calendar size={14} />
        <span>{publishDateString}</span>
      </time>

      <Divider orientation="vertical" className="my-1" />

      <span className="flex items-center gap-2">
        <Clock size={14} />
        <span>{readTime} min read</span>
      </span>
    </div>
  );
}
