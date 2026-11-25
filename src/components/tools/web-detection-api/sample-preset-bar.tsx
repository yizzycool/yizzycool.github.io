'use client';

import type { SamplePresetOption } from './utils/sample-presets';

import { Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';

type SamplePresetBarProps = {
  samples: SamplePresetOption[];
  onSelectSample: (sampleId: string) => void;
  isLoading?: boolean;
};

export default function SamplePresetBar({
  samples,
  onSelectSample,
  isLoading = false,
}: SamplePresetBarProps) {
  if (samples.length === 0) return null;

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-neutral-200/80 bg-white/70 px-3.5 py-2.5 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-900/50">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
        <Sparkles size={13} className="text-sky-500" />
        <span>Try Interactive Sample:</span>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {samples.map((sample) => (
          <Button
            key={sample.id}
            variant="outline"
            size="xs"
            rounded="full"
            disabled={isLoading}
            onClick={() => onSelectSample(sample.id)}
          >
            {sample.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
