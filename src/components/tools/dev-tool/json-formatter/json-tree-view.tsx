'use client';

import JsonView from '@uiw/react-json-view';
import { darkTheme } from '@uiw/react-json-view/dark';
import { lightTheme } from '@uiw/react-json-view/light';
import { useMemo, useState } from 'react';

import useDarkModeObserver from '@/hooks/window/use-dark-mode-observer';
import { cn } from '@/utils/cn';
import { CopyAction } from '@/components/shared/action-button';
import { CheckBox } from '@/components/ui/checkbox';

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

  return (
    <>
      {/* Options Bar */}
      <div
        className={cn(
          'shadow-2xs rounded-t-xl border border-b-0 border-neutral-200/90 bg-white/80 p-3.5 backdrop-blur-md dark:border-neutral-700/80 dark:bg-neutral-900/80'
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
          wrapperClassName="!space-y-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
          onChange={handleOptionChange}
        />
      </div>
      <div
        className={cn(
          'relative flex w-full flex-col overflow-hidden',
          'rounded-b-xl bg-neutral-100 dark:bg-neutral-800',
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
          <div className="flex items-center">
            <div className="flex items-center gap-2">
              <CopyAction variant="ghost" content={dataString} />
            </div>
          </div>
        </div>

        {/* Code Block */}
        <div
          className="flex max-h-[500px] flex-1 overflow-y-auto p-[1em]"
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
    </>
  );
}
