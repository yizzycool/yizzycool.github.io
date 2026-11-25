import type { SoundTrackId, SoundTrackVolumes } from '../types';

const NOISE_BUFFER_SECONDS = 4;

type TrackNodes = {
  gain: GainNode;
  stop: () => void;
};

/**
 * Pure Web Audio API ambient soundscape & chime synthesizer (zero external audio assets).
 */
export class SoundscapeEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private tracks: Partial<Record<SoundTrackId, TrackNodes>> = {};
  private currentVolumes: SoundTrackVolumes = {
    brown: 0,
    pink: 0,
    rain: 0,
    waves: 0,
    binaural: 0,
  };
  private masterVolume = 0.8;
  private muted = false;

  private ensureContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.muted ? 0 : this.masterVolume;
      this.masterGain.connect(this.ctx.destination);
    }

    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }

    return this.ctx;
  }

  private createWhiteNoiseBuffer(ctx: AudioContext): AudioBuffer {
    const length = ctx.sampleRate * NOISE_BUFFER_SECONDS;
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i += 1) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  private createPinkNoiseBuffer(ctx: AudioContext): AudioBuffer {
    const length = ctx.sampleRate * NOISE_BUFFER_SECONDS;
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0;
    let b1 = 0;
    let b2 = 0;
    let b3 = 0;
    let b4 = 0;
    let b5 = 0;
    let b6 = 0;
    for (let i = 0; i < length; i += 1) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.969 * b2 + white * 0.153852;
      b3 = 0.8665 * b3 + white * 0.3104856;
      b4 = 0.55 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.016898;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }
    return buffer;
  }

  private createBrownNoiseBuffer(ctx: AudioContext): AudioBuffer {
    const length = ctx.sampleRate * NOISE_BUFFER_SECONDS;
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0;
    for (let i = 0; i < length; i += 1) {
      const white = Math.random() * 2 - 1;
      lastOut = (lastOut + 0.02 * white) / 1.02;
      data[i] = Math.max(-1, Math.min(1, lastOut * 3.5));
    }
    return buffer;
  }

  private ensureTrack(id: SoundTrackId): TrackNodes {
    const existing = this.tracks[id];
    if (existing) return existing;

    const ctx = this.ensureContext();
    const master = this.masterGain!;
    const trackGain = ctx.createGain();
    trackGain.gain.value = 0;
    trackGain.connect(master);

    if (id === 'binaural') {
      const oscLeft = ctx.createOscillator();
      const oscRight = ctx.createOscillator();
      const panLeft = ctx.createStereoPanner();
      const panRight = ctx.createStereoPanner();
      const subGain = ctx.createGain();

      oscLeft.type = 'sine';
      oscRight.type = 'sine';
      oscLeft.frequency.value = 200;
      oscRight.frequency.value = 210; // 10 Hz Alpha focus beat
      panLeft.pan.value = -0.9;
      panRight.pan.value = 0.9;
      subGain.gain.value = 0.14;

      oscLeft.connect(panLeft).connect(subGain);
      oscRight.connect(panRight).connect(subGain);
      subGain.connect(trackGain);

      oscLeft.start();
      oscRight.start();

      const node: TrackNodes = {
        gain: trackGain,
        stop: () => {
          try {
            oscLeft.stop();
            oscRight.stop();
            oscLeft.disconnect();
            oscRight.disconnect();
          } catch {
            // Ignore already-stopped nodes
          }
        },
      };
      this.tracks[id] = node;
      return node;
    }

    const source = ctx.createBufferSource();
    source.loop = true;

    if (id === 'brown') {
      source.buffer = this.createBrownNoiseBuffer(ctx);
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 340;
      source.connect(filter).connect(trackGain);
      source.start();

      const node: TrackNodes = {
        gain: trackGain,
        stop: () => {
          try {
            source.stop();
            source.disconnect();
          } catch {
            // Ignore stop errors
          }
        },
      };
      this.tracks[id] = node;
      return node;
    }

    if (id === 'pink') {
      source.buffer = this.createPinkNoiseBuffer(ctx);
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 1800;
      const trim = ctx.createGain();
      trim.gain.value = 0.7;
      source.connect(filter).connect(trim).connect(trackGain);
      source.start();

      const node: TrackNodes = {
        gain: trackGain,
        stop: () => {
          try {
            source.stop();
            source.disconnect();
          } catch {
            // Ignore stop errors
          }
        },
      };
      this.tracks[id] = node;
      return node;
    }

    if (id === 'rain') {
      source.buffer = this.createWhiteNoiseBuffer(ctx);
      const bandpass = ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.value = 1200;
      bandpass.Q.value = 0.65;

      const rainLfo = ctx.createOscillator();
      const lfoDepth = ctx.createGain();
      const modulatedGain = ctx.createGain();
      rainLfo.frequency.value = 0.16;
      lfoDepth.gain.value = 0.08;
      modulatedGain.gain.value = 0.48;

      rainLfo.connect(lfoDepth).connect(modulatedGain.gain);
      source.connect(bandpass).connect(modulatedGain).connect(trackGain);

      source.start();
      rainLfo.start();

      const node: TrackNodes = {
        gain: trackGain,
        stop: () => {
          try {
            source.stop();
            rainLfo.stop();
            source.disconnect();
          } catch {
            // Ignore stop errors
          }
        },
      };
      this.tracks[id] = node;
      return node;
    }

    // Ocean Waves: lowpass filtered pink noise with slow rolling LFO swell
    source.buffer = this.createPinkNoiseBuffer(ctx);
    const waveFilter = ctx.createBiquadFilter();
    waveFilter.type = 'lowpass';
    waveFilter.frequency.value = 460;

    const swellGain = ctx.createGain();
    swellGain.gain.value = 0.55;
    const waveLfo = ctx.createOscillator();
    const waveLfoDepth = ctx.createGain();
    waveLfo.frequency.value = 0.11;
    waveLfoDepth.gain.value = 0.35;

    waveLfo.connect(waveLfoDepth).connect(swellGain.gain);
    source.connect(waveFilter).connect(swellGain).connect(trackGain);

    source.start();
    waveLfo.start();

    const node: TrackNodes = {
      gain: trackGain,
      stop: () => {
        try {
          source.stop();
          waveLfo.stop();
          source.disconnect();
        } catch {
          // Ignore stop errors
        }
      },
    };
    this.tracks[id] = node;
    return node;
  }

  private syncSuspendState(): void {
    if (!this.ctx) return;
    const hasActiveSound =
      !this.muted &&
      Object.values(this.currentVolumes).some((volume) => volume > 0);
    if (!hasActiveSound && this.ctx.state === 'running') {
      void this.ctx.suspend();
    } else if (hasActiveSound && this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
  }

  setTrackVolume(id: SoundTrackId, volumePercent: number): void {
    const clamped = Math.max(0, Math.min(100, volumePercent));
    this.currentVolumes[id] = clamped;

    if (clamped === 0 && !this.tracks[id]) {
      return;
    }

    const ctx = this.ensureContext();
    const track = this.ensureTrack(id);
    track.gain.gain.setTargetAtTime(clamped / 100, ctx.currentTime, 0.08);
    this.syncSuspendState();
  }

  setAllVolumes(volumes: SoundTrackVolumes): void {
    (Object.keys(volumes) as SoundTrackId[]).forEach((id) => {
      this.setTrackVolume(id, volumes[id]);
    });
  }

  setMasterVolume(volumePercent: number): void {
    const clamped = Math.max(0, Math.min(100, volumePercent)) / 100;
    this.masterVolume = clamped;
    if (!this.ctx || !this.masterGain) return;
    this.masterGain.gain.setTargetAtTime(
      this.muted ? 0 : clamped,
      this.ctx.currentTime,
      0.06
    );
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    if (!this.ctx || !this.masterGain) return;
    this.masterGain.gain.setTargetAtTime(
      muted ? 0 : this.masterVolume,
      this.ctx.currentTime,
      0.06
    );
    this.syncSuspendState();
  }

  playCompletionChime(): void {
    const ctx = this.ensureContext();
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99]; // Gentle C5 - E5 - G5 chime

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const start = now + idx * 0.14;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.16, start + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 1.1);

      osc.connect(gain).connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 1.15);
    });
  }

  dispose(): void {
    Object.values(this.tracks).forEach((track) => track?.stop());
    this.tracks = {};
    if (this.ctx) {
      void this.ctx.close();
      this.ctx = null;
      this.masterGain = null;
    }
  }
}
