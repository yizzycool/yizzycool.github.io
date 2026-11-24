export type ParsedLut3D = {
  id: string;
  name: string;
  size: number;
  data: Uint8Array;
};

const BUILTIN_LUT_CACHE = new Map<string, ParsedLut3D>();

function clampByte(v: number): number {
  return Math.max(0, Math.min(255, Math.round(v * 255)));
}

/**
 * Parse a standard Adobe/Iridas `.cube` 3D LUT file into a 2D strip RGBA Uint8Array
 * where horizontal coordinate = `b * size + r` and vertical coordinate = `g`.
 */
export function parseCubeLut(
  cubeText: string,
  fallbackName = 'Custom 3D LUT'
): ParsedLut3D {
  const lines = cubeText.split(/\r?\n/);
  let title = fallbackName.replace(/\.cube$/i, '');
  let size = 0;
  let domainMin = [0, 0, 0];
  let domainMax = [1, 1, 1];
  const entries: Array<[number, number, number]> = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    if (line.toUpperCase().startsWith('TITLE')) {
      const match = line.match(/TITLE\s+"?([^"]+)"?/i);
      if (match?.[1]) title = match[1].trim();
      continue;
    }

    if (line.toUpperCase().startsWith('LUT_3D_SIZE')) {
      const parts = line.split(/\s+/);
      const parsedSize = Number.parseInt(parts[1] ?? '0', 10);
      if (parsedSize >= 2 && parsedSize <= 65) {
        size = parsedSize;
      }
      continue;
    }

    if (line.toUpperCase().startsWith('LUT_1D_SIZE')) {
      throw new Error(
        '1D .cube LUTs are not supported here; please import a 3D LUT (.cube).'
      );
    }

    if (line.toUpperCase().startsWith('DOMAIN_MIN')) {
      const nums = line
        .split(/\s+/)
        .slice(1)
        .map((n) => Number.parseFloat(n));
      if (nums.length >= 3 && nums.every(Number.isFinite)) {
        domainMin = [nums[0], nums[1], nums[2]];
      }
      continue;
    }

    if (line.toUpperCase().startsWith('DOMAIN_MAX')) {
      const nums = line
        .split(/\s+/)
        .slice(1)
        .map((n) => Number.parseFloat(n));
      if (nums.length >= 3 && nums.every(Number.isFinite)) {
        domainMax = [nums[0], nums[1], nums[2]];
      }
      continue;
    }

    const parts = line.split(/\s+/);
    if (parts.length >= 3) {
      const r = Number.parseFloat(parts[0]);
      const g = Number.parseFloat(parts[1]);
      const b = Number.parseFloat(parts[2]);
      if (Number.isFinite(r) && Number.isFinite(g) && Number.isFinite(b)) {
        entries.push([r, g, b]);
      }
    }
  }

  if (size === 0) {
    const inferred = Math.round(Math.cbrt(entries.length));
    if (inferred >= 2 && inferred * inferred * inferred === entries.length) {
      size = inferred;
    } else {
      throw new Error('Missing LUT_3D_SIZE header in .cube file.');
    }
  }

  const expected = size * size * size;
  if (entries.length < expected) {
    throw new Error(
      `Invalid 3D LUT data: expected ${expected} RGB rows, found ${entries.length}.`
    );
  }

  const stripWidth = size * size;
  const data = new Uint8Array(stripWidth * size * 4);
  const spanR = domainMax[0] - domainMin[0] || 1;
  const spanG = domainMax[1] - domainMin[1] || 1;
  const spanB = domainMax[2] - domainMin[2] || 1;

  // Standard .cube ordering: R varies fastest, then G, then B slowest
  let idx = 0;
  for (let b = 0; b < size; b++) {
    for (let g = 0; g < size; g++) {
      for (let r = 0; r < size; r++) {
        const [rawR, rawG, rawB] = entries[idx++];
        const nr = (rawR - domainMin[0]) / spanR;
        const ng = (rawG - domainMin[1]) / spanG;
        const nb = (rawB - domainMin[2]) / spanB;

        const outIdx = (g * stripWidth + b * size + r) * 4;
        data[outIdx] = clampByte(nr);
        data[outIdx + 1] = clampByte(ng);
        data[outIdx + 2] = clampByte(nb);
        data[outIdx + 3] = 255;
      }
    }
  }

  return {
    id: `custom-${Date.now()}`,
    name: title,
    size,
    data,
  };
}

/**
 * Generate built-in 17x17x17 3D cinematic color grading LUTs on demand without external fetches.
 */
export function generateBuiltinLut(id: string): ParsedLut3D | null {
  if (!id || id === 'none') return null;
  const cached = BUILTIN_LUT_CACHE.get(id);
  if (cached) return cached;

  const size = 17;
  const stripWidth = size * size;
  const data = new Uint8Array(stripWidth * size * 4);

  const labels: Record<string, string> = {
    'teal-orange': 'Cinema Teal & Orange',
    'fuji-classic': 'Fuji Classic Chrome',
    'warm-matte': 'Warm Indie Matte',
    'noir-contrast': 'Noir High Contrast',
  };
  if (!labels[id]) return null;

  for (let b = 0; b < size; b++) {
    for (let g = 0; g < size; g++) {
      for (let r = 0; r < size; r++) {
        const ir = r / (size - 1);
        const ig = g / (size - 1);
        const ib = b / (size - 1);
        const luma = ir * 0.299 + ig * 0.587 + ib * 0.114;

        let outR = ir;
        let outG = ig;
        let outB = ib;

        if (id === 'teal-orange') {
          // Cool teal shadows, warm skin-friendly highlights + subtle S-curve
          const shadowW = Math.pow(1 - luma, 1.4);
          const highW = Math.pow(luma, 1.3);
          const sCurve = (v: number) => v * v * (3 - 2 * v) * 0.35 + v * 0.65;
          outR = sCurve(ir) - 0.11 * shadowW + 0.12 * highW;
          outG = sCurve(ig) + 0.03 * shadowW + 0.03 * highW;
          outB = sCurve(ib) + 0.12 * shadowW - 0.13 * highW;
        } else if (id === 'fuji-classic') {
          // Crisp desaturated filmic chrome with cool mids & lifted blacks
          const mixSat = 0.82;
          const dr = luma + (ir - luma) * mixSat;
          const dg = luma + (ig - luma) * mixSat;
          const db = luma + (ib - luma) * mixSat;
          outR = 0.025 + dr * 0.94 + Math.max(0, luma - 0.5) * 0.04;
          outG = 0.028 + dg * 0.95;
          outB = 0.04 + db * 0.92 + Math.max(0, 0.5 - luma) * 0.04;
        } else if (id === 'warm-matte') {
          // Faded black floor + creamy golden highlights
          outR = 0.055 + ir * 0.9 + 0.05 * luma;
          outG = 0.045 + ig * 0.88 + 0.02 * luma;
          outB = 0.065 + ib * 0.78 - 0.04 * luma;
        } else if (id === 'noir-contrast') {
          // Deep silver gelatin monochrome with slight cool platinum split
          const contrastLuma = Math.pow(luma, 1.18);
          const sLuma = contrastLuma * contrastLuma * (3 - 2 * contrastLuma);
          const mixed = luma * 0.35 + sLuma * 0.65;
          outR = mixed * 0.98;
          outG = mixed * 0.99;
          outB = mixed * 1.03;
        }

        const outIdx = (g * stripWidth + b * size + r) * 4;
        data[outIdx] = clampByte(outR);
        data[outIdx + 1] = clampByte(outG);
        data[outIdx + 2] = clampByte(outB);
        data[outIdx + 3] = 255;
      }
    }
  }

  const parsed: ParsedLut3D = {
    id,
    name: labels[id],
    size,
    data,
  };
  BUILTIN_LUT_CACHE.set(id, parsed);
  return parsed;
}

export function encodeLutBytesToBase64(data: Uint8Array): string {
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < data.length; i += chunkSize) {
    const slice = data.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...slice);
  }
  return btoa(binary);
}

export function decodeLutBytesFromBase64(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}
