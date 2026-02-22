'use client';

import type { BlogArticle } from '@/types/blog';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import clsx from 'clsx';

import strapiUtils from '@/utils/strapi-utils';

import _get from 'lodash/get';

type Props = {
  type: 'prev' | 'next';
  article: BlogArticle;
};

export default function PrevNextCard({ type, article }: Props) {
  const isNext = type === 'next';

  const data = _get(article, ['data', 0]);

  if (!data) return <div></div>;

  const category = data.category;

  return (
    <li>
      <Link
        href={strapiUtils.toBlogCategoryArticleUrl(category.slug, data.slug)}
        className={clsx(
          'group relative flex items-center gap-4',
          'rounded-2xl border p-6 transition-all duration-300 ease-out',
          'border-neutral-200 hover:border-blue-500 dark:border-neutral-700 dark:hover:border-blue-400',
          'bg-white/50 dark:bg-neutral-900/50',
          isNext ? 'justify-end text-right' : 'justify-start text-left'
        )}
      >
        {/* ArrowLeft */}
        {!isNext && (
          <div
            className={clsx(
              'flex h-10 w-10 min-w-10 items-center justify-center rounded-full transition-colors duration-300',
              'text-neutral-600 group-hover:text-blue-600 dark:text-neutral-400 dark:group-hover:text-blue-400',
              'bg-neutral-100 group-hover:bg-blue-50 dark:bg-neutral-800 dark:group-hover:bg-blue-900/30'
            )}
          >
            <ArrowLeft
              size={20}
              className="transform transition-transform duration-300 group-hover:-translate-x-1"
            />
          </div>
        )}

        <div className="flex flex-col overflow-hidden">
          <span
            className={clsx(
              'mb-1 text-xs font-bold uppercase tracking-wider transition-colors duration-300',
              'text-neutral-400 group-hover:text-blue-500 dark:text-neutral-500 dark:group-hover:text-blue-400'
            )}
          >
            {isNext ? '下一篇文章' : '上一篇文章'}
          </span>
          <h3
            className={clsx(
              'line-clamp-1 text-base font-semibold transition-colors duration-300',
              'text-neutral-800 group-hover:text-blue-600 md:text-lg dark:text-neutral-100 dark:group-hover:text-blue-300'
            )}
          >
            {data.title}
          </h3>
          {category.name && (
            <span className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              {category.name}
            </span>
          )}
        </div>

        {/* ArrowRight */}
        {isNext && (
          <div
            className={clsx(
              'flex h-10 w-10 min-w-10 items-center justify-center rounded-full transition-colors duration-300',
              'text-neutral-600 group-hover:text-blue-600 dark:text-neutral-400 dark:group-hover:text-blue-400',
              'bg-neutral-100 group-hover:bg-blue-50 dark:bg-neutral-800 dark:group-hover:bg-blue-900/30'
            )}
          >
            <ArrowRight
              size={20}
              className="transform transition-transform duration-300 group-hover:translate-x-1"
            />
          </div>
        )}
      </Link>
    </li>
  );
}
