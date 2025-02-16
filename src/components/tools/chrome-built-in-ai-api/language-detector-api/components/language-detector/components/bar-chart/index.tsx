'use client';

import { LanguageDetectResults } from '@/components/tools/chrome-built-in-ai-api/types/types';
import { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import _isNull from 'lodash/isNull';
import _map from 'lodash/map';
import useLanguageTagToHumanReadable from '@/components/tools/chrome-built-in-ai-api/hooks/use-language-tag-to-human-readable';

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
  plugins: {
    legend: {
      position: 'top' as const,
    },
    // title: {
    //   display: true,
    //   text: 'Detection Result',
    // },
  },
  scales: {
    x: {
      beginAtZero: true,
    },
  },
  maintainAspectRatio: false,
};

export default function BarChart({
  results,
}: {
  results: Array<LanguageDetectResults> | null;
}) {
  const { languageTagToHumanReadable } = useLanguageTagToHumanReadable();

  const data = useMemo(() => {
    if (_isNull(results)) return null;
    return {
      labels: _map(results, (result) =>
        languageTagToHumanReadable(result.detectedLanguage)
      ),
      datasets: [
        {
          label: 'Confidence',
          data: _map(results, (result) => result.confidence),
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgb(75, 192, 192)',
          borderWidth: 1,
        },
      ],
    };
  }, [results]);

  if (_isNull(results) || _isNull(data)) return null;
  return (
    <div className="mt-10 max-h-[2000px] min-h-[1000px]">
      <div className="text-xl font-bold">Detection Result</div>
      <Bar options={options} data={data} />
    </div>
  );
}
