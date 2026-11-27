'use client';

import { useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { range } from 'lodash';

import { cn } from '@/utils/cn';
import useGetTransitionClass from '@/hooks/animation/use-get-transition-class';
import { Button } from '@/components/ui/button';
import { RevealSection } from '@/components/ui/reveal-section';

type Props = {
  currentPage: number;
  pageCount: number;
  onPageChange: (nextPage: number) => void;
};

export default function Pagination({
  currentPage,
  pageCount,
  onPageChange,
}: Props) {
  const { getFadeUpClass } = useGetTransitionClass();

  const pageRange = useMemo(() => {
    const maxVisible = 5;
    const half = Math.floor(maxVisible / 2);

    let start = currentPage - half;
    let end = currentPage + half;

    if (start < 1) {
      start = 1;
      end = Math.min(maxVisible, pageCount);
    }

    if (end > pageCount) {
      end = pageCount;
      start = Math.max(1, pageCount - maxVisible + 1);
    }

    return range(start, end + 1);
  }, [currentPage, pageCount]);

  if (pageCount <= 1) {
    return null;
  }

  const handlePageSelect = (nextPage: number) => {
    if (nextPage === currentPage || nextPage < 1 || nextPage > pageCount) {
      return;
    }
    onPageChange(nextPage);
  };

  return (
    <RevealSection>
      <nav
        aria-label="Articles pagination"
        className={cn(
          'mt-12 flex items-center justify-center gap-2 py-8',
          getFadeUpClass('animate-delay-100')
        )}
      >
        <Button
          variant="outline"
          size="sm"
          icon={ChevronsLeft}
          ariaLabel="First page"
          disabled={currentPage === 1}
          onClick={() => handlePageSelect(1)}
        />
        <Button
          variant="outline"
          size="sm"
          icon={ChevronLeft}
          ariaLabel="Previous page"
          disabled={currentPage === 1}
          onClick={() => handlePageSelect(Math.max(1, currentPage - 1))}
        />

        <div className="flex gap-2 px-2">
          {pageRange.map((p) => (
            <button
              key={p}
              type="button"
              aria-current={p === currentPage ? 'page' : undefined}
              onClick={() => handlePageSelect(p)}
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-lg font-bold transition-all',
                p === currentPage
                  ? 'scale-110 bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                  : 'bg-white text-slate-600 hover:bg-neutral-100 dark:bg-neutral-800 dark:text-slate-400 dark:hover:bg-neutral-700/50'
              )}
            >
              {p}
            </button>
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          icon={ChevronRight}
          ariaLabel="Next page"
          disabled={currentPage === pageCount}
          onClick={() => handlePageSelect(Math.min(pageCount, currentPage + 1))}
        />
        <Button
          variant="outline"
          size="sm"
          icon={ChevronsRight}
          ariaLabel="Last page"
          disabled={currentPage === pageCount}
          onClick={() => handlePageSelect(pageCount)}
        />
      </nav>
    </RevealSection>
  );
}
