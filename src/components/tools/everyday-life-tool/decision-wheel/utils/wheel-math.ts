import type { WeightedSlice, WheelEntry } from '../types';

import {
  MAX_LABEL_LENGTH,
  MAX_PERCENT,
  MIN_PERCENT,
  WHEEL_PALETTE,
} from '../constants';

const TWO_PI = Math.PI * 2;

/**
 * Generates an unbiased random floating-point number in [0, 1) using Web Crypto RNG.
 */
export function getSecureRandomUnit(): number {
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.getRandomValues === 'function'
  ) {
    const buffer = new Uint32Array(1);
    crypto.getRandomValues(buffer);
    return buffer[0] / 0x100000000;
  }
  return Math.random();
}

/**
 * Sanitizes and trims an entry label to prevent oversized labels on the wheel canvas.
 */
export function normalizeEntryLabel(label: string): string {
  return label.trim().slice(0, MAX_LABEL_LENGTH);
}

/**
 * Rounds a number cleanly to at most one decimal place.
 */
export function roundToOneDecimal(value: number): number {
  return Math.round(value * 10) / 10;
}

/**
 * Clamps a percentage share to [MIN_PERCENT, MAX_PERCENT] with one decimal place precision.
 */
export function clampPercent(value: number): number {
  if (!Number.isFinite(value)) return MIN_PERCENT;
  return Math.min(MAX_PERCENT, Math.max(MIN_PERCENT, roundToOneDecimal(value)));
}

/**
 * Distributes 100.0% evenly across `count` items using tenth-percent rounding so the sum equals 100.0.
 */
export function distributeEqualPercentages(count: number): number[] {
  if (count <= 0) return [];
  const totalTenths = 1000;
  const baseTenths = Math.floor(totalTenths / count);
  const remainder = totalTenths % count;
  return Array.from(
    { length: count },
    (_, idx) => (baseTenths + (idx < remainder ? 1 : 0)) / 10
  );
}

/**
 * Returns true if active entries all share roughly equal percentages (within 0.2%).
 */
export function areActiveWeightsEqual(entries: WheelEntry[]): boolean {
  const active = entries.filter((item) => !item.eliminated);
  if (active.length <= 1) return true;
  const avg =
    active.reduce((sum, item) => sum + clampPercent(item.weight), 0) /
    active.length;
  return active.every(
    (item) => Math.abs(clampPercent(item.weight) - avg) <= 0.2
  );
}

/**
 * Scales active entries proportionally so their weights sum to exactly 100.0%.
 */
export function normalizeEntriesTo100(entries: WheelEntry[]): WheelEntry[] {
  const active = entries.filter((item) => !item.eliminated);
  if (active.length === 0) return entries;

  const currentTotal = active.reduce(
    (sum, item) => sum + clampPercent(item.weight),
    0
  );

  if (currentTotal <= 0) {
    const equal = distributeEqualPercentages(active.length);
    let idx = 0;
    return entries.map((item) =>
      item.eliminated ? item : { ...item, weight: equal[idx++] }
    );
  }

  // Proportional tenth allocation using largest-remainder method for exact 100.0 sum
  const exactTenths = active.map(
    (item) => (clampPercent(item.weight) / currentTotal) * 1000
  );
  const flooredTenths = exactTenths.map((v) => Math.floor(v));
  const missing = 1000 - flooredTenths.reduce((a, b) => a + b, 0);

  const remainders = exactTenths
    .map((val, idx) => ({ idx, rem: val - flooredTenths[idx] }))
    .sort((a, b) => b.rem - a.rem);

  for (let i = 0; i < missing && i < remainders.length; i++) {
    flooredTenths[remainders[i].idx] += 1;
  }

  let activeIdx = 0;
  return entries.map((item) => {
    if (item.eliminated) return item;
    const nextWeight = flooredTenths[activeIdx++] / 10;
    return { ...item, weight: nextWeight };
  });
}

/**
 * Creates a new WheelEntry with a unique ID and deterministic palette color.
 */
export function createEntry(
  label: string,
  colorIndex: number,
  weight = 25,
  paletteColors: readonly string[] = WHEEL_PALETTE
): WheelEntry {
  const uniqueSuffix = `${Date.now().toString(36)}-${Math.floor(getSecureRandomUnit() * 1e6).toString(36)}`;
  return {
    id: `entry-${uniqueSuffix}`,
    label: normalizeEntryLabel(label) || 'Untitled Option',
    weight: clampPercent(weight),
    color: paletteColors[Math.abs(colorIndex) % paletteColors.length],
    eliminated: false,
  };
}

/**
 * Builds proportional radial slices in [0, 2π) from active entries whose percentage weight > 0.
 */
export function buildWeightedSlices(entries: WheelEntry[]): WeightedSlice[] {
  const active = entries.filter(
    (entry) => !entry.eliminated && clampPercent(entry.weight) > 0
  );
  if (active.length === 0) return [];

  const totalWeight = active.reduce(
    (sum, entry) => sum + clampPercent(entry.weight),
    0
  );
  if (totalWeight <= 0) return [];

  let cursor = 0;
  return active.map((entry, idx) => {
    const safeWeight = clampPercent(entry.weight);
    const probability = safeWeight / totalWeight;
    const sweep = probability * TWO_PI;
    const startAngle = cursor;
    const endAngle = idx === active.length - 1 ? TWO_PI : cursor + sweep;
    const midAngle = (startAngle + endAngle) / 2;
    cursor = endAngle;

    return {
      entry,
      startAngle,
      endAngle,
      midAngle,
      probability,
    };
  });
}

/**
 * Resolves which slice sits beneath the fixed 12 o'clock pointer (-π/2 rad)
 * given the wheel's clockwise rotation angle in radians.
 */
export function getSliceAtPointer(
  rotationRad: number,
  slices: WeightedSlice[]
): WeightedSlice | null {
  if (slices.length === 0) return null;

  const rawAngle = -Math.PI / 2 - rotationRad;
  const normalized = ((rawAngle % TWO_PI) + TWO_PI) % TWO_PI;

  for (const slice of slices) {
    if (normalized >= slice.startAngle && normalized < slice.endAngle) {
      return slice;
    }
  }
  return slices[slices.length - 1];
}

/**
 * Computes accessible foreground ink color (#ffffff or #0f172a) for a hex slice background.
 */
export function getContrastingTextColor(hexColor: string): string {
  const hex = hexColor.replace('#', '');
  if (!/^[0-9a-fA-F]{6}$/.test(hex)) return '#ffffff';

  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;

  const linearize = (channel: number) =>
    channel <= 0.03928
      ? channel / 12.92
      : Math.pow((channel + 0.055) / 1.055, 2.4);

  const luminance =
    0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);

  return luminance > 0.42 ? '#0f172a' : '#ffffff';
}

/**
 * Parses multiline text into normalized non-empty option labels.
 */
export function parseBulkLines(rawText: string, maxItems: number): string[] {
  return rawText
    .split(/\r?\n/)
    .map((line) => normalizeEntryLabel(line))
    .filter((line) => line.length > 0)
    .slice(0, maxItems);
}
