'use client';

import type { FormatOptions, HexCase, HexDelimiter } from './types';

import { PillTabs } from '@/components/ui/tabs';

import { DELIMITER_LABELS, HEX_CASE_LABELS } from './constants';

interface FormatControlsBarProps {
  options: FormatOptions;
  onChangeOptions: (options: FormatOptions) => void;
}

const DELIMITERS: HexDelimiter[] = [
  'space',
  'none',
  'comma',
  'colon',
  '0x-prefix',
];
const HEX_CASES: HexCase[] = ['lowercase', 'uppercase'];

export default function FormatControlsBar({
  options,
  onChangeOptions,
}: FormatControlsBarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3.5 text-left">
      <div className="flex flex-wrap items-center gap-4">
        {/* Delimiter Selection */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-neutral-400">
            Delimiter:
          </span>
          <PillTabs<HexDelimiter>
            tabs={DELIMITERS}
            activeTab={options.delimiter}
            onChange={(delimiter) => onChangeOptions({ ...options, delimiter })}
            tabLabels={DELIMITER_LABELS}
            variant="segment"
            size="xs"
            rounded="md"
          />
        </div>

        {/* Case Mode Selection */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-neutral-400">
            Case:
          </span>
          <PillTabs<HexCase>
            tabs={HEX_CASES}
            activeTab={options.hexCase}
            onChange={(hexCase) => onChangeOptions({ ...options, hexCase })}
            tabLabels={HEX_CASE_LABELS}
            variant="segment"
            size="xs"
            rounded="md"
          />
        </div>
      </div>
    </div>
  );
}
