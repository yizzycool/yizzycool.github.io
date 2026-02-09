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
    <aside
      className={clsx(
        '[&_*]:transition-all',
        getSlideUpClass(),
        side === 'leftPanel' &&
          clsx(
            'sticky top-[68px] h-[calc(100dvh_-_68px)] w-[300px] shrink-0 overflow-y-auto',
            'hidden lg:block',
            'border-r border-neutral-400/20',
            'px-4 py-5 lg:py-10'
          ),
        side === 'headerBlogSelector' && 'py-4'
      )}
    >
      <nav aria-label="Articles list">
        {/* Title */}
        <h2
          className={clsx(
            'mb-4 pl-2 text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500',
            getSlideUpClass('delay-100')
          )}
        >
          Categories
        </h2>
        <ul>
          {/* All Articles */}
          <li>
            <h3>
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
            </h3>
            <ul>
              {/* Categories */}
              {data.map((category) => (
                <li key={category.name}>
                  <h3>
                    <Link
                      className={clsx(
                        'mt-1 flex items-center rounded-md px-4 py-2 font-bold',
                        'hover:bg-sky-600/10',
                        'data-[active=true]:bg-sky-600/10 data-[active=true]:text-sky-500',
                        getSlideUpClass('delay-150')
                      )}
                      href={strapiUtils.toBlogCategoryUrl(category.slug)}
                      data-active={
                        pathname ===
                        strapiUtils.toBlogCategoryUrl(category.slug)
                      }
                      onClick={onClick}
                    >
                      {category.name}
                    </Link>
                  </h3>
                  <ul
                    className={clsx(
                      'ml-4 border-neutral-400/50 pl-2 lg:border-l',
                      getSlideUpClass('delay-200')
                    )}
                  >
                    {_map(category.articles, (article) => (
                      <li key={article.title}>
                        <Link
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
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
