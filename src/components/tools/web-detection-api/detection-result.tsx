'use client';

import type { TransformedResults } from './types';
import type { PropertyItem } from '@/components/tools/common/property-row';

import { useMemo } from 'react';
import { size } from 'lodash';

import toast from '@/utils/toast';
import { PropertyResultCard } from '@/components/tools/common/property-row';

type Props = {
  results: TransformedResults;
  isProcessing: boolean;
};

export default function DetectionResult({ results, isProcessing }: Props) {
  const items: PropertyItem[] = useMemo(() => {
    return results.map((item, idx) => ({
      id: `detection-${idx}`,
      label: item.label || 'Detected Object',
      badge: item.confidence
        ? `${Math.round(item.confidence * 100)}%`
        : undefined,
      value: item.text || item.label || '',
      hoverAction: true,
    }));
  }, [results]);

  const handleCopyAll = () => {
    const textToCopy = items
      .map((item) =>
        item.label ? `${item.label}: ${item.value}` : String(item.value ?? '')
      )
      .filter(Boolean)
      .join('\n');

    if (!textToCopy) return;

    navigator.clipboard
      .writeText(textToCopy)
      .then(() => {
        toast.success('All detection results copied to clipboard');
      })
      .catch(() => {
        toast.error('Failed to copy results to clipboard');
      });
  };

  return (
    <PropertyResultCard
      title="Detection Results"
      count={size(results)}
      items={items}
      isLoading={isProcessing}
      loadingText="Analyzing pixels..."
      emptyText="No results to display."
      onCopyAll={items.length > 1 ? handleCopyAll : undefined}
    />
  );
}
