let sharedAudioContext: AudioContext | null = null;

function getOrCreateAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;

  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!AudioCtx) return null;

  if (!sharedAudioContext) {
    sharedAudioContext = new AudioCtx();
  }
  if (sharedAudioContext.state === 'suspended') {
    sharedAudioContext.resume().catch(() => {});
  }
  return sharedAudioContext;
}

/**
 * Plays a crisp, low-latency peg tick using Web Audio API whenever a slice border crosses the pointer.
 */
export function playWheelTick(velocityRatio = 0.6): void {
  const ctx = getOrCreateAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  const clampedVel = Math.max(0.15, Math.min(1, velocityRatio));
  const pitch = 720 + clampedVel * 420;

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(pitch, now);
  osc.frequency.exponentialRampToValueAtTime(220, now + 0.028);

  gain.gain.setValueAtTime(0.08 * clampedVel + 0.02, now);
  gain.gain.exponentialRampToValueAtTime(0.0008, now + 0.032);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.035);
}

/**
 * Plays an ascending C major triad win chime (C5 -> E5 -> G5) synthesized locally with Web Audio API.
 */
export function playWinChime(): void {
  const ctx = getOrCreateAudioContext();
  if (!ctx) return;

  const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
  const baseTime = ctx.currentTime;

  notes.forEach((freq, index) => {
    const startAt = baseTime + index * 0.085;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startAt);

    gain.gain.setValueAtTime(0.001, startAt);
    gain.gain.linearRampToValueAtTime(0.12, startAt + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0008, startAt + 0.42);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startAt);
    osc.stop(startAt + 0.45);
  });
}
