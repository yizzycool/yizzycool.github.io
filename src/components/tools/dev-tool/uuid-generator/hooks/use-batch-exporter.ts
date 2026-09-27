import type { BatchOptions } from '../types';

import { useCallback } from 'react';

import toast from '@/utils/toast';

import { formatBatchString } from '../utils/formatters';

export function useBatchExporter(batchList: string[], options: BatchOptions) {
  const getFormattedContent = useCallback((): string => {
    return formatBatchString(batchList, options.quoteStyle, options.separator);
  }, [batchList, options.quoteStyle, options.separator]);

  const copyAll = useCallback(async () => {
    if (batchList.length === 0) {
      toast.warning('No identifiers generated to copy');
      return;
    }

    try {
      const text = getFormattedContent();
      await navigator.clipboard.writeText(text);
      toast.success(
        `Copied ${batchList.length} ${batchList.length === 1 ? 'item' : 'items'} to clipboard!`
      );
    } catch {
      toast.error('Failed to copy to clipboard');
    }
  }, [batchList, getFormattedContent]);

  return {
    getFormattedContent,
    copyAll,
  };
}
