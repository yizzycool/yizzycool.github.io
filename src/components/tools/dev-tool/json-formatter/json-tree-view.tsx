'use client';

import JsonView from '@uiw/react-json-view';
import { darkTheme } from '@uiw/react-json-view/dark';
import { lightTheme } from '@uiw/react-json-view/light';
import { Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';

import { CopyAction } from '@/components/shared/action-button';
import { InsetGroup } from '@/components/tools/common/inset-group';
import { Button } from '@/components/ui/button';
import { CheckBox } from '@/components/ui/checkbox';
import useDarkModeObserver from '@/hooks/window/use-dark-mode-observer';
import { cn } from '@/utils/cn';

import { JsonPathMatchItem } from './json-path-match-item';
import { flattenJsonPaths } from './utils/json-telemetry';

const oneLightStyles = {
  background: 'rgb(250, 250, 250)',
  color: 'rgb(56, 58, 66)',
  fontSize: '0.875rem',
};

const oneDarkStyles = {
  background: 'rgb(40, 44, 52)',
  color: 'rgb(171, 178, 191)',
  fontSize: '0.875rem',
};

const JSON_VIEW_OPTIONS = ['Data Types', 'Object Size', 'Sort Keys'] as const;

type JsonViewOption = (typeof JSON_VIEW_OPTIONS)[number];

const OPTIONS_DESC = [
  'Show data type tags (e.g. string, number)',
  'Show item count for objects and arrays',
  'Sort object keys alphabetically',
] as const;

type Props = {
  data: object | Array<unknown>;
};

export default function JsonTreeView({ data }: Props) {
  const { isDark } = useDarkModeObserver();
  const [pathQuery, setPathQuery] = useState('');

  const [options, setOptions] = useState({
    displayDataTypes: true,
    displayObjectSize: true,
    enableClipboard: true,
    objectSortKeys: false,
    collapsed: false,
  });

  const handleOptionChange = (option: JsonViewOption, checked: boolean) => {
    switch (option) {
      case 'Data Types':
        setOptions((prev) => ({ ...prev, displayDataTypes: checked }));
        break;
      case 'Object Size':
        setOptions((prev) => ({ ...prev, displayObjectSize: checked }));
        break;
      case 'Sort Keys':
        setOptions((prev) => ({ ...prev, objectSortKeys: checked }));
        break;
    }
  };

  const basicTheme = useMemo(() => {
    return isDark ? darkTheme : lightTheme;
  }, [isDark]);

  const customStyles = useMemo(() => {
    return isDark ? oneDarkStyles : oneLightStyles;
  }, [isDark]);

  const dataString = useMemo(() => {
    return JSON.stringify(data, null, 2);
  }, [data]);

  const allPaths = useMemo(() => flattenJsonPaths(data, 400), [data]);

  const filteredPaths = useMemo(() => {
    const q = pathQuery.trim().toLowerCase();
    if (!q) return [];
    return allPaths
      .filter(
        (entry) =>
          entry.path.toLowerCase().includes(q) ||
          entry.preview.toLowerCase().includes(q)
      )
      .slice(0, 30);
  }, [allPaths, pathQuery]);

  return (
    <div className="space-y-3">
      {/* Search JSONPath & Copy */}
      <div className="shadow-2xs flex items-center gap-2 rounded-xl border border-neutral-200/90 bg-white/80 px-3 py-2 backdrop-blur-md dark:border-neutral-700/80 dark:bg-neutral-900/80">
        <Search size={14} className="shrink-0 text-slate-400" />
        <input
          type="text"
          value={pathQuery}
          onChange={(e) => setPathQuery(e.target.value)}
          placeholder="Filter by key, value, or $.json.path to copy..."
          className="min-w-0 flex-1 bg-transparent font-mono text-xs text-slate-800 placeholder-slate-400 focus:outline-none dark:text-slate-100 dark:placeholder-slate-500"
        />
        {pathQuery && (
          <Button
            variant="ghost"
            size="xs"
            rounded="lg"
            icon={X}
            ariaLabel="Clear path filter"
            onClick={() => setPathQuery('')}
          />
        )}
      </div>

      {pathQuery.trim() && (
        <InsetGroup rounded="xl" className="max-h-56 overflow-y-auto">
          {filteredPaths.length > 0 ? (
            filteredPaths.map((entry) => (
              <JsonPathMatchItem key={entry.path} entry={entry} />
            ))
          ) : (
            <div className="px-3.5 py-4 text-center text-xs text-slate-400 dark:text-slate-500">
              No JSONPath nodes match &quot;{pathQuery.trim()}&quot;
            </div>
          )}
        </InsetGroup>
      )}

      {/* Options Bar */}
      <div
        className={cn(
          'shadow-2xs rounded-2xl border border-neutral-200/90 bg-white/80 p-3.5 backdrop-blur-md dark:border-neutral-700/80 dark:bg-neutral-900/80'
        )}
      >
        <CheckBox
          options={JSON_VIEW_OPTIONS}
          optionsDesc={OPTIONS_DESC}
          defaultChecked={[
            options.displayDataTypes,
            options.displayObjectSize,
            options.objectSortKeys,
          ]}
          wrapperClassName="space-y-0 flex flex-wrap items-center gap-y-2 gap-x-4 text-xs"
          onChange={handleOptionChange}
        />
      </div>

      <div
        className={cn(
          'relative flex w-full flex-col overflow-hidden',
          'rounded-2xl bg-neutral-100 dark:bg-neutral-800',
          'shadow-2xs border border-neutral-200/90 dark:border-neutral-700/80'
        )}
      >
        {/* Header - language + copy button */}
        <div
          className={cn(
            'flex items-center justify-between px-3 py-2',
            'bg-neutral-50 dark:bg-neutral-900/50',
            'text-xs text-gray-600 dark:text-gray-300'
          )}
        >
          <div className="flex items-center font-medium">
            <span>json tree</span>
          </div>
          <div className="flex items-center gap-2">
            <CopyAction
              variant="ghost"
              content={dataString}
              successToast="JSON tree copied to clipboard"
            />
          </div>
        </div>

        {/* Code Block */}
        <div
          className="flex max-h-[480px] flex-1 overflow-y-auto p-[1em]"
          style={customStyles}
        >
          {/* Line Number */}
          <div className="flex h-auto select-none flex-col items-end text-right italic leading-normal *:h-auto">
            {Array.from({ length: dataString.split('\n').length }).map(
              (_, idx) => (
                <span
                  key={idx}
                  className={cn('min-w-[2.25em] pr-[1em]')}
                  style={{
                    color: isDark ? '#5c6370' : '#a0a1a7',
                    fontFamily:
                      '"Fira Code", "Fira Mono", Menlo, Consolas, "DejaVu Sans Mono", monospace',
                  }}
                >
                  {idx + 1}
                </span>
              )
            )}
          </div>

          {/* JSON View */}
          <JsonView
            key={`${options.collapsed}-${options.objectSortKeys}`}
            value={data}
            displayDataTypes={options.displayDataTypes}
            displayObjectSize={options.displayObjectSize}
            enableClipboard={options.enableClipboard}
            objectSortKeys={options.objectSortKeys}
            collapsed={options.collapsed}
            style={{
              ...basicTheme,
              ...customStyles,
              fontFamily:
                'Fira Code, Fira Mono, Menlo, Consolas, DejaVu Sans Mono, monospace',
              textAlign: 'left',
              lineHeight: '1.5',
              margin: '0px',
              borderRadius: '0.3em',
              width: '100%',
              height: 'fit-content',
            }}
          />
        </div>
      </div>
    </div>
  );
}
