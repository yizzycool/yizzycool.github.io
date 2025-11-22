'use client';

import clsx from 'clsx';
import { useMemo } from 'react';
import useLanguageTagToHumanReadable from '@/components/tools/chrome-built-in-ai-api/hooks/use-language-tag-to-human-readable';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TooltipItem,
} from 'chart.js';
import _isNull from 'lodash/isNull';
import _map from 'lodash/map';
import _head from 'lodash/head';
import _round from 'lodash/round';
import _slice from 'lodash/slice';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const options = {
  indexAxis: 'y' as const,
  responsive: true,
  animation: {
    duration: 500,
  },
  plugins: {
    legend: { display: false },
    tooltip: {
      padding: 12,
      cornerRadius: 8,
      titleFont: { size: 14, family: "'Inter', sans-serif" },
      bodyFont: { size: 13, family: "'Inter', sans-serif" },
      callbacks: {
        label: (context: TooltipItem<'bar'>) =>
          ` Confidence: ${((context.raw as number) * 100).toFixed(1)}%`,
      },
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { display: false },
    },
    y: {
      grid: { display: false },
      ticks: {
        color: '#a3a3a3',
      },
    },
  },
  layout: {
    padding: { left: 0, right: 20, top: 0, bottom: 0 },
  },
  maintainAspectRatio: false,
};

export default function BarChart({
  results,
}: {
  results: Array<LanguageDetectionResult> | null;
}) {
  const { languageTagToHumanReadable } = useLanguageTagToHumanReadable();

  const data = useMemo(() => {
    if (_isNull(results)) return null;
    const slicedResults = _slice(results, 0, 20);

    return {
      labels: _map(slicedResults, (result) =>
        languageTagToHumanReadable(result.detectedLanguage)
      ),
      datasets: [
        {
          label: 'Confidence',
          data: _map(slicedResults, (result) => result.confidence),
          backgroundColor: (context: { dataIndex: number }) => {
            if (context.dataIndex === 0) {
              return 'rgba(21, 121, 86, 0.9)';
            } else {
              return 'rgba(163, 163, 163, 0.5)';
            }
          },
          borderRadius: 6,
          // barThickness: 24,
        },
      ],
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [results]);

  const topData = _head(results);

  if (_isNull(results) || _isNull(data)) return null;

  return (
    <div className="flex w-full flex-col">
      <div
        className={clsx(
          'mb-8 flex justify-between border-b pb-8',
          'border-neutral-200 dark:border-neutral-700'
        )}
      >
        <div>
          <div className="text-sm font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            Detected Language
          </div>
          <div className="mt-1 flex items-baseline">
            <div className="text-4xl font-bold text-neutral-900 dark:text-neutral-50">
              {languageTagToHumanReadable(topData?.detectedLanguage || '')}
            </div>
            <div className="ml-3 rounded-md bg-neutral-400 px-2 py-0.5 text-lg font-medium text-neutral-100">
              {topData?.detectedLanguage}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            Confidence
          </div>
          <div className="mt-1 text-2xl font-bold text-neutral-900 dark:text-neutral-50">
            {_round((topData?.confidence || 0) * 100, 1)}%
          </div>
        </div>
      </div>
      <div className="relative max-h-[1000px] min-h-[300px] flex-grow">
        <Bar options={options} data={data} />
      </div>
    </div>
  );
}
