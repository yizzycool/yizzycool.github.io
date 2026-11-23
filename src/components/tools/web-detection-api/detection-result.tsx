'use client';

import type { TransformedResults } from './types';

import { Copy, LoaderCircle, ScanSearch } from 'lucide-react';
import { size } from 'lodash';

import { CopyAction } from '@/components/shared/action-button';
import { InsetGroup } from '@/components/tools/common/inset-group';
import LabelBar from '@/components/tools/common/label-bar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { cn } from '@/utils/cn';
import toast from '@/utils/toast';

type Props = {
  results: TransformedResults;
  isProcessing: boolean;
  activeIndex?: number | null;
  onHoverIndex?: (index: number | null) => void;
  compact?: boolean;
};

export default function DetectionResult({
  results,
  isProcessing,
  activeIndex = null,
  onHoverIndex,
  compact = false,
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
            description="Try a clearer image or adjust the camera framing."
          />
        </InsetGroup>
      ) : (
        <InsetGroup rounded="xl" className="max-h-[420px] overflow-y-auto">
          {results.map((item, idx) => (
            <div
              key={`${item.label ?? 'det'}-${idx}`}
              onMouseEnter={() => onHoverIndex?.(idx)}
              onMouseLeave={() => onHoverIndex?.(null)}
              className={cn(
                'flex items-start justify-between gap-3 px-3.5 py-2.5 transition-colors',
                activeIndex === idx
                  ? 'bg-sky-50/90 ring-1 ring-inset ring-sky-500/35 dark:bg-sky-950/35 dark:ring-sky-400/35'
                  : 'hover:bg-neutral-50/80 dark:hover:bg-neutral-800/35'
              )}
            >
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="rounded bg-sky-500/15 px-1.5 py-0.5 font-mono text-[10px] font-bold text-sky-700 dark:bg-sky-400/15 dark:text-sky-300">
                    #{idx + 1}
                  </span>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {item.label || 'Detected Object'}
                  </span>
                  {item.confidence ? (
                    <Badge variant="success" size="xs">
                      {Math.round(item.confidence * 100)}%
                    </Badge>
                  ) : null}
                </div>

                {item.text && (
                  <p className="break-all font-mono text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                    {item.text}
                  </p>
                )}
              </div>

              <CopyAction
                display="icon"
                variant="ghost"
                size="xs"
                rounded="lg"
                content={item.text || item.label || ''}
                title="Copy detected value"
                successToast="Copied detection value"
                className="shrink-0"
              />
            </div>
          ))}
        </InsetGroup>
      )}
    </div>
  );
}
