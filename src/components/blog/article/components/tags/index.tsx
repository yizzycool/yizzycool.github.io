'use client';

import type { BlogArticle } from '@/types/blog';

import clsx from 'clsx';
import urlJoin from 'url-join';
import Link from 'next/link';
import { get, map } from 'lodash';

import useGetTransitionClass from '@/hooks/animation/use-get-transition-class';
import Badge from '@/components/common/badge';

type Props = { article: BlogArticle };

export default function Tags({ article }: Props) {
  const { getFadeUpClass } = useGetTransitionClass();

  const data = get(article, 'data.0') || {};
  const { tags } = data;

  return (
    <ul
      className={clsx(
        'mb-6 flex flex-wrap gap-2',
        getFadeUpClass('animate-delay-150')
      )}
      aria-label="article tags"
    >
      {map(
        tags,
        ({ name, slug }) =>
          !!slug && (
            <li key={name}>
              <Link href={urlJoin('/blog/tag', slug) || ''}>
                <Badge
                  variant="blue"
                  bordered
                  className="rounded-md px-2 py-1 text-xs"
                >
                  {name}
                </Badge>
              </Link>
            </li>
          )
      )}
    </ul>
  );
}
