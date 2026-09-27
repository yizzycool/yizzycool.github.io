import type { ColorHarmonySwatch, NormalizedRgba } from '../types';

import { rgbaToHex, rgbaToHsl } from './color-converter';
import { hslToRgb } from './color-parser';

export interface TintShadeStep {
  name: string;
  hex: string;
  factor: number;
}

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
