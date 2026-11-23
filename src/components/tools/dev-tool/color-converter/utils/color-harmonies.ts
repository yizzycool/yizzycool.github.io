import type { ColorHarmonySwatch, NormalizedRgba } from '../types';

import { rgbaToHex, rgbaToHsl } from './color-converter';
import { hslToRgb } from './color-parser';

export interface TintShadeStep {
  name: string;
  hex: string;
  factor: number;
}

export interface ColorScaleStep {
  step: number;
  hex: string;
  isBase: boolean;
}

const TAILWIND_SCALE_STOPS: ReadonlyArray<{
  step: number;
  lightness: number;
  satMultiplier: number;
}> = [
  { step: 50, lightness: 97, satMultiplier: 0.85 },
  { step: 100, lightness: 93, satMultiplier: 0.9 },
  { step: 200, lightness: 86, satMultiplier: 0.95 },
  { step: 300, lightness: 76, satMultiplier: 0.98 },
  { step: 400, lightness: 64, satMultiplier: 1 },
  { step: 500, lightness: 52, satMultiplier: 1 },
  { step: 600, lightness: 43, satMultiplier: 1 },
  { step: 700, lightness: 35, satMultiplier: 0.96 },
  { step: 800, lightness: 27, satMultiplier: 0.9 },
  { step: 900, lightness: 20, satMultiplier: 0.85 },
  { step: 950, lightness: 12, satMultiplier: 0.8 },
];

/** Mix color with white to generate tints */
export function getTints(rgba: NormalizedRgba, steps = 5): TintShadeStep[] {
  const result: TintShadeStep[] = [];
  for (let i = steps; i >= 1; i--) {
    const factor = i / (steps + 1);
    const r = Math.round(rgba.r + (255 - rgba.r) * factor);
    const g = Math.round(rgba.g + (255 - rgba.g) * factor);
    const b = Math.round(rgba.b + (255 - rgba.b) * factor);
    const hex = rgbaToHex({ r, g, b, a: 1 });
    result.push({
      name: `+${Math.round(factor * 100)}% Tint`,
      hex,
      factor,
    });
  }
  return result;
}

/** Mix color with black to generate shades */
export function getShades(rgba: NormalizedRgba, steps = 5): TintShadeStep[] {
  const result: TintShadeStep[] = [];
  for (let i = 1; i <= steps; i++) {
    const factor = i / (steps + 1);
    const r = Math.round(rgba.r * (1 - factor));
    const g = Math.round(rgba.g * (1 - factor));
    const b = Math.round(rgba.b * (1 - factor));
    const hex = rgbaToHex({ r, g, b, a: 1 });
    result.push({
      name: `-${Math.round(factor * 100)}% Shade`,
      hex,
      factor,
    });
  }
  return result;
}

/** Generate an 11-step Tailwind-style 50–950 scale anchored to the active color */
export function getTailwindColorScale(rgba: NormalizedRgba): ColorScaleStep[] {
  const hsl = rgbaToHsl(rgba);
  const baseHex = rgbaToHex(rgba);

  let closestIndex = 0;
  let closestDiff = Infinity;
  TAILWIND_SCALE_STOPS.forEach((stop, index) => {
    const diff = Math.abs(stop.lightness - hsl.l);
    if (diff < closestDiff) {
      closestDiff = diff;
      closestIndex = index;
    }
  });

  return TAILWIND_SCALE_STOPS.map((stop, index) => {
    if (index === closestIndex) {
      return {
        step: stop.step,
        hex: baseHex,
        isBase: true,
      };
    }

    const adjustedSaturation =
      hsl.s === 0 ? 0 : Math.min(100, Math.round(hsl.s * stop.satMultiplier));

    return {
      step: stop.step,
      hex: rgbaToHex(hslToRgb(hsl.h, adjustedSaturation, stop.lightness)),
      isBase: false,
    };
  });
}

/** Formats an 11-step scale as CSS Custom Properties */
export function formatCssVariablesSnippet(scale: ColorScaleStep[]): string {
  const declarations = scale.map(
    (item) => `  --color-${item.step}: ${item.hex};`
  );
  return `:root {\n${declarations.join('\n')}\n}`;
}

/** Formats an 11-step scale as a Tailwind theme color object */
export function formatTailwindScaleSnippet(scale: ColorScaleStep[]): string {
  const entries = scale.map((item) => `  ${item.step}: '${item.hex}',`);
  return `{\n${entries.join('\n')}\n}`;
}

/** Generate color harmony palettes (Complementary, Analogous, Triadic) */
export function getColorHarmonies(rgba: NormalizedRgba): ColorHarmonySwatch[] {
  const hsl = rgbaToHsl(rgba);

  // 1. Complementary (H + 180)
  const compH = (hsl.h + 180) % 360;
  const compHex = rgbaToHex(hslToRgb(compH, hsl.s, hsl.l));

  // 2. Analogous (H - 30, H + 30)
  const ana1H = (hsl.h - 30 + 360) % 360;
  const ana2H = (hsl.h + 30) % 360;
  const ana1Hex = rgbaToHex(hslToRgb(ana1H, hsl.s, hsl.l));
  const ana2Hex = rgbaToHex(hslToRgb(ana2H, hsl.s, hsl.l));

  // 3. Triadic (H + 120, H + 240)
  const tri1H = (hsl.h + 120) % 360;
  const tri2H = (hsl.h + 240) % 360;
  const tri1Hex = rgbaToHex(hslToRgb(tri1H, hsl.s, hsl.l));
  const tri2Hex = rgbaToHex(hslToRgb(tri2H, hsl.s, hsl.l));

  return [
    {
      role: 'Base',
      name: 'Current Color',
      hex: rgbaToHex(rgba),
    },
    {
      role: 'Complementary',
      name: 'Complementary (+180°)',
      hex: compHex,
    },
    {
      role: 'Analogous',
      name: 'Analogous 1 (-30°)',
      hex: ana1Hex,
    },
    {
      role: 'Analogous',
      name: 'Analogous 2 (+30°)',
      hex: ana2Hex,
    },
    {
      role: 'Triadic',
      name: 'Triadic 1 (+120°)',
      hex: tri1Hex,
    },
    {
      role: 'Triadic',
      name: 'Triadic 2 (+240°)',
      hex: tri2Hex,
    },
  ];
}
