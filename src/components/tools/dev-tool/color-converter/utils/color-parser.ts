import type { NormalizedRgba } from '../types';

/** Clamp a number between min and max */
export function clamp(val: number, min: number, max: number): number {
  return Math.min(Math.max(val, min), max);
}

/** Parses CSS angle string (e.g., "180deg", "0.5turn", "3.14rad", "200") to degrees (0..360) */
function parseAngle(val: string): number {
  const trimmed = val.trim().toLowerCase();
  if (trimmed.endsWith('turn')) {
    return parseFloat(trimmed) * 360;
  }
  if (trimmed.endsWith('rad')) {
    return (parseFloat(trimmed) * 180) / Math.PI;
  }
  if (trimmed.endsWith('deg')) {
    return parseFloat(trimmed);
  }
  return parseFloat(trimmed);
}

/** Parses percentage or raw float to 0..1 or 0..max */
function parseNumberOrPercent(val: string, max: number): number {
  const trimmed = val.trim();
  if (trimmed.endsWith('%')) {
    return (parseFloat(trimmed) / 100) * max;
  }
  return parseFloat(trimmed);
}

/** Parses alpha channel to 0..1 */
function parseAlpha(val: string | undefined): number {
  if (!val) return 1;
  const trimmed = val.trim();
  if (trimmed.endsWith('%')) {
    return clamp(parseFloat(trimmed) / 100, 0, 1);
  }
  return clamp(parseFloat(trimmed), 0, 1);
}

/** Convert HSL to RGBA */
export function hslToRgb(
  h: number,
  s: number,
  l: number,
  a = 1
): NormalizedRgba {
  // Normalize
  const normalizedH = ((h % 360) + 360) % 360;
  const normalizedS = clamp(s, 0, 100) / 100;
  const normalizedL = clamp(l, 0, 100) / 100;

  const c = (1 - Math.abs(2 * normalizedL - 1)) * normalizedS;
  const x = c * (1 - Math.abs(((normalizedH / 60) % 2) - 1));
  const m = normalizedL - c / 2;

  let rPrime = 0;
  let gPrime = 0;
  let bPrime = 0;

  if (normalizedH >= 0 && normalizedH < 60) {
    rPrime = c;
    gPrime = x;
  } else if (normalizedH >= 60 && normalizedH < 120) {
    rPrime = x;
    gPrime = c;
  } else if (normalizedH >= 120 && normalizedH < 180) {
    gPrime = c;
    bPrime = x;
  } else if (normalizedH >= 180 && normalizedH < 240) {
    gPrime = x;
    bPrime = c;
  } else if (normalizedH >= 240 && normalizedH < 300) {
    rPrime = x;
    bPrime = c;
  } else {
    rPrime = c;
    bPrime = x;
  }

  return {
    r: Math.round(clamp((rPrime + m) * 255, 0, 255)),
    g: Math.round(clamp((gPrime + m) * 255, 0, 255)),
    b: Math.round(clamp((bPrime + m) * 255, 0, 255)),
    a: clamp(a, 0, 1),
  };
}

/** Convert HSV to RGBA */
export function hsvToRgb(
  h: number,
  s: number,
  v: number,
  a = 1
): NormalizedRgba {
  const normalizedH = ((h % 360) + 360) % 360;
  const normalizedS = clamp(s, 0, 100) / 100;
  const normalizedV = clamp(v, 0, 100) / 100;

  const c = normalizedV * normalizedS;
  const x = c * (1 - Math.abs(((normalizedH / 60) % 2) - 1));
  const m = normalizedV - c;

  let rPrime = 0;
  let gPrime = 0;
  let bPrime = 0;

  if (normalizedH < 60) {
    rPrime = c;
    gPrime = x;
  } else if (normalizedH < 120) {
    rPrime = x;
    gPrime = c;
  } else if (normalizedH < 180) {
    gPrime = c;
    bPrime = x;
  } else if (normalizedH < 240) {
    gPrime = x;
    bPrime = c;
  } else if (normalizedH < 300) {
    rPrime = x;
    bPrime = c;
  } else {
    rPrime = c;
    bPrime = x;
  }

  return {
    r: Math.round(clamp((rPrime + m) * 255, 0, 255)),
    g: Math.round(clamp((gPrime + m) * 255, 0, 255)),
    b: Math.round(clamp((bPrime + m) * 255, 0, 255)),
    a: clamp(a, 0, 1),
  };
}

/** Convert CMYK to RGBA */
export function cmykToRgb(
  c: number,
  m: number,
  y: number,
  k: number,
  a = 1
): NormalizedRgba {
  const cNorm = clamp(c, 0, 100) / 100;
  const mNorm = clamp(m, 0, 100) / 100;
  const yNorm = clamp(y, 0, 100) / 100;
  const kNorm = clamp(k, 0, 100) / 100;

  const r = 255 * (1 - cNorm) * (1 - kNorm);
  const g = 255 * (1 - mNorm) * (1 - kNorm);
  const b = 255 * (1 - yNorm) * (1 - kNorm);

  return {
    r: Math.round(clamp(r, 0, 255)),
    g: Math.round(clamp(g, 0, 255)),
    b: Math.round(clamp(b, 0, 255)),
    a: clamp(a, 0, 1),
  };
}

/** Convert OKLCH to RGBA */
export function oklchToRgb(
  l: number,
  c: number,
  h: number,
  a = 1
): NormalizedRgba {
  // Convert OKLCH to Oklab
  const hRad = (h * Math.PI) / 180;
  const labL = l;
  const labA = c * Math.cos(hRad);
  const labB = c * Math.sin(hRad);

  // Oklab to linear LMS
  const lPrime = labL + 0.3963377774 * labA + 0.2158037573 * labB;
  const mPrime = labL - 0.1055613458 * labA - 0.0638541728 * labB;
  const sPrime = labL - 0.0894841775 * labA - 1.291485548 * labB;

  const lLin = lPrime * lPrime * lPrime;
  const mLin = mPrime * mPrime * mPrime;
  const sLin = sPrime * sPrime * sPrime;

  // Linear LMS to linear sRGB
  const rLin = +4.0767416621 * lLin - 3.3077115913 * mLin + 0.2309699292 * sLin;
  const gLin = -1.2684380046 * lLin + 2.6097574011 * mLin - 0.3413193965 * sLin;
  const bLin = -0.0041960863 * lLin - 0.7034186147 * mLin + 1.707614701 * sLin;

  // Linear sRGB to standard sRGB (gamma transfer)
  const gamma = (val: number) => {
    const clamped = clamp(val, 0, 1);
    return clamped <= 0.0031308
      ? 12.92 * clamped
      : 1.055 * Math.pow(clamped, 1 / 2.4) - 0.055;
  };

  return {
    r: Math.round(clamp(gamma(rLin) * 255, 0, 255)),
    g: Math.round(clamp(gamma(gLin) * 255, 0, 255)),
    b: Math.round(clamp(gamma(bLin) * 255, 0, 255)),
    a: clamp(a, 0, 1),
  };
}

/** Parses any valid color string into a NormalizedRgba object */
export function parseColorString(input: string): NormalizedRgba | null {
  if (!input) return null;
  const raw = input.trim();

  // 1. HEX formats: #rgb, #rgba, #rrggbb, #rrggbbaa (or without leading #)
  const hexMatch = raw.match(/^#?([0-9a-fA-F]{3,8})$/);
  if (hexMatch) {
    const hex = hexMatch[1];
    if (hex.length === 3) {
      return {
        r: parseInt(hex[0] + hex[0], 16),
        g: parseInt(hex[1] + hex[1], 16),
        b: parseInt(hex[2] + hex[2], 16),
        a: 1,
      };
    }
    if (hex.length === 4) {
      return {
        r: parseInt(hex[0] + hex[0], 16),
        g: parseInt(hex[1] + hex[1], 16),
        b: parseInt(hex[2] + hex[2], 16),
        a: Math.round((parseInt(hex[3] + hex[3], 16) / 255) * 100) / 100,
      };
    }
    if (hex.length === 6) {
      return {
        r: parseInt(hex.substring(0, 2), 16),
        g: parseInt(hex.substring(2, 4), 16),
        b: parseInt(hex.substring(4, 6), 16),
        a: 1,
      };
    }
    if (hex.length === 8) {
      return {
        r: parseInt(hex.substring(0, 2), 16),
        g: parseInt(hex.substring(2, 4), 16),
        b: parseInt(hex.substring(4, 6), 16),
        a: Math.round((parseInt(hex.substring(6, 8), 16) / 255) * 100) / 100,
      };
    }
  }

  // 2. RGB / RGBA: rgb(r, g, b) or rgba(r, g, b, a) or rgb(r g b / a)
  const rgbMatch = raw.match(
    /^rgba?\s*\(\s*([\d.]+%?)\s*[, ]\s*([\d.]+%?)\s*[, ]\s*([\d.]+%?)\s*(?:[,/]\s*([\d.]+%?))?\s*\)$/i
  );
  if (rgbMatch) {
    const r = clamp(Math.round(parseNumberOrPercent(rgbMatch[1], 255)), 0, 255);
    const g = clamp(Math.round(parseNumberOrPercent(rgbMatch[2], 255)), 0, 255);
    const b = clamp(Math.round(parseNumberOrPercent(rgbMatch[3], 255)), 0, 255);
    const a = parseAlpha(rgbMatch[4]);
    return { r, g, b, a };
  }

  // 3. HSL / HSLA: hsl(h, s%, l%) or hsla(h, s%, l%, a) or hsl(h s% l% / a)
  const hslMatch = raw.match(
    /^hsla?\s*\(\s*([-\d.]+(?:deg|rad|turn)?)\s*[, ]\s*([\d.]+%?)\s*[, ]\s*([\d.]+%?)\s*(?:[,/]\s*([\d.]+%?))?\s*\)$/i
  );
  if (hslMatch) {
    const h = parseAngle(hslMatch[1]);
    const s = parseNumberOrPercent(hslMatch[2], 100);
    const l = parseNumberOrPercent(hslMatch[3], 100);
    const a = parseAlpha(hslMatch[4]);
    return hslToRgb(h, s, l, a);
  }

  // 4. HSV / HSB: hsv(h, s%, v%) or hsb(h, s%, b%)
  const hsvMatch = raw.match(
    /^(?:hsv|hsb)\s*\(\s*([-\d.]+(?:deg|rad|turn)?)\s*[, ]\s*([\d.]+%?)\s*[, ]\s*([\d.]+%?)\s*(?:[,/]\s*([\d.]+%?))?\s*\)$/i
  );
  if (hsvMatch) {
    const h = parseAngle(hsvMatch[1]);
    const s = parseNumberOrPercent(hsvMatch[2], 100);
    const v = parseNumberOrPercent(hsvMatch[3], 100);
    const a = parseAlpha(hsvMatch[4]);
    return hsvToRgb(h, s, v, a);
  }

  // 5. CMYK: cmyk(c%, m%, y%, k%)
  const cmykMatch = raw.match(
    /^cmyk\s*\(\s*([\d.]+%?)\s*[, ]\s*([\d.]+%?)\s*[, ]\s*([\d.]+%?)\s*[, ]\s*([\d.]+%?)\s*\)$/i
  );
  if (cmykMatch) {
    const c = parseNumberOrPercent(cmykMatch[1], 100);
    const m = parseNumberOrPercent(cmykMatch[2], 100);
    const y = parseNumberOrPercent(cmykMatch[3], 100);
    const k = parseNumberOrPercent(cmykMatch[4], 100);
    return cmykToRgb(c, m, y, k);
  }

  // 6. OKLCH: oklch(l c h) or oklch(l c h / a)
  const oklchMatch = raw.match(
    /^oklch\s*\(\s*([\d.]+%?)\s+([\d.]+%?)\s+([-\d.]+(?:deg|rad|turn)?)\s*(?:\/\s*([\d.]+%?))?\s*\)$/i
  );
  if (oklchMatch) {
    const lRaw = oklchMatch[1].endsWith('%')
      ? parseFloat(oklchMatch[1]) / 100
      : parseFloat(oklchMatch[1]);
    const cRaw = oklchMatch[2].endsWith('%')
      ? (parseFloat(oklchMatch[2]) / 100) * 0.4
      : parseFloat(oklchMatch[2]);
    const hRaw = parseAngle(oklchMatch[3]);
    const a = parseAlpha(oklchMatch[4]);
    return oklchToRgb(lRaw, cRaw, hRaw, a);
  }

  return null;
}
