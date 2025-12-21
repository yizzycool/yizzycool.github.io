'use client';

import clsx from 'clsx';
import { useEffect, useMemo, useState } from 'react';
import { Hash, RefreshCw } from 'lucide-react';
import Card from '@/components/common/card';
import ResultRow from './components/result-row';

type ConvertedDate = {
  utc?: string;
  local?: string;
  iso?: string;
};

export default function TimestampToDateCard() {
  const [tsInput, setTsInput] = useState('');

  useEffect(() => {
    setTsInput(Math.floor(Date.now() / 1000).toString());
  }, []);

  // Timestamp to Date Calculation
  const convertedDate: ConvertedDate = useMemo(() => {
    try {
      const val = parseInt(tsInput);
      if (isNaN(val)) return {};
      // Detect if milliseconds or seconds
      const date = val > 9999999999 ? new Date(val) : new Date(val * 1000);
      return {
        utc: date.toUTCString(),
        local: date.toString(),
        iso: date.toISOString(),
      };
    } catch (_e) {
      return {};
    }
  }, [tsInput]);

  return (
    <Card animation="fade-in" className="text-left">
      <div className="border-b border-neutral-100 pb-6 dark:border-neutral-800">
        <div className="flex items-center gap-2">
          <Hash className="h-5 w-5 text-neutral-500" />
          <h3 className="text-lg font-semibold">Timestamp to Date</h3>
        </div>
      </div>

      <div className="flex-1 pt-6">
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Enter Timestamp
            </label>
            <div className="relative">
              <input
                type="number"
                value={tsInput}
                onChange={(e) => setTsInput(e.target.value)}
                className={clsx(
                  'input-number-no-spin',
                  'w-full rounded-lg border px-4 py-3 font-mono text-lg outline-none transition-all',
                  'border-neutral-200 bg-neutral-50 focus:border-neutral-500 focus:ring-1 focus:ring-neutral-500',
                  'dark:border-neutral-700 dark:bg-neutral-800 dark:focus:border-neutral-500'
                )}
                placeholder="e.g. 1734771000"
              />
              <button
                onClick={() =>
                  setTsInput(Math.floor(Date.now() / 1000).toString())
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                title="Set to now"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="space-y-3 pt-4">
            <ResultRow label="GMT / UTC" value={convertedDate?.utc} />
            <ResultRow label="Local Time" value={convertedDate?.local} />
            <ResultRow label="ISO 8601" value={convertedDate?.iso} />
          </div>
        </div>
      </div>
    </Card>
  );
}
