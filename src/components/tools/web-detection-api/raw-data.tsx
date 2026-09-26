'use client';

import { Braces } from 'lucide-react';

import { CopyAction } from '@/components/shared/action-button';
import LabelBar from '@/components/tools/common/label-bar';

type Props = {
  results:
    | FaceDetectionResults
    | BarcodeDetectionResults
    | TextDetectionResults
    | null;
};

export default function RawData({ results }: Props) {
  const hasData = !!results && results.length > 0;
  const contentString = hasData ? JSON.stringify(results, null, 2) : '';

  return (
    <div className="w-full text-left">
      <LabelBar icon={Braces} label="Raw Data">
        {hasData && <CopyAction content={contentString} />}
      </LabelBar>

      <div className="max-h-80 flex-1 overflow-auto whitespace-pre rounded-xl border border-neutral-200/80 bg-neutral-100/80 p-3.5 text-left font-mono text-xs text-slate-600 dark:border-neutral-800 dark:bg-neutral-950 dark:text-slate-400">
        {hasData ? contentString : '// No data detected'}
      </div>
    </div>
  );
}
