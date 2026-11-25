'use client';

import type { TransformedResults } from './types';

import { Copy, LoaderCircle, ScanSearch } from 'lucide-react';
import { size } from 'lodash';

import { InsetGroup } from '@/components/tools/common/inset-group';
import LabelBar from '@/components/tools/common/label-bar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import toast from '@/utils/toast';

import { DetectionResultItem } from './detection-result-item';

type Props = {
  results: TransformedResults;
  isProcessing: boolean;
  activeIndex?: number | null;
  onHoverIndex?: (index: number | null) => void;
  compact?: boolean;
  enableBarcodeActions?: boolean;
};

export default function DetectionResult({
  results,
  isProcessing,
  activeIndex = null,
  onHoverIndex,
  compact = false,
  enableBarcodeActions = false,
}: Props) {
  const handleCopyAll = () => {
    const textToCopy = results
      .map((item) => {
        const label = item.label || 'Detected Object';
        const val = item.text || item.label || '';
        return label ? `${label}: ${val}` : val;
      })
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
    <div className="w-full text-left">
      {!compact ? (
        <LabelBar
          label={
            <div className="flex items-center gap-2">
              <span>Detection Results</span>
              {size(results) > 0 && (
                <Badge size="xs" variant="primary" rounded="full">
                  {size(results)}
                </Badge>
              )}
            </div>
          }
          actions={
            results.length > 1 ? (
              <Button
                variant="outline"
                size="xs"
                rounded="lg"
                icon={Copy}
                onClick={handleCopyAll}
              >
                Copy All
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="mb-2.5 flex items-center justify-between gap-2">
          <span className="text-[11px] text-slate-400 dark:text-slate-500">
            Hover any item to highlight its bounding box
          </span>
          {results.length > 1 && (
            <Button
              variant="outline"
              size="xs"
              rounded="lg"
              icon={Copy}
              onClick={handleCopyAll}
            >
              Copy All
            </Button>
          )}
        </div>
      )}

      {isProcessing ? (
        <div className="flex items-center justify-center gap-2 rounded-xl border border-neutral-200/80 bg-white/70 py-10 text-xs font-medium text-slate-500 dark:border-neutral-800 dark:bg-neutral-900/40 dark:text-slate-400">
          <LoaderCircle size={16} className="animate-spin text-sky-500" />
          <span>Analyzing pixels...</span>
        </div>
      ) : results.length === 0 ? (
        <InsetGroup rounded="xl">
          <EmptyState
            icon={ScanSearch}
            title="No objects detected"
            description="Try a clearer image, another sample, or adjust the camera framing."
          />
        </InsetGroup>
      ) : (
        <InsetGroup rounded="xl" className="max-h-[380px] overflow-y-auto">
          {results.map((item, idx) => (
            <DetectionResultItem
              key={`${item.label ?? 'det'}-${idx}`}
              item={item}
              index={idx}
              isActive={activeIndex === idx}
              enableBarcodeActions={enableBarcodeActions}
              onHoverIndex={onHoverIndex}
            />
          ))}
        </InsetGroup>
      )}
    </div>
  );
}
