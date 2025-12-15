'use client';

import type { BlogArticle } from '@/types/blog';
import clsx from 'clsx';
import urlJoin from 'url-join';
import { useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  LucideIcon,
} from 'lucide-react';
import useGetTransitionClass from '@/hooks/animation/use-get-transition-class';
import RevealSection from '@/components/common/reveal-section';
import _range from 'lodash/range';

type Props = {
  articles: BlogArticle;
};

export default function Pagination({ articles }: Props) {
  const { meta } = articles;
  const { pagination } = meta;
  const { page, pageCount } = pagination;

  const router = useRouter();
  const pathname = usePathname();

  const { getSlideUpClass } = useGetTransitionClass();

  // 2 3 `4` 5 6
  // `1` 2 3 4 5
  const pageRange = useMemo(() => {
    const maxVisible = 5;

    const half = Math.floor(maxVisible / 2);

    let start = page - half;
    let end = page + half;

    if (start < 1) {
      start = 1;
      end = Math.min(maxVisible, pageCount);
    }

    if (end > pageCount) {
      end = pageCount;
      start = Math.max(1, pageCount - maxVisible + 1);
    }

    return _range(start, end + 1);
  }, [page, pageCount]);

  const redirectToPage = (nextPage: number) => {
    if (page === nextPage || nextPage < 1 || nextPage > pageCount) return;

    const rootPath = pathname.replace(/\/page\/[0-9]+$/, '');
    if (page === 1) {
      router.push(rootPath);
    } else {
      router.push(urlJoin(rootPath, '/page', page.toString()));
    }
  };

  return (
    <RevealSection>
      <div
        className={clsx(
          'mt-12 flex items-center justify-center gap-2 py-8',
          getSlideUpClass('delay-100')
        )}
      >
        <LeftRightButton
          onClick={() => redirectToPage(1)}
          disabled={page === 1}
          icon={ChevronsLeft}
        />
        <LeftRightButton
          onClick={() => redirectToPage(Math.max(1, page - 1))}
          disabled={page === 1}
          icon={ChevronLeft}
        />

        {/* Page Numbers */}
        <div className="flex gap-2 px-2">
          {pageRange.map((p) => (
            <button
              key={p}
              onClick={() => redirectToPage(p)}
              className={clsx(
                'flex h-10 w-10 items-center justify-center rounded-lg font-bold transition-all',
                p === page
                  ? 'scale-110 bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                  : 'bg-white text-neutral-600 hover:bg-neutral-100 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700/50'
              )}
            >
              {p}
            </button>
          ))}
        </div>

        <LeftRightButton
          onClick={() => redirectToPage(Math.min(pageCount, page + 1))}
          disabled={page === pageCount}
          icon={ChevronRight}
        />
        <LeftRightButton
          onClick={() => redirectToPage(pageCount)}
          disabled={page === pageCount}
          icon={ChevronsRight}
        />
      </div>
    </RevealSection>
  );
}

const LeftRightButton = ({
  onClick,
  disabled,
  icon: Icon,
}: {
  onClick: () => void;
  disabled: boolean;
  icon: LucideIcon;
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        'rounded-lg p-2 transition-all disabled:opacity-30',
        'border border-neutral-200 dark:border-neutral-800',
        'hover:[&:not(:disabled)]:bg-neutral-100 dark:hover:[&:not(:disabled)]:bg-neutral-800'
      )}
    >
      <Icon size={20} />
    </button>
  );
};
