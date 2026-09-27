'use client';

import type { GeneratorMode } from './types';

import { Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { PillTabs } from '@/components/ui/tabs';

import { GENERATOR_MODES, GENERATOR_MODE_LABELS } from './constants';

type GeneratorControlsBarProps = {
  mode: GeneratorMode;
  onModeChange: (mode: GeneratorMode) => void;
  onGenerate: () => void;
};

export default function GeneratorControlsBar({
  mode,
  onModeChange,
  onGenerate,
}: GeneratorControlsBarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 py-1 text-xs">
      {/* Mode Selector */}
      <PillTabs
        tabs={GENERATOR_MODES}
        activeTab={mode}
        onChange={onModeChange}
        tabLabels={GENERATOR_MODE_LABELS}
        variant="segment"
        size="sm"
        rounded="lg"
        className="p-1"
        tabClassName="px-3 py-1.5 text-xs font-medium"
      />

      {/* Global Actions */}
      <div className="flex items-center gap-2">
        <Button
          variant="primary"
          size="sm"
          rounded="lg"
          icon={Sparkles}
          onClick={onGenerate}
          title="Generate new identifiers (Cmd+Enter)"
        >
          Generate New
        </Button>
      </div>
    </div>
  );
}
