'use client';

import type { FuseResult } from 'fuse.js';

import {
  Fragment,
  MouseEventHandler,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Command, Search, SearchX } from 'lucide-react';

import useSearchContent from './hooks/use-search-content';
import useKeyboardNavigation from './hooks/use-keyboard-navigation';
import Button from '../button';
import BaseDialog from '../dialog/base';
import Badge from '../badge';
import ResultCard from './components/result-card';

import _sortBy from 'lodash/sortBy';
import _get from 'lodash/get';
import _filter from 'lodash/filter';
import _findKey from 'lodash/findKey';
import _map from 'lodash/map';

interface Props {
  deviceType: 'desktop' | 'mobile';
}

export default function SearchDialog({ deviceType }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');

  const { error: blogDataError, searchResults: searchResultForBlog } =
    useSearchContent({ isOpen, query, dataUrl: '/data/blog/search.json' });
  const { error: toolsDataError, searchResults: searchResultForTools } =
    useSearchContent({ isOpen, query, dataUrl: '/data/tools/search.json' });
  const _isError = blogDataError && toolsDataError;

  //  [searchResultForBlog, searchResultForTools] or [searchResultForTools, searchResultForBlog].
  //  Depends on the score of first item of each results
  const filteredResults = useMemo(() => {
    const sortedResults = _sortBy(
      [searchResultForBlog, searchResultForTools],
      (item) => _get(item, [0, 'score'], 1)
    );

    // insert index
    let idx = 0;
    const sortedResultsWithIndex = _map(sortedResults, (row) =>
      _map(row, (item) => ({ ...item, idx: idx++ }))
    );

    return _filter(sortedResultsWithIndex, (res) => res.length > 0);
  }, [searchResultForBlog, searchResultForTools]);

  const { focusIndex, onPointerEnter, onDialogKeyDown } = useKeyboardNavigation(
    {
      filteredResults,
      closeDialog: () => setIsOpen(false),
    }
  );

  // Handle Command+K / Ctrl+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Clear query when dialog closed
  useEffect(() => {
    if (isOpen) return;
    setQuery('');
  }, [isOpen]);

  const onButtonClick: MouseEventHandler<HTMLButtonElement> = (_e) => {
    setIsOpen(true);
  };

  const closeDialog = () => setIsOpen(false);

  const getPageName = (results: Array<FuseResult<DataForSearch>>) =>
    _get(results, [0, 'item', 'page'], '');

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
        iconClassName="transition-colors group-hover:text-blue-500"
        ariaLabel="search"
      >
        {deviceType === 'desktop' && (
          <>
            <span className="mr-4 flex-1 text-left">Search...</span>
            <Badge rounded="md" bordered={true}>
              <span>⌘</span>
              <span>K</span>
            </Badge>
          </>
        )}
      </Button>

      {/* Dialog */}
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
          <div className="flex shrink-0 items-center border-b border-neutral-100 px-4 py-4 dark:border-neutral-800">
            <Search className="mr-3 h-6 w-6 text-blue-600 dark:text-blue-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search articles or tools..."
              className="flex-1 bg-transparent text-lg text-neutral-900 outline-none placeholder:text-neutral-500 dark:text-neutral-100"
              data-autofocus // implement autoFocus by headlessui
              autoFocus
            />
            <Button size="xs" variant="ghost" bordered onClick={closeDialog}>
              ESC
            </Button>
          </div>

          {/* Search Body */}
          <div className="flex min-h-[300px] flex-col overflow-y-auto p-2">
            {!query ? (
              // --- Empty State ---
              <div className="my-auto flex h-full select-none flex-col items-center justify-center py-12 text-center">
                <div className="mb-4 rounded-full bg-neutral-100 p-4 dark:bg-neutral-800/50">
                  <Command
                    size={32}
                    className="text-neutral-400 dark:text-neutral-600"
                  />
                </div>
                <p className="text-sm font-medium text-neutral-400 dark:text-neutral-500">
                  Type to search articles...
                </p>
              </div>
            ) : // --- Results State ---
            filteredResults.length > 0 ? (
              <div className="space-y-1">
                {filteredResults.map((results, index) => (
                  <Fragment key={index}>
                    <div className="px-2 py-2 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                      {getPageName(results) === 'blog' && 'Articles'}
                      {getPageName(results) === 'tools' && 'Tools'}
                    </div>

                    {/* Result for blog */}
                    {results.map((data) => (
                      <ResultCard
                        key={data.refIndex}
                        data={data}
                        closeDialog={closeDialog}
                        focusIndex={focusIndex}
                        onPointerEnter={onPointerEnter}
                      />
                    ))}

                    {/* Result for tools */}
                  </Fragment>
                ))}
              </div>
            ) : (
              // --- No Results Found ---
              <div className="my-auto space-y-1">
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <SearchX size={32} className="mb-3 text-neutral-500" />
                  <p className="text-neutral-500">
                    No results found for "
                    <span className="font-medium text-neutral-900 dark:text-neutral-300">
                      {query}
                    </span>
                    "
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex shrink-0 justify-end gap-4 border-t border-neutral-100 bg-neutral-50 px-4 py-3 text-xs text-neutral-400 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-500">
            <span>
              <span className="font-bold">↑↓</span> to navigate
            </span>
            <span>
              <span className="font-bold">↵</span> to select
            </span>
          </div>
        </div>
      </BaseDialog>
    </>
  );
}
