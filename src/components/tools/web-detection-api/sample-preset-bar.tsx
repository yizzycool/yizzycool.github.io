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
    <div className="flex flex-wrap items-center justify-center gap-2 pb-4">
      <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
        <Sparkles size={13} className="text-sky-500" />
        <span>Or try a sample:</span>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-1.5">
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
