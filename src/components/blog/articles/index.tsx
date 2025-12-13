'use client';

import clsx from 'clsx';
import useGetTransitionClass from '@/hooks/animation/use-get-transition-class';
import HeaderBlock from './components/header-block';
import ArticleCard from './components/article-card';
import _map from 'lodash/map';
import _get from 'lodash/get';
import _find from 'lodash/find';
import { useMemo } from 'react';

type MediaData = {
  width: number;
  height: number;
  url: string;
};

type Banner = {
  caption: string;
  formats: {
    thumbnail: MediaData;
    small: MediaData;
    medium: MediaData;
    large: MediaData;
  };
} & MediaData;

type Tag = {
  name: string;
  slug: string;
};

type Author = {
  name: string;
};

type Category = {
  slug: string;
  name: string;
};

export type Article = {
  id: number;
  documentId: string;
  title: string;
  description: string;
  slug: string;
  createdAt: string | null;
  updatedAt: string | null;
  publishedAt: string | null;
  banner: Banner;
  tags: Array<Tag>;
  author: Author;
  category: Category;
  readTime: number;
};

type Articles = {
  data: Array<Article>;
  meta?: object;
};

type Props = {
  articles: Articles;
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
    </div>
  );
}
