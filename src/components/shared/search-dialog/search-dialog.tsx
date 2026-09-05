'use client';

import type { FuseResult } from 'fuse.js';
import type { SearchDialogProps } from './types';

import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowDownUp,
  Command,
  CornerDownLeft,
  Search,
  SearchX,
} from 'lucide-react';
import { sortBy, get, filter, map } from 'lodash';

import useSearchContent from './hooks/use-search-content';
import useKeyboardNavigation from './hooks/use-keyboard-navigation';
import { Button } from '@/components/ui/button';
import { BaseDialog } from '@/components/ui/dialog';
import { HotkeyBadge } from '@/components/ui/badge';
import { ResultCard } from './result-card';
import {
  searchBodyStyles,
  searchFooterStyles,
  searchHeaderStyles,
  searchInputStyles,
} from './search-dialog.variants';

export function SearchDialog({ deviceType }: SearchDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
  const [input, setInput] = useState('');
  const [query, setQuery] = useState('');

  const inputRef = useRef<HTMLInputElement>(null);

  const { error: blogDataError, searchResults: searchResultForBlog } =
    useSearchContent({ isOpen, query, dataUrl: '/data/blog/search.json' });
  const { error: toolsDataError, searchResults: searchResultForTools } =
    useSearchContent({ isOpen, query, dataUrl: '/data/tools/search.json' });
  const _isError = blogDataError && toolsDataError;

  const filteredResults = useMemo(() => {
    const sortedResults = sortBy(
      [searchResultForBlog, searchResultForTools],
      (item) => get(item, [0, 'score'], 1)
    );

    let idx = 0;
    const sortedResultsWithIndex = map(sortedResults, (row) =>
      map(row, (item) => ({ ...item, idx: idx++ }))
    );

    return filter(sortedResultsWithIndex, (res) => res.length > 0);
  }, [searchResultForBlog, searchResultForTools]);

  const { focusIndex, onPointerEnter, onDialogKeyDown } = useKeyboardNavigation(
    {
      isComposing,
      filteredResults,
      closeDialog: () => setIsOpen(false),
    }
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        const isDesktopScreen = window.innerWidth >= 1024;
        if (
          (deviceType === 'desktop' && !isDesktopScreen) ||
          (deviceType === 'mobile' && isDesktopScreen)
        ) {
          return;
        }
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [deviceType]);

  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
    return () => clearTimeout(timer);
  }, [isOpen]);

  const onButtonClick = () => {
    setIsOpen(true);
  };

  useEffect(() => {
    if (isComposing) return;
    setTimeout(() => {
      setQuery(input);
    }, 0);
  }, [input, isComposing]);

  const closeDialog = () => {
    if (document.activeElement === inputRef.current && !!query) {
      setInput('');
    } else {
      setIsOpen(false);
      setInput('');
    }
  };

  const getPageName = (results: Array<FuseResult<DataForSearch>>) =>
    get(results, [0, 'item', 'page'], '');

  const getPageCategory = (results: Array<FuseResult<DataForSearch>>) => {
    const pageName = getPageName(results);
    if (pageName === 'blog') {
      return `Articles (${results.length})`;
    } else if (pageName === 'tools') {
      return `Tools (${results.length})`;
    }
    return '';
  };

  return (
    <>
      <Button
        onClick={onButtonClick}
        variant="ghost"
        size={deviceType === 'desktop' ? 'xs' : 'lg'}
        rounded={deviceType === 'desktop' ? 'base' : 'full'}
        className={
          deviceType === 'desktop'
            ? 'group border border-neutral-200 dark:border-neutral-700'
            : 'group !p-2'
        }
        icon={Search}
        iconClassName="group-hover:text-blue-500"
        ariaLabel="search"
      >
        {deviceType === 'desktop' && (
          <>
            <span className="mr-4 flex-1 text-left">Search...</span>
            <HotkeyBadge
              symbol="Mod + K"
              layout="combined"
              className="inline-flex"
            />
          </>
        )}
      </Button>

      <BaseDialog
        isOpen={isOpen}
        onClose={closeDialog}
        className="w-full max-w-2xl"
      >
        <div
          className="flex flex-col overflow-hidden"
          onKeyDown={onDialogKeyDown}
        >
          {/* Search Header */}
          <div className={searchHeaderStyles}>
            <Search className="mr-3 h-6 w-6 text-blue-600 dark:text-blue-400" />
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onCompositionStart={() => setIsComposing(true)}
              onCompositionEnd={() => setIsComposing(false)}
              placeholder="Search articles or tools..."
              className={searchInputStyles}
            />
            <Button size="xs" variant="ghost" bordered onClick={closeDialog}>
              ESC
            </Button>
          </div>

          {/* Search Body */}
          <div className={searchBodyStyles}>
            {!query ? (
              <div className="my-auto flex h-full select-none flex-col items-center justify-center py-12 text-center">
                <div className="mb-4 rounded-full bg-neutral-100 p-4 dark:bg-neutral-800/50">
                  <Command
                    size={32}
                    className="text-slate-400 dark:text-slate-600"
                  />
                </div>
                <p className="text-sm font-medium text-slate-400 dark:text-slate-500">
                  Type to search...
                </p>
              </div>
            ) : filteredResults.length > 0 ? (
              <div className="space-y-1">
                {filteredResults.map((results, index) => (
                  <Fragment key={index}>
                    <div className="px-2 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      {getPageCategory(results)}
                    </div>

                    {results.map((data) => (
                      <ResultCard
                        key={data.refIndex}
                        data={data}
                        closeDialog={closeDialog}
                        focusIndex={focusIndex}
                        onPointerEnter={onPointerEnter}
                      />
                    ))}
                  </Fragment>
                ))}
              </div>
            ) : (
              <div className="my-auto space-y-1">
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <SearchX size={32} className="mb-3 text-slate-500" />
                  <p className="text-slate-500">
                    No results found for "
                    <span className="font-medium text-slate-900 dark:text-slate-300">
                      {query}
                    </span>
                    "
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className={searchFooterStyles}>
            <span className="flex items-center gap-1">
              <ArrowDownUp size={12} strokeWidth={2} /> to navigate
            </span>
            <span className="flex items-center gap-1">
              <CornerDownLeft size={12} strokeWidth={2} /> to select
            </span>
          </div>
        </div>
      </BaseDialog>
    </>
  );
}
