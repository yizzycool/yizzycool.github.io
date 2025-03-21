'use client';

import clsx from 'clsx';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import _get from 'lodash/get';
import _map from 'lodash/map';

type Article = {
  id: number;
  title: string;
  url: string;
};

type CategoryArticleData = {
  id: number;
  name: string;
  articles: Array<Article>;
};

type CategoryArticles = {
  data: Array<CategoryArticleData>;
  meta?: object;
};

export default function LeftPanel({
  categoryArticles,
}: {
  categoryArticles: CategoryArticles;
}) {
  const pathname = usePathname();

  const data = _get(categoryArticles, 'data') || [];

  return (
    <div className="sticky top-[68px] hidden h-dvh w-64 border-r-[1px] border-neutral-400/20 p-4 lg:block">
      {data.map((category) => (
        <div key={category.name} className="mt-6">
          <div className="mb-2 font-bold">{category.name}</div>
          {_map(category.articles, (data) => (
            <Link
              key={data.title}
              className={clsx(
                'my-1 flex cursor-pointer items-center rounded-md p-2 text-sm',
                'hover:bg-sky-600/10',
                'data-[active=true]:bg-sky-600/10 data-[active=true]:text-sky-500'
              )}
              href={data.url}
              data-active={pathname === data.url}
            >
              {data.title}
            </Link>
          ))}
        </div>
      ))}
    </div>
  );
}
