'use client';

import { Braces } from 'lucide-react';
import { CopyAction } from '@/components/shared/action-button';
import { Card } from '@/components/ui/card';
import { CardTitle } from '@/components/ui/card';

type Props = {
  results:
    | FaceDetectionResults
    | BarcodeDetectionResults
    | TextDetectionResults
    | null;
};

export default function RawData({ results }: Props) {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <CardTitle icon={Braces}>Raw Data</CardTitle>
        {!!results && <CopyAction content={JSON.stringify(results)} />}
      </div>

      {/* Separate */}
      <div className="-mx-6 my-6 border-b border-neutral-200 dark:border-neutral-700" />

      <div className="max-h-80 flex-1 overflow-auto whitespace-pre rounded-lg bg-neutral-100 p-3 text-left font-mono text-xs text-slate-600 dark:bg-neutral-950 dark:text-slate-400">
        {!!results && results.length > 0
          ? JSON.stringify(results, null, 2)
          : '// No data detected'}
      </div>
    </Card>
  );
}
