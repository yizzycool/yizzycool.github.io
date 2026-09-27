'use client';

import type { BatchOptions, GeneratorMode, OverviewItem } from '../types';

import { useCallback, useState } from 'react';

import useToolHotkeys from '@/hooks/tools/use-tool-hotkeys';
import useIsClient from '@/hooks/lifecycle/use-is-client';
import toast from '@/utils/toast';

import {
  ALPHABET_DEFINITIONS,
  DEFAULT_BATCH_OPTIONS,
  FORMAT_METADATA_LIST,
} from '../constants';
import { generateIdentifier } from '../utils/formatters';
import { customNanoID } from '../utils/nanoid-engine';
import { useBatchExporter } from './use-batch-exporter';

function generateInitialOverview(): OverviewItem[] {
  return FORMAT_METADATA_LIST.map((meta) => ({
    id: meta.id,
    name: meta.name,
    badge: meta.badge,
    description: meta.description,
    value: generateIdentifier(meta.id),
  }));
}

export function useIdentifierGenerator() {
  const [mode, setMode] = useState<GeneratorMode>('overview');
  const [overviewItems, setOverviewItems] = useState<OverviewItem[]>(() =>
    generateInitialOverview()
  );
  const [batchOptions, setBatchOptions] = useState<BatchOptions>(
    DEFAULT_BATCH_OPTIONS
  );
  const [batchList, setBatchList] = useState<string[]>(() => {
    return Array.from({ length: DEFAULT_BATCH_OPTIONS.count }, () =>
      generateIdentifier(DEFAULT_BATCH_OPTIONS.format, DEFAULT_BATCH_OPTIONS)
    );
  });

  const isClient = useIsClient();

  // Regenerate all overview items
  const regenerateOverview = useCallback(() => {
    setOverviewItems(
      FORMAT_METADATA_LIST.map((meta) => ({
        id: meta.id,
        name: meta.name,
        badge: meta.badge,
        description: meta.description,
        value: generateIdentifier(meta.id),
      }))
    );
    toast.success('Generated new identifiers for all formats!');
  }, []);

  // Regenerate a single item in overview mode
  const regenerateSingleOverviewItem = useCallback((id: OverviewItem['id']) => {
    setOverviewItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, value: generateIdentifier(item.id) } : item
      )
    );
    toast.success('Regenerated identifier');
  }, []);

  // Regenerate batch list
  const regenerateBatch = useCallback(
    (customOptions?: Partial<BatchOptions>) => {
      const opts = { ...batchOptions, ...customOptions };
      const count = Math.min(Math.max(1, opts.count || 1), 1000);
      const newItems = Array.from({ length: count }, () =>
        generateIdentifier(opts.format, opts)
      );
      setBatchList(newItems);
      toast.success(`Generated ${count} new ${opts.format} items!`);
    },
    [batchOptions]
  );

  // Update batch options
  const updateBatchOptions = useCallback(
    <K extends keyof BatchOptions>(key: K, value: BatchOptions[K]) => {
      setBatchOptions((prevOptions) => {
        const next = { ...prevOptions, [key]: value };

        if (key === 'uppercase') {
          // Adjust letter case in-place without generating new values
          const toUpper = Boolean(value);
          setBatchList((prevList) =>
            prevList.map((item) =>
              toUpper ? item.toUpperCase() : item.toLowerCase()
            )
          );
        } else if (key === 'hyphens') {
          // Add or remove hyphens in-place on existing UUID values
          const withHyphens = Boolean(value);
          setBatchList((prevList) =>
            prevList.map((item) => {
              const clean = item.replace(/-/g, '');
              if (!withHyphens) {
                return clean;
              }
              if (clean.length === 32) {
                return `${clean.slice(0, 8)}-${clean.slice(8, 12)}-${clean.slice(12, 16)}-${clean.slice(16, 20)}-${clean.slice(20, 32)}`;
              }
              return item;
            })
          );
        } else if (key === 'nanoidLength') {
          // Adjust NanoID length in-place (slice or append) without regenerating
          const targetLen = typeof value === 'number' ? value : 21;
          const alphabet =
            prevOptions.alphabetPreset === 'custom' &&
            prevOptions.customAlphabet
              ? prevOptions.customAlphabet
              : ALPHABET_DEFINITIONS[prevOptions.alphabetPreset ?? 'url-safe'];

          setBatchList((prevList) =>
            prevList.map((item) => {
              if (item.length === targetLen) return item;
              if (item.length > targetLen) {
                return item.slice(0, targetLen);
              }
              const diff = targetLen - item.length;
              return item + customNanoID(alphabet, diff);
            })
          );
        } else if (key === 'count') {
          // Adjust quantity while preserving existing items
          const targetCount = Math.min(
            Math.max(1, (value as number) || 1),
            1000
          );
          setBatchList((prevList) => {
            if (prevList.length === targetCount) return prevList;
            if (prevList.length > targetCount) {
              return prevList.slice(0, targetCount);
            }
            const additional = Array.from(
              { length: targetCount - prevList.length },
              () => generateIdentifier(prevOptions.format, prevOptions)
            );
            return [...prevList, ...additional];
          });
        } else if (
          key === 'format' ||
          key === 'alphabetPreset' ||
          key === 'customAlphabet'
        ) {
          // When format or alphabet definition changes, generate matching values
          const count = Math.min(Math.max(1, next.count || 1), 1000);
          const newItems = Array.from({ length: count }, () =>
            generateIdentifier(next.format, next)
          );
          setBatchList(newItems);
        }

        return next;
      });
    },
    []
  );

  // Unified trigger based on active mode
  const generateCurrent = useCallback(() => {
    if (mode === 'overview') {
      regenerateOverview();
    } else {
      regenerateBatch();
    }
  }, [mode, regenerateOverview, regenerateBatch]);

  // Exporter helpers for batch
  const batchExporter = useBatchExporter(batchList, batchOptions);

  // Global hotkeys (Cmd+Enter to regenerate, Cmd+Shift+C to copy all in batch mode)
  useToolHotkeys({
    onExecute: generateCurrent,
    onCopy: mode === 'batch' ? batchExporter.copyAll : undefined,
  });

  return {
    isClient,
    mode,
    setMode,
    overviewItems,
    regenerateOverview,
    regenerateSingleOverviewItem,
    batchOptions,
    updateBatchOptions,
    batchList,
    regenerateBatch,
    generateCurrent,
    batchExporter,
  };
}
