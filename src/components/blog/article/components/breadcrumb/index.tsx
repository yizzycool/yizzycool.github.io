'use client';

import { BlogArticle } from '@/types/blog';
import clsx from 'clsx';
import { ChevronRight } from 'lucide-react';
import useGetTransitionClass from '@/hooks/animation/use-get-transition-class';
import _get from 'lodash/get';
import Link from 'next/link';
import urlJoin from 'url-join';

type Props = { article: BlogArticle };

export default function Breadcrumb({ article }: Props) {
  const data = _get(article, 'data.0') || {};
  const { category } = data;
  const { name, slug } = category;

  const { getSlideUpClass } = useGetTransitionClass();

  return (
    <nav aria-label="breadcrumb">
      <ol
        className={clsx(
          'mb-6 flex items-center gap-1 text-sm text-neutral-500 dark:text-neutral-400',
          getSlideUpClass()
        )}
      >
        <li>
          <Link
            className="cursor-pointer transition-colors hover:text-blue-500"
            href="/blog"
          >
            Blog
          </Link>
        </li>

        <ChevronRight size={14} aria-hidden />

        <li>
          <Link
            className="cursor-pointer transition-colors hover:text-blue-500"
            href={urlJoin('/blog', slug)}
          >
            {name}
          </Link>
        </li>
      </ol>
    </nav>
  );
}
