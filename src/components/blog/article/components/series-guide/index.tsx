'use client';

import clsx from 'clsx';
import { ChevronDown, Layers } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useMemo, useState } from 'react';

import useGetTransitionClass from '@/hooks/animation/use-get-transition-class';
import { BlogCollectionData } from '@/types/blog/collection';
import strapiUtils from '@/utils/strapi-utils';
import Link from 'next/link';
import Badge from '@/components/common/badge';

type Props = {
  collection: BlogCollectionData;
  slug: string;
};

export default function SeriesGuide({ collection, slug }: Props) {
  const [isOpen, setIsOpen] = useState(true);

  const { getSlideUpClass } = useGetTransitionClass();

  const { articles: rawArticles } = collection || {};

  const articles = useMemo(() => {
    if (!rawArticles) return [];

    return rawArticles.sort((a, b) => a.id - b.id);
  }, [rawArticles]);

  const currentIndex = useMemo(() => {
    return articles.findIndex((data) => data.slug === slug);
  }, [articles, slug]);

  if (!articles.length) return null;

  return (
    <section
      className={clsx(
        'mx-auto my-12',
        getSlideUpClass('[transition-delay:250ms]')
      )}
    >
      <nav
        className={clsx(
          'relative overflow-hidden transition-all duration-300',
          'bg-neutral-50/50 backdrop-blur-md dark:bg-neutral-900/50',
          'rounded-2xl border-2 border-neutral-200 dark:border-neutral-800'
        )}
        aria-label="table of content"
      >
        {/* Series Guide Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex w-full items-center justify-between p-4 text-left focus:outline-none"
          aria-label="series guide"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/30">
              <Layers size={18} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex flex-col items-start">
              <h3 className="font-bold leading-tight text-neutral-900 dark:text-neutral-100">
                {collection.name}
              </h3>
              <span className="mt-1 flex items-center gap-2 text-xs font-bold tracking-widest text-neutral-400">
                系列導覽
                <Badge rounded="md" bordered className="font-bold">
                  {currentIndex + 1}/{articles.length}
                </Badge>
              </span>
            </div>
          </div>
          <ChevronDown
            size={20}
            className={clsx(
              'text-neutral-400 transition-all duration-300',
              isOpen && 'rotate-180'
            )}
          />
        </button>

        {/* TOC Content */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden border-t border-neutral-200 dark:border-neutral-800"
            >
              <ul className="space-y-1 p-4 text-sm leading-normal">
                {/* <div dangerouslySetInnerHTML={{ __html: toc }} /> */}
                {articles.map(({ slug, title, category }, idx) => (
                  <li key={slug}>
                    <Link
                      href={strapiUtils.toBlogCategoryArticleUrl(
                        category.slug,
                        slug
                      )}
                      className={clsx(
                        'flex items-center gap-3 rounded-xl p-3 transition-all duration-200',
                        currentIndex === idx
                          ? 'bg-white ring-1 ring-neutral-200 dark:bg-neutral-800 dark:ring-neutral-700'
                          : 'text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800/40'
                      )}
                    >
                      <div
                        className={clsx(
                          'flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-black transition-all',
                          currentIndex === idx
                            ? 'bg-blue-600 text-white'
                            : 'bg-neutral-200 text-neutral-500 dark:bg-neutral-800'
                        )}
                      >
                        {idx + 1}
                      </div>
                      <span
                        className={clsx(
                          'font-semibold leading-relaxed',
                          currentIndex === idx
                            ? 'text-neutral-900 dark:text-white'
                            : ''
                        )}
                      >
                        {title}
                      </span>
                      {currentIndex === idx && (
                        <Badge
                          variant="blue"
                          bordered={true}
                          className="ml-auto hidden gap-1.5 uppercase sm:flex"
                        >
                          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-600 dark:bg-blue-400" />
                          Reading
                        </Badge>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </section>
  );
}
