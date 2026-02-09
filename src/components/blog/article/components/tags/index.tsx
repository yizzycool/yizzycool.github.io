'use client';

import clsx from 'clsx';
import urlJoin from 'url-join';
import useGetTransitionClass from '@/hooks/animation/use-get-transition-class';
import Link from 'next/link';
import Badge from '@/components/common/badge';
import { BlogArticle } from '@/types/blog';
import _get from 'lodash/get';
import _map from 'lodash/map';

type Props = { article: BlogArticle };

export default function Tags({ article }: Props) {
  const { getSlideUpClass } = useGetTransitionClass();

  const data = _get(article, 'data.0') || {};
  const { tags } = data;

  return (
    <ul
      className={clsx(
        'mb-6 flex flex-wrap gap-2',
        getSlideUpClass('delay-150')
      )}
      aria-label="article tags"
    >
      {_map(
        tags,
        ({ name, slug }) =>
          !!slug && (
            <li key={name}>
              <Link href={urlJoin('/blog/tag', slug) || ''}>
                <Badge
                  variant="blue"
                  bordered
                  className="rounded-md bg-neutral-400/20 px-2 py-1 text-xs"
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
