'use client';

import { BlogCategory } from '@/types/blog';
import clsx from 'clsx';
import { usePathname } from 'next/navigation';
import useGetTransitionClass from '@/hooks/animation/use-get-transition-class';
import Link from 'next/link';
import strapiUtils from '@/utils/strapi-utils';
import _get from 'lodash/get';
import _map from 'lodash/map';

export default function LeftPanel({
  categoryArticles,
  side = 'leftPanel',
  onClick = () => {},
}: {
  categoryArticles: BlogCategory;
  side?: 'leftPanel' | 'headerBlogSelector';
  onClick?: () => void;
}) {
  const pathname = usePathname();

  const { getSlideUpClass } = useGetTransitionClass();

  const data = _get(categoryArticles, ['data']) || [];

  return (
    <div
      className={clsx(
        '[&_*]:transition-all',
        getSlideUpClass(),
        side === 'leftPanel' &&
          'sticky top-24 hidden h-dvh w-80 w-[300px] shrink-0 border-r border-neutral-400/20 p-4 lg:block',
        side === 'headerBlogSelector' && 'py-4'
      )}
    >
      {/* Title */}
      <h3
        className={clsx(
          'mb-4 pl-2 text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500',
          getSlideUpClass('delay-100')
        )}
      >
        Categories
      </h3>
      {/* All Articles */}
      <Link
        className={clsx(
          'flex items-center rounded-md px-4 py-2 font-bold',
          'hover:bg-sky-600/10',
          'data-[active=true]:bg-sky-600/10 data-[active=true]:text-sky-500',
          getSlideUpClass('delay-150')
        )}
        href="/blog"
        data-active={pathname === '/blog'}
        onClick={onClick}
      >
        All Artices
      </Link>
      {/* Categories */}
      {data.map((category) => (
        <div key={category.name}>
          <Link
            className={clsx(
              'mt-1 flex items-center rounded-md px-4 py-2 font-bold',
              'hover:bg-sky-600/10',
              'data-[active=true]:bg-sky-600/10 data-[active=true]:text-sky-500',
              getSlideUpClass('delay-150')
            )}
            href={strapiUtils.toBlogCategoryUrl(category.slug)}
            data-active={
              pathname === strapiUtils.toBlogCategoryUrl(category.slug)
            }
            onClick={onClick}
          >
            {category.name}
          </Link>
          <div
            className={clsx(
              'ml-4 border-neutral-400/50 pl-2 lg:border-l',
              getSlideUpClass('delay-200')
            )}
          >
            {_map(category.articles, (article) => (
              <Link
                key={article.title}
                className={clsx(
                  'my-1 flex cursor-pointer items-center rounded-md p-2 text-sm',
                  'hover:bg-sky-600/10',
                  'data-[active=true]:bg-sky-600/10 data-[active=true]:text-sky-500'
                )}
                href={strapiUtils.toBlogCategoryArticleUrl(
                  category.slug,
                  article.slug
                )}
                data-active={
                  pathname ===
                  strapiUtils.toBlogCategoryArticleUrl(
                    category.slug,
                    article.slug
                  )
                }
                onClick={onClick}
              >
                {article.title}
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
