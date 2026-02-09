'use client';

import clsx from 'clsx';
import { Calendar, Clock } from 'lucide-react';
import useGetTransitionClass from '@/hooks/animation/use-get-transition-class';
import { BlogArticle } from '@/types/blog';
import _get from 'lodash/get';
import _map from 'lodash/map';

type Props = { article: BlogArticle };

export default function Metadata({ article }: Props) {
  const data = _get(article, 'data.0') || {};
  const { updatedAt, readTime } = data;

  const date = new Date(updatedAt as string);
  const dateString = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const { getSlideUpClass } = useGetTransitionClass();

  return (
    <p
      className={clsx(
        'mb-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm',
        'text-neutral-500 dark:text-neutral-400',
        getSlideUpClass('delay-200')
      )}
    >
      <time className="flex items-center gap-1.5">
        <Calendar size={14} />
        <span>{dateString}</span>
      </time>

      <span className="hidden h-1 w-1 rounded-full bg-neutral-300 md:inline dark:bg-neutral-600" />

      <span className="flex items-center gap-1.5">
        <Clock size={14} />
        <span>{readTime} min read</span>
      </span>
    </p>
  );
}
