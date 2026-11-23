'use client';

import type { TooltipItem } from 'chart.js';

import { useMemo } from 'react';
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from 'chart.js';
import { isNull, map, round, slice } from 'lodash';
import { Bar } from 'react-chartjs-2';

import { CopyAction } from '@/components/shared/action-button';
import { Badge } from '@/components/ui/badge';
import intlUtils from '@/utils/intl-utils';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const CHART_OPTIONS = {
  indexAxis: 'y' as const,
  responsive: true,
  animation: {
    duration: 450,
  },
  plugins: {
    legend: { display: false },
    tooltip: {
      padding: 12,
      cornerRadius: 8,
      titleFont: { size: 13, family: "'Inter', sans-serif" },
      bodyFont: { size: 12, family: "'Inter', sans-serif" },
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
      suggestedMax: 1,
    },
    y: {
      grid: { display: false },
      ticks: {
        color: '#94a3b8',
      },
    },
  },
  layout: {
    padding: { left: 0, right: 16, top: 0, bottom: 0 },
  },
  maintainAspectRatio: false,
};

export default function BarChart({
  results,
}: {
  results: Array<LanguageDetectionResult> | null;
}) {
  const topCandidates = useMemo(() => {
    if (!results) return [];
    const significant = results
      .filter((item) => (item.confidence ?? 0) >= 0.001)
      .slice(0, 8);
    return significant.length > 0 ? significant : slice(results, 0, 6);
  }, [results]);

  const data = useMemo(() => {
    if (isNull(results) || topCandidates.length === 0) return null;

    return {
      labels: map(topCandidates, (result) =>
        intlUtils.languageTagToHumanReadable(result.detectedLanguage)
      ),
      datasets: [
        {
          label: 'Confidence',
          data: map(topCandidates, (result) => result.confidence),
          backgroundColor: (context: { dataIndex: number }) =>
            context.dataIndex === 0
              ? 'rgba(14, 165, 233, 0.88)'
              : 'rgba(148, 163, 184, 0.45)',
          borderRadius: 6,
        },
      ],
    };
  }, [results, topCandidates]);

  const topData = topCandidates[0];

  if (isNull(results) || isNull(data) || !topData) return null;

  return (
    <div className="flex h-full w-full flex-col text-left">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3 border-b border-neutral-200/80 pb-4 dark:border-neutral-800">
        <div className="min-w-0">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Detected Language
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <div className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-50">
              {intlUtils.languageTagToHumanReadable(
                topData.detectedLanguage || ''
              )}
            </div>
            {topData.detectedLanguage && (
              <div className="flex items-center gap-1">
                <Badge variant="blue" size="xs" rounded="md">
                  {topData.detectedLanguage}
                </Badge>
                <CopyAction
                  size="xs"
                  display="icon"
                  content={topData.detectedLanguage}
                  ariaLabel="Copy BCP-47 language code"
                />
              </div>
            )}
          </div>
        </div>

        <div className="shrink-0 text-right">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Confidence
          </div>
          <div className="mt-1 font-mono text-2xl font-bold tabular-nums text-sky-600 dark:text-sky-400">
            {round((topData.confidence || 0) * 100, 1)}%
          </div>
        </div>
      </div>

      <div className="relative min-h-[220px] flex-1">
        <Bar options={CHART_OPTIONS} data={data} />
      </div>
    </div>
  );
}
