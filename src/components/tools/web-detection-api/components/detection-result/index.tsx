'use client';

import { TransformedResults } from '../../types';
import { AlertCircle, SquareSquare } from 'lucide-react';
import CopyAction from '@/components/common/action-button/copy';
import Badge from '@/components/common/badge';
import Card from '@/components/common/card';
import CardTitle from '@/components/common/card/title';
import _size from 'lodash/size';

type Props = {
  results: TransformedResults;
  isProcessing: boolean;
};

export default function DetectionResult({ results, isProcessing }: Props) {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <CardTitle icon={SquareSquare}>Detection Results</CardTitle>
        <Badge>{_size(results)} Found</Badge>
      </div>

      {/* Separate */}
      <div className="-mx-6 my-6 border-b border-neutral-200 dark:border-neutral-700" />

      <div className="-m-6 max-h-80 flex-1 space-y-3 overflow-y-auto p-6">
        {isProcessing ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-neutral-400">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-200 border-t-blue-500"></div>
            <p className="text-sm">Analyzing pixels...</p>
          </div>
        ) : _size(results) > 0 ? (
          results?.map(({ label, confidence, text }, idx) => (
            <div
              key={idx}
              className="group flex cursor-pointer items-center justify-between rounded-lg border border-neutral-200 bg-white p-3 text-left transition-colors hover:border-blue-500 dark:border-neutral-700 dark:bg-neutral-800 dark:hover:border-blue-500"
            >
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <div className="text-sm font-medium">
                    {label || 'Detected Object'}
                  </div>
                  {!!confidence && (
                    <Badge>{Math.round(confidence * 100)}%</Badge>
                  )}
                </div>
                {!!text && (
                  <div className="break-all font-mono text-sm text-neutral-600 dark:text-neutral-300">
                    {text}
                  </div>
                )}
              </div>
              <div className="opacity-0 transition-opacity group-hover:opacity-100">
                <CopyAction display="icon" content={text || label} />
              </div>
            </div>
          ))
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-center text-neutral-500">
            <AlertCircle size={32} className="mb-2 opacity-50" />
            <p className="text-sm">No results to display.</p>
          </div>
        )}
      </div>
    </Card>
  );
}
