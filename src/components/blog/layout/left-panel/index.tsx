'use client';

import { BlogCategory } from '@/types/blog';
import clsx from 'clsx';
import { usePathname } from 'next/navigation';
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

  const data = _get(categoryArticles, ['data']) || [];

  return (
    <div
      className={clsx(
        '[&_*]:transition-all',
        side === 'leftPanel' &&
          'w- sticky top-24 hidden h-dvh w-80 shrink-0 border-r border-neutral-400/20 p-4 lg:block',
        side === 'headerBlogSelector' && ''
      )}
    >
      {/* Title */}
      <h3 className="mb-4 pl-2 text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
        Categories
      </h3>
      {/* All Articles */}
      <Link
        className={clsx(
          'flex items-center rounded-md px-4 py-2 font-bold',
          'hover:bg-sky-600/10',
          'data-[active=true]:bg-sky-600/10 data-[active=true]:text-sky-500'
        )}
        href="/blog"
        data-active={pathname === '/blog'}
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
              'data-[active=true]:bg-sky-600/10 data-[active=true]:text-sky-500'
            )}
            href={strapiUtils.toBlogUrl(category.slug, '')}
            data-active={pathname === strapiUtils.toBlogUrl(category.slug, '')}
          >
            {category.name}
          </Link>
          <div className="ml-4 border-l border-neutral-400/50 pl-2">
            {_map(category.articles, (article) => (
              <Link
                key={article.title}
                className={clsx(
                  'my-1 flex cursor-pointer items-center rounded-md p-2 text-sm',
                  'hover:bg-sky-600/10',
                  'data-[active=true]:bg-sky-600/10 data-[active=true]:text-sky-500'
                )}
                href={strapiUtils.toBlogUrl(category.slug, article.slug)}
                data-active={
                  pathname ===
                  strapiUtils.toBlogUrl(category.slug, article.slug)
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
