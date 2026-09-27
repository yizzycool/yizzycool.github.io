import type {
  CmykColor,
  ColorSpaceValues,
  HslColor,
  HsvColor,
  LabColor,
  NormalizedRgba,
  OklchColor,
} from '../types';

import { clamp } from './color-parser';

/** Convert byte to 2-digit uppercase hex */
function toHexByte(n: number): string {
  return clamp(Math.round(n), 0, 255)
    .toString(16)
    .padStart(2, '0')
    .toUpperCase();
}

/** Convert NormalizedRgba to HEX (#RRGGBB) */
export function rgbaToHex(rgba: NormalizedRgba): string {
  return `#${toHexByte(rgba.r)}${toHexByte(rgba.g)}${toHexByte(rgba.b)}`;
}

/** Convert NormalizedRgba to HEX8 (#RRGGBBAA) */
export function rgbaToHex8(rgba: NormalizedRgba): string {
  const alphaByte = toHexByte(rgba.a * 255);
  return `#${toHexByte(rgba.r)}${toHexByte(rgba.g)}${toHexByte(rgba.b)}${alphaByte}`;
}

/** Convert NormalizedRgba to RGB string */
export function rgbaToRgbString(rgba: NormalizedRgba): string {
  return `rgb(${rgba.r}, ${rgba.g}, ${rgba.b})`;
}

/** Convert NormalizedRgba to RGBA string */
export function rgbaToRgbaString(rgba: NormalizedRgba): string {
  const alphaDisplay = Number(rgba.a.toFixed(2));
  return `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${alphaDisplay})`;
}

/** Convert NormalizedRgba to HSL object */
export function rgbaToHsl(rgba: NormalizedRgba): HslColor {
  const r = rgba.r / 255;
  const g = rgba.g / 255;
  const b = rgba.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (delta !== 0) {
    s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);

    switch (max) {
      case r:
        h = (g - b) / delta + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / delta + 2;
        break;
      case b:
        h = (r - g) / delta + 4;
        break;
      default:
        break;
    }
    h *= 60;
  }

  return {
    h: Math.round(h),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
    a: rgba.a,
  };
}

/** Convert NormalizedRgba to HSL string */
export function rgbaToHslString(rgba: NormalizedRgba): string {
  const hsl = rgbaToHsl(rgba);
  return `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
}

/** Convert NormalizedRgba to HSLA string */
export function rgbaToHslaString(rgba: NormalizedRgba): string {
  const hsl = rgbaToHsl(rgba);
  const alphaDisplay = Number(rgba.a.toFixed(2));
  return `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, ${alphaDisplay})`;
}

/** Convert NormalizedRgba to HSV object */
export function rgbaToHsv(rgba: NormalizedRgba): HsvColor {
  const r = rgba.r / 255;
  const g = rgba.g / 255;
  const b = rgba.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let h = 0;
  const s = max === 0 ? 0 : delta / max;
  const v = max;

  if (delta !== 0) {
    switch (max) {
      case r:
        h = (g - b) / delta + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / delta + 2;
        break;
      case b:
        h = (r - g) / delta + 4;
        break;
      default:
        break;
    }
    h *= 60;
  }

  return {
    h: Math.round(h),
    s: Math.round(s * 100),
    v: Math.round(v * 100),
    a: rgba.a,
  };
}

/** Convert NormalizedRgba to HSV string */
export function rgbaToHsvString(rgba: NormalizedRgba): string {
  const hsv = rgbaToHsv(rgba);
  return `hsv(${hsv.h}, ${hsv.s}%, ${hsv.v}%)`;
}

/** Convert NormalizedRgba to CMYK object */
export function rgbaToCmyk(rgba: NormalizedRgba): CmykColor {
  const r = rgba.r / 255;
  const g = rgba.g / 255;
  const b = rgba.b / 255;

  const k = 1 - Math.max(r, g, b);
  if (k === 1) {
    return { c: 0, m: 0, y: 0, k: 100 };
  }

  const c = (1 - r - k) / (1 - k);
  const m = (1 - g - k) / (1 - k);
  const y = (1 - b - k) / (1 - k);

  return {
    c: Math.round(c * 100),
    m: Math.round(m * 100),
    y: Math.round(y * 100),
    k: Math.round(k * 100),
  };
}

/** Convert NormalizedRgba to CMYK string */
export function rgbaToCmykString(rgba: NormalizedRgba): string {
  const cmyk = rgbaToCmyk(rgba);
  return `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`;
}

/** Convert linear sRGB channel from gamma sRGB (0..1) */
function sRgbToLinear(c: number): number {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

/** Convert NormalizedRgba to OKLCH object (CSS Color 4) */
export function rgbaToOklch(rgba: NormalizedRgba): OklchColor {
  const rLin = sRgbToLinear(rgba.r / 255);
  const gLin = sRgbToLinear(rgba.g / 255);
  const bLin = sRgbToLinear(rgba.b / 255);

  // Linear sRGB to LMS
  const l = 0.4122214708 * rLin + 0.5363325363 * gLin + 0.0514459929 * bLin;
  const m = 0.2119034982 * rLin + 0.6806995451 * gLin + 0.1073969566 * bLin;
  const s = 0.0883024619 * rLin + 0.2817188376 * gLin + 0.6299787005 * bLin;

  const lPrime = Math.cbrt(l);
  const mPrime = Math.cbrt(m);
  const sPrime = Math.cbrt(s);

  // LMS to Oklab
  const labL =
    0.2104542553 * lPrime + 0.793617785 * mPrime - 0.0040720468 * sPrime;
  const labA =
    1.9779984951 * lPrime - 2.428592205 * mPrime + 0.4505937099 * sPrime;
  const labB =
    0.0259040371 * lPrime + 0.7827717662 * mPrime - 0.808675766 * sPrime;

  // Oklab to OKLCH
  const chroma = Math.sqrt(labA * labA + labB * labB);
  let hue = (Math.atan2(labB, labA) * 180) / Math.PI;
  if (hue < 0) hue += 360;

  return {
    l: Number(labL.toFixed(3)),
    c: Number(chroma.toFixed(3)),
    h: Number(hue.toFixed(1)),
    a: rgba.a,
  };
}

/** Convert NormalizedRgba to OKLCH string */
export function rgbaToOklchString(rgba: NormalizedRgba): string {
  const oklch = rgbaToOklch(rgba);
  if (rgba.a < 1) {
    return `oklch(${oklch.l} ${oklch.c} ${oklch.h} / ${Number(rgba.a.toFixed(2))})`;
  }
  return `oklch(${oklch.l} ${oklch.c} ${oklch.h})`;
}

/** Convert NormalizedRgba to CIE LAB object */
export function rgbaToLab(rgba: NormalizedRgba): LabColor {
  const rLin = sRgbToLinear(rgba.r / 255);
  const gLin = sRgbToLinear(rgba.g / 255);
  const bLin = sRgbToLinear(rgba.b / 255);

  // sRGB to CIE XYZ (D65)
  const x = (rLin * 0.4124 + gLin * 0.3576 + bLin * 0.1805) / 0.95047;
  const y = (rLin * 0.2126 + gLin * 0.7152 + bLin * 0.0722) / 1.0;
  const z = (rLin * 0.0193 + gLin * 0.1192 + bLin * 0.9505) / 1.08883;

  const f = (t: number) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);

  const fx = f(x);
  const fy = f(y);
  const fz = f(z);

  const l = 116 * fy - 16;
  const a = 500 * (fx - fy);
  const b = 200 * (fy - fz);

  return {
    l: Number(l.toFixed(1)),
    a: Number(a.toFixed(1)),
    b: Number(b.toFixed(1)),
  };
}

/** Convert NormalizedRgba to CIE LAB string */
export function rgbaToLabString(rgba: NormalizedRgba): string {
  const lab = rgbaToLab(rgba);
  return `lab(${lab.l}% ${lab.a} ${lab.b})`;
}

/** Get all color space representations in a single object */
export function getAllColorSpaces(rgba: NormalizedRgba): ColorSpaceValues {
  return {
    hex: rgbaToHex(rgba),
    hex8: rgbaToHex8(rgba),
    rgb: rgbaToRgbString(rgba),
    rgba: rgbaToRgbaString(rgba),
    hsl: rgbaToHslString(rgba),
    hsla: rgbaToHslaString(rgba),
    hsv: rgbaToHsvString(rgba),
    cmyk: rgbaToCmykString(rgba),
    oklch: rgbaToOklchString(rgba),
    lab: rgbaToLabString(rgba),
  };
}
