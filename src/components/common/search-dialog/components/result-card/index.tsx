'use client';

import clsx from 'clsx';
import urlJoin from 'url-join';
import { FuseResult } from 'fuse.js';
import { CornerDownLeft, FileText, LucideIcon } from 'lucide-react';
import { useMemo } from 'react';
import Link from 'next/link';
import {
  ToolIcons,
  ToolSlugs,
} from '@/components/header/components/tools-selector/data';
import Badge from '@/components/common/badge';
import _get from 'lodash/get';
import _findKey from 'lodash/findKey';

type Props = {
  data: FuseResult<DataForSearch> & { idx: number };
  closeDialog?: () => void;
  focusIndex: number;
  onPointerEnter: (idx: number) => void;
};

export default function ResultCard({
  data,
  closeDialog = () => {},
  focusIndex,
  onPointerEnter,
}: Props) {
  const focused = focusIndex === data.idx;

  const Icon: LucideIcon = useMemo(() => {
    if (data.item.page === 'blog') {
      return FileText;
    } else {
      const slug = data.item.slug;
      const toolKey = _findKey(ToolSlugs, (s) => s === slug) || '';
      return _get(ToolIcons, toolKey);
    }
  }, [data]);

  const url = urlJoin(
    '/',
    data.item.page,
    data.item.categorySlug,
    data.item.slug
  );

  return (
    <Link
      id={`search-result-${data.idx}`}
      className={clsx(
        'relative flex w-full items-start gap-3 rounded-xl p-3 text-left transition-colors',
        focused && 'bg-neutral-50 dark:bg-neutral-800/60'
      )}
      href={url}
      onClick={closeDialog}
      onPointerEnter={() => onPointerEnter(data.idx)}
    >
      {/* Left: Icon Box */}
      <div
        className={clsx(
          'mt-1 shrink-0 rounded-lg p-2 transition-colors',
          'text-neutral-500 dark:text-neutral-400',
          'bg-neutral-100 dark:bg-neutral-800',
          focused &&
            'bg-neutral-200 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-200'
        )}
      >
        <Icon size={20} />
      </div>

      {/* Middle: Content */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden pr-10">
        {/* Title Row */}
        <div className="mb-1.5 flex items-center justify-between">
          <span
            className={clsx(
              'truncate text-[15px] font-medium transition-colors',
              'text-neutral-900 dark:text-neutral-200',
              focused && 'text-blue-500 dark:text-blue-500'
            )}
          >
            {data.item.title}
          </span>
          <Badge variant="blue" bordered>
            {data.item.category}
          </Badge>
        </div>

        {/* Excerpt Row */}
        <span className="truncate text-xs leading-relaxed text-neutral-400 dark:text-neutral-500/80">
          {data.item.description}
        </span>
      </div>

      {/* Right: Enter Icon (Only visible on hover) */}
      <div
        className={clsx(
          'absolute right-4 top-1/2',
          'text-neutral-400 dark:text-neutral-500',
          'transition-all duration-200',
          '-translate-x-2 -translate-y-1/2',
          'opacity-0',
          focused && 'translate-x-0 opacity-100'
        )}
      >
        <CornerDownLeft size={18} />
      </div>
    </Link>
  );
}
