'use client';

import type {
  AlphabetPreset,
  BatchOptions,
  IdentifierFormat,
  QuoteStyle,
  SeparatorStyle,
} from './types';

import { Settings2 } from 'lucide-react';

import LabelBar from '@/components/tools/common/label-bar';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { PillTabs } from '@/components/ui/tabs';

import { FORMAT_METADATA_LIST } from './constants';

type BatchConfigSectionProps = {
  options: BatchOptions;
  onChange: <K extends keyof BatchOptions>(
    key: K,
    value: BatchOptions[K]
  ) => void;
};

const FORMAT_TABS: IdentifierFormat[] = FORMAT_METADATA_LIST.map((m) => m.id);

const FORMAT_TAB_LABELS: Record<IdentifierFormat, string> =
  FORMAT_METADATA_LIST.reduce(
    (acc, meta) => {
      acc[meta.id] = meta.name;
      return acc;
    },
    {} as Record<IdentifierFormat, string>
  );

const QUOTE_STYLE_TABS: QuoteStyle[] = ['none', 'single', 'double'];
const QUOTE_STYLE_LABELS: Record<QuoteStyle, string> = {
  none: 'None',
  single: "Single ('')",
  double: 'Double ("")',
};

const SEPARATOR_TABS: SeparatorStyle[] = ['newline', 'comma', 'json'];
const SEPARATOR_LABELS: Record<SeparatorStyle, string> = {
  newline: 'Newline (\\n)',
  comma: 'Comma (, )',
  json: 'JSON Array',
};

const ALPHABET_TABS: AlphabetPreset[] = [
  'url-safe',
  'alphanumeric',
  'no-ambiguous',
  'numbers',
  'hex',
  'custom',
];

const ALPHABET_LABELS: Record<AlphabetPreset, string> = {
  'url-safe': 'URL-Safe',
  alphanumeric: 'Alphanumeric',
  lowercase: 'Lowercase',
  uppercase: 'Uppercase',
  'no-ambiguous': 'No Ambiguous',
  numbers: 'Numbers',
  hex: 'Hex',
  custom: 'Custom',
};

export default function BatchConfigSection({
  options,
  onChange,
}: BatchConfigSectionProps) {
  const supportsHyphens =
    options.format === 'uuid-v4' || options.format === 'uuid-v7';
  const isNanoID = options.format === 'nanoid';

  return (
    <section className="w-full text-left">
      <LabelBar
        icon={Settings2}
        label="Batch Generator Settings"
        description="Configure target format, quantity, case, and output separators"
      />

      <div className="space-y-4 rounded-xl border border-neutral-200/80 bg-white/70 p-4 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-900/40">
        {/* 1. Format Selection with PillTabs */}
        <div className="w-fit space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            Target Identifier Format
          </label>
          <PillTabs
            tabs={FORMAT_TABS}
            activeTab={options.format}
            onChange={(tab) => onChange('format', tab as IdentifierFormat)}
            tabLabels={FORMAT_TAB_LABELS}
            variant="segment"
            size="xs"
            rounded="md"
            className="flex flex-wrap gap-1 p-1"
            tabClassName="px-2.5 py-1 text-xs"
          />
        </div>

        {/* 2. Count & Quantity */}
        <div className="w-fit space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            Quantity to Generate (1 ~ 1,000)
          </label>
          <Input
            type="number"
            inputMode="numeric"
            value={options.count}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              onChange(
                'count',
                isNaN(val) ? 1 : Math.min(Math.max(1, val), 1000)
              );
            }}
            className="w-32 text-center font-mono text-xs"
          />
        </div>

        {/* 3. Output Case, Hyphens, Quotes, Separators */}
        <div className="grid grid-cols-1 gap-4 border-t border-neutral-200/60 pt-1 sm:grid-cols-2 lg:grid-cols-4 dark:border-neutral-800/60">
          {/* Letter Case */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
              Letter Case
            </label>
            <PillTabs
              tabs={['lower', 'upper']}
              activeTab={options.uppercase ? 'upper' : 'lower'}
              onChange={(tab) => onChange('uppercase', tab === 'upper')}
              tabLabels={{ lower: 'lowercase', upper: 'UPPERCASE' }}
              variant="segment"
              size="xs"
              rounded="md"
              className="p-0.5"
              tabClassName="px-2.5 py-1 text-xs"
            />
          </div>

          {/* Hyphens */}
          {supportsHyphens && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                Hyphens Separators
              </label>
              <PillTabs
                tabs={['with', 'without']}
                activeTab={options.hyphens ? 'with' : 'without'}
                onChange={(tab) => onChange('hyphens', tab === 'with')}
                tabLabels={{
                  with: 'With (8-4-4-4-12)',
                  without: 'Without (32 Hex)',
                }}
                variant="segment"
                size="xs"
                rounded="md"
                className="p-0.5"
                tabClassName="px-2.5 py-1 text-xs"
              />
            </div>
          )}

          {/* Quote Style with PillTabs */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
              Wrap with Quotes
            </label>
            <PillTabs
              tabs={QUOTE_STYLE_TABS}
              activeTab={options.quoteStyle}
              onChange={(tab) => onChange('quoteStyle', tab as QuoteStyle)}
              tabLabels={QUOTE_STYLE_LABELS}
              variant="segment"
              size="xs"
              rounded="md"
              className="p-0.5"
              tabClassName="px-2.5 py-1 text-xs"
            />
          </div>

          {/* Delimiter / Separator with PillTabs */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
              Delimiter / Separator
            </label>
            <PillTabs
              tabs={SEPARATOR_TABS}
              activeTab={options.separator}
              onChange={(tab) => onChange('separator', tab as SeparatorStyle)}
              tabLabels={SEPARATOR_LABELS}
              variant="segment"
              size="xs"
              rounded="md"
              className="p-0.5"
              tabClassName="px-2.5 py-1 text-xs"
            />
          </div>
        </div>

        {/* 4. Dedicated NanoID Customization Tray */}
        {isNanoID && (
          <div className="space-y-4 rounded-lg border border-neutral-200/50 bg-neutral-100/70 p-3.5 dark:border-neutral-700/50 dark:bg-neutral-800/50">
            {/* Slider for NanoID Length */}
            <Slider
              title="NanoID Length"
              desc="Length of the generated random string"
              min={4}
              max={64}
              step={1}
              value={options.nanoidLength}
              showValueBadge
              unit=" chars"
              onChange={(e) =>
                onChange('nanoidLength', parseInt(e.target.value, 10))
              }
            />

            {/* Alphabet Preset with PillTabs */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                Alphabet Preset
              </label>
              <PillTabs
                tabs={ALPHABET_TABS}
                activeTab={options.alphabetPreset}
                onChange={(tab) =>
                  onChange('alphabetPreset', tab as AlphabetPreset)
                }
                tabLabels={ALPHABET_LABELS}
                variant="segment"
                size="xs"
                rounded="md"
                className="p-0.5"
                tabClassName="px-2.5 py-1 text-xs"
              />
            </div>

            {options.alphabetPreset === 'custom' && (
              <div className="space-y-1 pt-1">
                <label className="text-xs text-neutral-500">
                  Custom Character Set (minimum 2 unique characters):
                </label>
                <Input
                  type="text"
                  placeholder="e.g. 1234567890abcdef!@#"
                  value={options.customAlphabet}
                  onChange={(e) => onChange('customAlphabet', e.target.value)}
                  onClear={() => onChange('customAlphabet', '')}
                  className="font-mono text-xs"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
