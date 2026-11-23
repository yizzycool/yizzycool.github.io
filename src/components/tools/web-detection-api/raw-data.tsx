'use client';

import { Braces } from 'lucide-react';

import { CopyAction } from '@/components/shared/action-button';
import LabelBar from '@/components/tools/common/label-bar';
import { cn } from '@/utils/cn';

type Props = {
  results:
    | FaceDetectionResults
    | BarcodeDetectionResults
    | TextDetectionResults
    | null;
  compact?: boolean;
};

export default function RawData({ results, compact = false }: Props) {
  const hasData = !!results && results.length > 0;
  const contentString = hasData ? JSON.stringify(results, null, 2) : '';

  return (
    <div className="w-full text-left">
      {!compact ? (
        <LabelBar icon={Braces} label="Raw Data">
          {hasData && <CopyAction content={contentString} />}
        </LabelBar>
      ) : (
        <div className="mb-2.5 flex items-center justify-between gap-2">
          <span className="text-[11px] text-slate-400 dark:text-slate-500">
            Browser Detection API JSON output
          </span>
          {hasData && (
            <CopyAction
              content={contentString}
              label="Copy JSON"
              variant="outline"
              successToast="Copied raw JSON output"
            />
          )}
        </div>
      )}

      <div
        className={cn(
          'flex-1 overflow-auto whitespace-pre rounded-xl border border-neutral-200/80 bg-neutral-100/80 p-3.5 text-left font-mono text-xs text-slate-600 dark:border-neutral-800 dark:bg-neutral-950 dark:text-slate-400',
          compact ? 'max-h-[440px]' : 'max-h-80'
        )}
      >
        {hasData ? contentString : '// No data detected'}
      </div>
    </div>
  );
}
