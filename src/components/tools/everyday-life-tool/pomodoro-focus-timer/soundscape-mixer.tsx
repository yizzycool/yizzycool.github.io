'use client';

import type { SoundTrackId, SoundTrackVolumes } from './types';

import { Volume2, VolumeX, Waves } from 'lucide-react';
import { isEqual } from 'lodash';

import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { Slider } from '@/components/ui/slider';

import LabelBar from '../../common/label-bar';
import { SOUND_MIX_PRESETS, SOUND_TRACKS } from './constants';
import SoundTrackItem from './sound-track-item';

type Props = {
  volumes: SoundTrackVolumes;
  masterVolume: number;
  isMuted: boolean;
  activeTrackCount: number;
  onTrackToggle: (id: SoundTrackId) => void;
  onTrackVolumeChange: (id: SoundTrackId, value: number) => void;
  onMasterVolumeChange: (value: number) => void;
  onToggleMute: () => void;
  onApplyPreset: (volumes: SoundTrackVolumes) => void;
};

/**
 * Multi-track Web Audio ambient soundscape mixer with instant mix presets and master output gain.
 */
export default function SoundscapeMixer({
  volumes,
  masterVolume,
  isMuted,
  activeTrackCount,
  onTrackToggle,
  onTrackVolumeChange,
  onMasterVolumeChange,
  onToggleMute,
  onApplyPreset,
}: Props) {
  return (
    <section
      aria-labelledby="pomodoro-soundscape-heading"
      className="mx-auto mt-8 w-full max-w-4xl text-left"
    >
      <LabelBar
        id="pomodoro-soundscape-heading"
        label="Ambient Soundscape Mixer"
        description="Zero external audio files — synthesized in real time via Web Audio API."
        icon={Waves}
      >
        <div className="flex items-center gap-2.5">
          <Button
            variant={isMuted ? 'secondary' : 'ghost'}
            size="xs"
            rounded="full"
            bordered
            icon={isMuted ? VolumeX : Volume2}
            onClick={onToggleMute}
            ariaLabel={isMuted ? 'Unmute master audio' : 'Mute master audio'}
          >
            {isMuted ? 'Muted' : `${activeTrackCount} Active`}
          </Button>
          <div className="w-24 sm:w-28">
            <Slider
              min={0}
              max={100}
              step={1}
              value={isMuted ? 0 : masterVolume}
              onChange={(e) => onMasterVolumeChange(Number(e.target.value))}
              ariaLabel="Master soundscape volume"
            />
          </div>
        </div>
      </LabelBar>

      {/* Preset Chips */}
      <div className="mb-3 flex flex-wrap items-center gap-1.5">
        {SOUND_MIX_PRESETS.map((preset) => (
          <Chip
            key={preset.id}
            selected={isEqual(volumes, preset.volumes)}
            onClick={() => onApplyPreset(preset.volumes)}
            className="px-3 py-1 text-xs"
          >
            {preset.label}
          </Chip>
        ))}
      </div>

      {/* Sound Channels Grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {SOUND_TRACKS.map((track) => (
          <SoundTrackItem
            key={track.id}
            track={track}
            volume={volumes[track.id]}
            isMuted={isMuted}
            onToggle={onTrackToggle}
            onVolumeChange={onTrackVolumeChange}
          />
        ))}
      </div>
    </section>
  );
}
