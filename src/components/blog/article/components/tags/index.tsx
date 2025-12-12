'use client';

import clsx from 'clsx';
import useGetTransitionClass from '@/hooks/animation/use-get-transition-class';
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
    <div className={clsx('mb-6 flex gap-2', getSlideUpClass('delay-150'))}>
      {_map(tags, (tag) => (
        <Badge
          key={tag.name}
          variant="blue"
          bordered
          className="rounded-md bg-neutral-400/20 px-2 py-1 text-xs"
        >
          {tag.name}
        </Badge>
      ))}
    </div>
  );
}
