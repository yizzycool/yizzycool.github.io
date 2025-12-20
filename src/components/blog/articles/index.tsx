'use client';

import type { BlogArticle } from '@/types/blog';
import clsx from 'clsx';
import { useMemo } from 'react';
import useGetTransitionClass from '@/hooks/animation/use-get-transition-class';
import HeaderBlock from './components/header-block';
import ArticleCard from './components/article-card';
import Pagination from './components/pagination';
import _map from 'lodash/map';
import _get from 'lodash/get';
import _find from 'lodash/find';

type Props = {
  articles: BlogArticle;
  categorySlug?: string | undefined;
  tagSlug?: string | undefined;
};

export default function Articles({ articles, categorySlug, tagSlug }: Props) {
  const { data, meta } = articles || {};

  const categoryName = useMemo(() => {
    if (categorySlug) {
      return _get(data, [0, 'category', 'name'], '');
    } else if (tagSlug) {
      const tags = _get(data, [0, 'tags']);
      const tag = _find(tags, (t) => t.slug === tagSlug);
      return _get(tag, 'name', '');
    } else {
      return 'All articles';
    }
  }, [data, categorySlug, tagSlug]);

  const { getSlideUpClass } = useGetTransitionClass();

  return (
    <div className="mx-auto flex-grow overflow-hidden px-5 pb-20 pt-4 lg:max-w-screen-lg lg:px-10">
      <HeaderBlock />

      {/* All articles, <Category>, or <Tag> */}
      <div
        className={clsx(
          'mb-6 mt-12 flex items-center justify-between',
          getSlideUpClass('delay-300')
        )}
      >
        <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
          {categoryName}
          <span className="ml-3 text-sm font-normal text-neutral-400 dark:text-neutral-500">
            {_get(meta, ['pagination', 'total'], 0)} articles
          </span>
        </h2>
      </div>

      <div className="grid gap-6">
        {data.map((article, index) => (
          <ArticleCard key={index} article={article} />
        ))}
      </div>

      <Pagination articles={articles} />
    </div>
  );
}
