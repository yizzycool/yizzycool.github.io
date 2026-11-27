'use client';

import type { BlogArticleData } from '@/types/blog/article';

import Link from 'next/link';
import { Clock, Folder, RefreshCw } from 'lucide-react';

import { cn } from '@/utils/cn';
import strapiUtils from '@/utils/strapi-utils';
import useGetTransitionClass from '@/hooks/animation/use-get-transition-class';
import { RevealSection } from '@/components/ui/reveal-section';

import Banner from './banner';

type Props = {
  article: BlogArticleData;
  priority?: boolean;
};

export default function ArticleCard({ article, priority = false }: Props) {
  const date = new Date(article.updatedAt as string);
  const dateString = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const { getFadeUpClass } = useGetTransitionClass();

  return (
    <RevealSection className="h-full">
      <Link
        href={strapiUtils.toBlogCategoryArticleUrl(
          article.category.slug,
          article.slug
        )}
        className="block h-full"
      >
        <article
          className={cn(
            'group relative flex h-full flex-col overflow-hidden rounded-2xl border',
            'transition-all duration-300',
            'bg-white/95 dark:bg-neutral-800/55 dark:backdrop-blur-sm',
            'border-neutral-300/75 ring-1 ring-black/[0.03] dark:border-neutral-700/80 dark:ring-white/[0.06]',
            'shadow-sm shadow-slate-900/[0.06] dark:shadow-md dark:shadow-black/40',
            'hover:-translate-y-0.5 hover:border-sky-500/50 hover:shadow-lg hover:shadow-slate-900/10 dark:hover:border-sky-500/50 dark:hover:shadow-black/60',
            getFadeUpClass()
          )}
        >
          {/* Cover Image */}
          <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden border-b border-neutral-200/80 bg-neutral-100 dark:border-neutral-700/70 dark:bg-neutral-800/60">
            <Banner article={article} priority={priority} />
          </div>

          {/* Card Body */}
          <div className="flex flex-1 flex-col px-5 pb-6 pt-5">
            {/* Metadata */}
            <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <Folder size={12} />
                {article.category.name}
              </span>
              <span className="flex items-center gap-1">
                <RefreshCw size={12} />
                {dateString}
              </span>
              <span className="flex items-center gap-1">
                <Clock size={12} />
                {article.readTime} min
              </span>
            </div>

            {/* Article Title */}
            <h3 className="mb-3 line-clamp-2 text-lg font-semibold leading-snug text-slate-900 transition-colors group-hover:text-blue-600 dark:text-slate-100 dark:group-hover:text-blue-400">
              {article.title}
            </h3>

            {/* Short Description */}
            <p className="line-clamp-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              {article.description}
            </p>
          </div>
        </article>
      </Link>
    </RevealSection>
  );
}
