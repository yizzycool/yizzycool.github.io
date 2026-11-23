'use client';

import type { StageBackdrop, StampSettings } from './types';

import { useEffect, useRef } from 'react';
import { RotateCcw, Stamp } from 'lucide-react';

import LabelBar from '@/components/tools/common/label-bar';
import { Button } from '@/components/ui/button';
import { PillTabs } from '@/components/ui/tabs';
import { cn } from '@/utils/cn';

import {
  DEFAULT_STAMP_SETTINGS,
  STAGE_BACKDROPS,
  STAGE_BACKDROP_LABELS,
} from './constants';
import { renderStampToCanvas } from './utils/stamp-renderer';

interface Props {
  settings: StampSettings;
  onUpdateSettings: (patch: Partial<StampSettings>) => void;
  onReset: () => void;
}

const BACKDROP_STYLES: Record<StageBackdrop, string> = {
  paper: 'bg-white text-slate-900',
  checkerboard:
    'bg-[repeating-conic-gradient(#e2e8f0_0%_25%,#ffffff_0%_50%)] bg-[length:16px_16px] dark:bg-[repeating-conic-gradient(#262626_0%_25%,#171717_0%_50%)]',
  dark: 'bg-neutral-950 text-white',
};

export default function StampCanvas({
  settings,
  onUpdateSettings,
  onReset,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr =
      typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    renderStampToCanvas(canvas, settings, Math.max(2, dpr));
  }, [settings]);

  const isDefault =
    settings.text === DEFAULT_STAMP_SETTINGS.text &&
    settings.subtitle === DEFAULT_STAMP_SETTINGS.subtitle &&
    settings.shape === DEFAULT_STAMP_SETTINGS.shape &&
    settings.color === DEFAULT_STAMP_SETTINGS.color &&
    settings.distress === DEFAULT_STAMP_SETTINGS.distress;

  return (
    <div className="flex flex-col">
      <LabelBar
        label={<span className="whitespace-nowrap">Stamp Stage</span>}
        icon={Stamp}
        headerClassName="min-h-8 flex-wrap gap-2"
      >
        <div className="flex flex-wrap items-center gap-2">
          <PillTabs<StageBackdrop>
            tabs={STAGE_BACKDROPS}
            activeTab={settings.backdrop}
            onChange={(backdrop) => onUpdateSettings({ backdrop })}
            tabLabels={STAGE_BACKDROP_LABELS}
            variant="segment"
            size="xs"
            rounded="md"
            className="p-0.5"
            tabClassName="px-2 py-0.5"
          />

          <Button
            variant="outline"
            size="xs"
            rounded="lg"
            icon={RotateCcw}
            disabled={isDefault}
            onClick={onReset}
          >
            Reset Preset
          </Button>
        </div>
      </LabelBar>

      {/* Centered Stamp Stage */}
      <div
        className={cn(
          'shadow-2xs relative flex min-h-[320px] w-full items-center justify-center overflow-hidden rounded-2xl border p-8 transition-colors sm:min-h-[360px] lg:min-h-[400px]',
          'border-neutral-200/90 dark:border-neutral-800',
          BACKDROP_STYLES[settings.backdrop]
        )}
      >
        <canvas
          ref={canvasRef}
          className="drop-shadow-xs max-h-[300px] max-w-full object-contain"
        />

        <span className="pointer-events-none absolute bottom-3 left-4 rounded-md bg-white/80 px-2 py-0.5 font-mono text-[10px] text-slate-500 backdrop-blur-sm dark:bg-neutral-900/80 dark:text-slate-400">
          Transparent background on export
        </span>
      </div>
    </div>
  );
}
