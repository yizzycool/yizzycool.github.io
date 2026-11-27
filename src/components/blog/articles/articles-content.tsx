'use client';

import type { BlogArticle } from '@/types/blog';

import { useMemo } from 'react';
import { Tag, X } from 'lucide-react';
import { find, get } from 'lodash';

import { cn } from '@/utils/cn';
import useGetTransitionClass from '@/hooks/animation/use-get-transition-class';
import { Button } from '@/components/ui/button';

import ArticleCard from './article-card';
import HeaderBlock from './header-block';
import Pagination from './pagination';

const PAGE_SIZE = 10;

type Props = {
  articles: BlogArticle;
  categorySlug?: string;
  activeTagSlug?: string | null;
  currentPage?: number;
  onPageChange?: (nextPage: number) => void;
  onClearTag?: () => void;
};

export default function ArticlesContent({
  articles,
  categorySlug,
  activeTagSlug = null,
  currentPage = 1,
  onPageChange,
  onClearTag,
}: Props) {
  const { getFadeUpClass } = useGetTransitionClass();
  const rawArticles = useMemo(() => articles?.data ?? [], [articles?.data]);

  const filteredArticles = useMemo(() => {
    if (!categorySlug && activeTagSlug) {
      return rawArticles.filter((article) =>
        article.tags?.some((tag) => tag.slug === activeTagSlug)
      );
    }
    return rawArticles;
  }, [rawArticles, categorySlug, activeTagSlug]);

  const headingTitle = useMemo(() => {
    if (categorySlug) {
      return get(rawArticles, [0, 'category', 'name'], '') || categorySlug;
    }
    if (activeTagSlug) {
      const matchedTag = find(
        get(filteredArticles, [0, 'tags'], []),
        (tag) => tag.slug === activeTagSlug
      );
      return `# ${matchedTag?.name || activeTagSlug}`;
    }
    return 'All articles';
  }, [rawArticles, filteredArticles, categorySlug, activeTagSlug]);

  const totalCount = filteredArticles.length;
  const pageCount = Math.ceil(totalCount / PAGE_SIZE);
  const safePage =
    pageCount > 0 ? Math.min(Math.max(1, currentPage), pageCount) : 1;

  const visibleArticles = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredArticles.slice(start, start + PAGE_SIZE);
  }, [filteredArticles, safePage]);

  const handlePageChange = (nextPage: number) => {
    onPageChange?.(nextPage);
  };

  return (
    <div className="mx-auto flex-grow overflow-hidden px-5 pb-20 pt-4 lg:max-w-screen-lg lg:px-10">
      <HeaderBlock />

      {/* All articles, <Category>, or # <Tag> */}
      <div
        className={cn(
          'mb-6 mt-12 flex flex-wrap items-center justify-between gap-3',
          getFadeUpClass('animate-delay-300')
        )}
      >
        <h2 className="text-xl font-medium text-slate-900 dark:text-white">
          {headingTitle}
          <span className="ml-3 text-sm font-normal text-slate-400 dark:text-slate-500">
            {totalCount} articles
          </span>
        </h2>

        {!categorySlug && activeTagSlug && onClearTag && (
          <Button
            variant="outline"
            size="xs"
            icon={X}
            onClick={onClearTag}
            ariaLabel="Clear tag filter"
          >
            Clear filter
          </Button>
        )}
      </div>

      {visibleArticles.length > 0 ? (
        <div className="grid gap-6">
          {visibleArticles.map((article, index) => (
            <ArticleCard
              key={article.documentId || article.slug}
              article={article}
              priority={index === 0}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-200 bg-white/60 px-6 py-16 text-center dark:border-neutral-800 dark:bg-neutral-900/40">
          <Tag
            size={32}
            aria-hidden="true"
            className="mb-3 text-slate-400 dark:text-slate-500"
          />
          <p className="text-base font-medium text-slate-700 dark:text-slate-200">
            No articles found for this tag.
          </p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Try clearing the filter to browse all technical articles.
          </p>
          {onClearTag && (
            <Button
              variant="primary"
              size="sm"
              className="mt-5"
              onClick={onClearTag}
            >
              View all articles
            </Button>
          )}
        </div>
      )}

      <Pagination
        currentPage={safePage}
        pageCount={pageCount}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
