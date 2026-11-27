'use client';

import type { BlogArticle } from '@/types/blog';

import { Suspense } from 'react';

import ArticlesClient from './articles-client';
import ArticlesContent from './articles-content';

type Props = {
  articles: BlogArticle;
  categorySlug?: string;
};

export default function Articles({ articles, categorySlug }: Props) {
  return (
    <Suspense
      fallback={
        <ArticlesContent
          articles={articles}
          categorySlug={categorySlug}
          activeTagSlug={null}
          currentPage={1}
        />
      }
    >
      <ArticlesClient articles={articles} categorySlug={categorySlug} />
    </Suspense>
  );
}
