'use client';

import type { BlogCategory } from '@/types/blog';

import clsx from 'clsx';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { get } from 'lodash';

import useGetTransitionClass from '@/hooks/animation/use-get-transition-class';
import CategoryAccordionItem from './components/category-accordion-item';

type Props = {
  categoryArticles: BlogCategory;
  side?: 'leftPanel' | 'headerBlogSelector';
  onClick?: () => void;
};

export default function LeftPanel({
  categoryArticles,
  side = 'leftPanel',
  onClick = () => {},
}: Props) {
  const pathname = usePathname();

  const { getFadeUpClass } = useGetTransitionClass();

  const data = get(categoryArticles, ['data']) || [];

  return (
    <aside
      className={clsx(
        getFadeUpClass(),
        side === 'leftPanel' &&
          clsx(
            'sticky top-[68px] h-[calc(100dvh_-_68px)] w-[300px] shrink-0 overflow-y-auto',
            'hidden lg:block',
            'border-r border-neutral-400/20',
            'px-2 py-5 lg:py-10'
          ),
        side === 'headerBlogSelector' && 'py-4'
      )}
    >
      <nav aria-label="Articles list">
        <ul>
          <li>
            {/* All Articles */}
            <h2>
              <Link
                className={clsx(
                  'flex items-center rounded-md p-2 font-bold',
                  'hover:bg-sky-600/10',
                  'data-[active=true]:bg-sky-600/10 data-[active=true]:text-sky-500',
                  getFadeUpClass('animate-delay-150')
                )}
                href="/blog"
                data-active={pathname === '/blog'}
                onClick={onClick}
              >
                All Artices
              </Link>
            </h2>
            {/* Articles by category  */}
            <ul>
              {data.map((category) => (
                <CategoryAccordionItem
                  key={category.name}
                  category={category}
                  onClick={onClick}
                />
              ))}
            </ul>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
