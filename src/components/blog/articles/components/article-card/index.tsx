'use client';

import type { BlogArticleData } from '@/types/blog/article';
import clsx from 'clsx';
import { ArrowRight, Calendar, Clock } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import useGetTransitionClass from '@/hooks/animation/use-get-transition-class';
import strapiUtils from '@/utils/strapi-utils';
import RevealSection from '@/components/common/reveal-section';
import Badge from '@/components/common/badge';

type Props = {
  article: BlogArticleData;
};

export default function ArticleCard({ article }: Props) {
  const date = new Date(article.updatedAt as string);
  const dateString = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const { getSlideUpClass } = useGetTransitionClass();

  return (
    <RevealSection>
      <Link
        key={article.documentId}
        href={strapiUtils.toBlogUrl(article.category.slug, article.slug)}
      >
        <article
          key={article.id}
          className={clsx(
            'group relative overflow-hidden rounded-2xl border fill-mode-backwards',
            'bg-white dark:bg-neutral-900/40',
            'border-neutral-200 dark:border-neutral-800',
            'hover:-translate-y-1 hover:shadow-2xl',
            getSlideUpClass()
          )}
        >
          <div className="h-full md:flex">
            {/* Image Container */}
            <div className="relative h-48 overflow-hidden md:h-auto md:w-1/3">
              {/* Mask */}
              <div className="absolute inset-0 z-10 bg-neutral-900/10 transition-colors group-hover:bg-transparent" />
              <Image
                src={strapiUtils.toMediaUrl(
                  article.banner.formats.thumbnail.url
                )}
                alt={article.banner.caption || 'article banner image'}
                width={article.banner.formats.thumbnail.width}
                height={article.banner.formats.thumbnail.height}
                className="h-full w-full transform object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              {/* Floating Tag over Image */}
              <div className="absolute left-4 top-4 z-20">
                <Badge>{article.category.name}</Badge>
              </div>
            </div>

            {/* Content Container */}
            <div className="flex flex-col justify-between p-6 md:w-2/3">
              <div>
                {/* Metadata */}
                <div className="mb-3 flex items-center gap-3 text-xs font-medium text-neutral-500 dark:text-neutral-400">
                  <span className="flex items-center gap-1">
                    <Calendar size={12} />
                    {dateString}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {article.readTime} min
                  </span>
                </div>

                {/* Article Title */}
                <h3 className="mb-3 text-xl font-bold text-neutral-900 transition-colors group-hover:text-blue-600 md:text-2xl dark:text-neutral-100 dark:group-hover:text-blue-400">
                  {article.title}
                </h3>

                {/* Short Description */}
                <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-neutral-600 md:line-clamp-3 dark:text-neutral-400">
                  {article.description}
                </p>
              </div>

              {/* Tags */}
              <div className="mt-4 flex items-center justify-between">
                <div className="flex gap-2">
                  {article.tags.map((tag) => (
                    <Badge key={tag.name} variant="outline" rounded="md">
                      {tag.name}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center gap-2 text-sm font-semibold text-blue-600 transition-all group-hover:translate-x-2 dark:text-blue-400">
                  Read Article <ArrowRight size={16} />
                </div>
              </div>
            </div>
          </div>
        </article>
      </Link>
    </RevealSection>
  );
}
