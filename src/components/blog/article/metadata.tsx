'use client';

import type { BlogArticle } from '@/types/blog';

import { Calendar, Clock, RefreshCw } from 'lucide-react';
import { get } from 'lodash';
import { useEffect, useState } from 'react';

import { cn } from '@/utils/cn';
import useGetTransitionClass from '@/hooks/animation/use-get-transition-class';
import Divider from '@/components/common/divider';

type Props = { article: BlogArticle };

export default function Metadata({ article }: Props) {
  const data = get(article, 'data.0') || {};
  const { createdAt, updatedAt, publishedAt, readTime } = data;

  const [locale, setLocale] = useState('en-US');

  useEffect(() => {
    const userLang = navigator.language || 'en-US';
    setLocale(userLang);
  }, []);

  const createDate = new Date(createdAt as string);
  const createDateString = createDate.toLocaleDateString(locale, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const updateDate = new Date((publishedAt ?? updatedAt) as string);
  const updateDateString = updateDate.toLocaleDateString(locale, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const { getFadeUpClass } = useGetTransitionClass();

  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-x-4 gap-y-2',
        'mb-6 text-sm',
        'text-neutral-500 dark:text-neutral-400',
        getFadeUpClass('animate-delay-200')
      )}
    >
      <time className="flex items-center gap-2" title="Last updated">
        <RefreshCw size={14} className="shrink-0" />
        <span>{updateDateString}</span>
      </time>

      <Divider orientation="vertical" className="my-1 hidden sm:block" />

      <span className="flex items-center gap-2" title="Estimated reading time">
        <Clock size={14} className="shrink-0" />
        <span>{readTime * 2} min read</span>
      </span>

      <Divider orientation="vertical" className="my-1 hidden sm:block" />

      <time className="flex items-center gap-2" title="Published on">
        <Calendar size={14} className="shrink-0" />
        <span>{createDateString}</span>
      </time>
    </div>
  );
}
