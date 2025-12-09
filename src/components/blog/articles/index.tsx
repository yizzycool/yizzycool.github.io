'use client';

import clsx from 'clsx';
import { usePathname } from 'next/navigation';
import useGetTransitionClass from '@/hooks/animation/use-get-transition-class';
import HeaderBlock from './components/header-block';
import ArticleCard from './components/article-card';
import _map from 'lodash/map';
import _get from 'lodash/get';

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

export default function Articles({ articles }: { articles: Articles }) {
  const { data, meta } = articles || {};

  const pathname = usePathname(); // "/blog/frontend"
  const slug = pathname.split('/')[2] || 'all articles';

  const { getSlideUpClass } = useGetTransitionClass();

  return (
    <div className="mx-auto flex-grow overflow-hidden px-5 py-12 lg:max-w-screen-lg lg:px-10">
      <HeaderBlock />

      <div
        className={clsx(
          'mb-6 mt-12 flex items-center justify-between',
          getSlideUpClass('delay-300')
        )}
      >
        <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
          {slug}
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
