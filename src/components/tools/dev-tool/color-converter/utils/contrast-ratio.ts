import type { ContrastResult, NormalizedRgba, WcagRating } from '../types';

/** Channel gamma conversion for sRGB */
function getLinearChannel(val: number): number {
  const c = val / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

/** Calculate WCAG relative luminance (0..1) */
export function getRelativeLuminance(rgba: NormalizedRgba): number {
  // If color has alpha, blend it over white (#ffffff)
  const a = rgba.a;
  const blendedR = rgba.r * a + 255 * (1 - a);
  const blendedG = rgba.g * a + 255 * (1 - a);
  const blendedB = rgba.b * a + 255 * (1 - a);

  const rLin = getLinearChannel(blendedR);
  const gLin = getLinearChannel(blendedG);
  const bLin = getLinearChannel(blendedB);

  return 0.2126 * rLin + 0.7152 * gLin + 0.0722 * bLin;
}

/** Calculate WCAG 2.1 contrast ratio between two colors (1..21) */
export function calculateContrastRatio(
  foreground: NormalizedRgba,
  background: NormalizedRgba
): number {
  const l1 = getRelativeLuminance(foreground);
  const l2 = getRelativeLuminance(background);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  const ratio = (lighter + 0.05) / (darker + 0.05);
  return Number(ratio.toFixed(2));
}

/** Pure black (#000000) */
export const COLOR_BLACK: NormalizedRgba = { r: 0, g: 0, b: 0, a: 1 };

/** Pure white (#ffffff) */
export const COLOR_WHITE: NormalizedRgba = { r: 255, g: 255, b: 255, a: 1 };

/** Evaluate WCAG 2.1 ratings from contrast ratio */
export function evaluateWcagCompliance(ratio: number): {
  normalText: WcagRating;
  largeText: WcagRating;
} {
  let normalText: WcagRating = 'Fail';
  if (ratio >= 7.0) {
    normalText = 'AAA';
  } else if (ratio >= 4.5) {
    normalText = 'AA';
  }

  let largeText: WcagRating = 'Fail';
  if (ratio >= 4.5) {
    largeText = 'AAA';
  } else if (ratio >= 3.0) {
    largeText = 'AA';
  }

  return { normalText, largeText };
}

/** Get full contrast test result against black or white */
export function getContrastAgainst(
  textColor: NormalizedRgba,
  backgroundColor: NormalizedRgba
): ContrastResult {
  const ratio = calculateContrastRatio(textColor, backgroundColor);
  const { normalText, largeText } = evaluateWcagCompliance(ratio);
  return { ratio, normalText, largeText };
}
