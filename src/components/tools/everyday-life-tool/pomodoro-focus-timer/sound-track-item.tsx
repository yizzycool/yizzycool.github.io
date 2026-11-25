'use client';

import type { LucideIcon } from 'lucide-react';
import type { SoundTrackId, SoundTrackMeta } from './types';

import { Brain, CloudRain, Flame, Radio, Waves } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/utils/cn';

const TRACK_ICONS: Record<SoundTrackId, LucideIcon> = {
  brown: Flame,
  pink: Radio,
  rain: CloudRain,
  waves: Waves,
  binaural: Brain,
};

type Props = {
  track: SoundTrackMeta;
  volume: number;
  isMuted: boolean;
  onToggle: (id: SoundTrackId) => void;
  onVolumeChange: (id: SoundTrackId, value: number) => void;
};

/**
 * Individual procedural Web Audio ambient sound channel with mute toggle and volume slider.
 */
export default function SoundTrackItem({
  track,
  volume,
  isMuted,
  onToggle,
  onVolumeChange,
}: Props) {
  const Icon = TRACK_ICONS[track.id];
  const isActive = volume > 0 && !isMuted;

  return (
    <div
      className={cn(
        'flex flex-col justify-between gap-3 rounded-xl border p-3.5 transition-all',
        isActive
          ? 'border-sky-300/80 bg-white/85 shadow-sm dark:border-sky-500/40 dark:bg-neutral-900/75'
          : 'border-neutral-200/80 bg-white/55 dark:border-neutral-800/80 dark:bg-neutral-900/40'
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <Button
            variant={isActive ? 'secondary' : 'ghost'}
            size="xs"
            rounded="lg"
            bordered
            icon={Icon}
            onClick={() => onToggle(track.id)}
            ariaLabel={`Toggle ${track.label}`}
            className={cn(
              'h-8 w-8 shrink-0 justify-center p-0',
              isActive ? track.accentClass : 'text-neutral-400'
            )}
          />
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-neutral-800 dark:text-neutral-100">
              {track.label}
            </p>
            <p className="truncate text-[10px] text-neutral-500 dark:text-neutral-400">
              {track.subtitle}
            </p>
          </div>
        </div>

        <span className="shrink-0 font-mono text-[11px] font-medium tabular-nums text-neutral-500 dark:text-neutral-400">
          {volume}%
        </span>
      </div>

      <Slider
        min={0}
        max={100}
        step={1}
        value={volume}
        onChange={(e) => onVolumeChange(track.id, Number(e.target.value))}
        ariaLabel={`${track.label} volume`}
      />
    </div>
  );
}
