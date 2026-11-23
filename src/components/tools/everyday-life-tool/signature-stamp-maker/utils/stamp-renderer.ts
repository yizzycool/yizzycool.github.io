import type { ExportScale, StampSettings } from '../types';

import { STAMP_FONT_FAMILIES } from '../constants';

const STAMP_BASE_SIZE = 320;

function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function isCjkShortSeal(text: string): boolean {
  const trimmed = text.trim();
  if (trimmed.length < 2 || trimmed.length > 4) return false;
  return /^[\u4e00-\u9fff]+$/.test(trimmed);
}

export function getStampLogicalDimensions(shape: StampSettings['shape']): {
  width: number;
  height: number;
} {
  if (shape === 'oval') {
    return { width: 380, height: 260 };
  }
  return { width: STAMP_BASE_SIZE, height: STAMP_BASE_SIZE };
}

function drawCjkSealText(
  ctx: CanvasRenderingContext2D,
  chars: string[],
  cx: number,
  cy: number,
  innerRadius: number,
  fontFamily: string
): void {
  const count = chars.length;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  if (count === 2) {
    const fontSize = Math.round(innerRadius * 0.72);
    ctx.font = `700 ${fontSize}px ${fontFamily}`;
    const offset = fontSize * 0.56;
    ctx.fillText(chars[0], cx, cy - offset);
    ctx.fillText(chars[1], cx, cy + offset);
    return;
  }

  if (count === 3) {
    const fontSize = Math.round(innerRadius * 0.62);
    ctx.font = `700 ${fontSize}px ${fontFamily}`;
    const colOffset = fontSize * 0.52;
    const rowOffset = fontSize * 0.54;
    ctx.fillText(chars[0], cx + colOffset, cy - rowOffset);
    ctx.fillText(chars[1], cx + colOffset, cy + rowOffset);
    ctx.fillText(chars[2], cx - colOffset, cy);
    return;
  }

  const fontSize = Math.round(innerRadius * 0.58);
  ctx.font = `700 ${fontSize}px ${fontFamily}`;
  const step = fontSize * 0.56;
  ctx.fillText(chars[0], cx + step, cy - step);
  ctx.fillText(chars[1], cx + step, cy + step);
  ctx.fillText(chars[2], cx - step, cy - step);
  ctx.fillText(chars[3], cx - step, cy + step);
}

function drawFittedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  cx: number,
  cy: number,
  maxWidth: number,
  initialFontSize: number,
  fontWeight: number,
  fontFamily: string
): number {
  let size = initialFontSize;
  ctx.font = `${fontWeight} ${size}px ${fontFamily}`;
  while (size > 14 && ctx.measureText(text).width > maxWidth) {
    size -= 2;
    ctx.font = `${fontWeight} ${size}px ${fontFamily}`;
  }
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, cx, cy);
  return size;
}

export function renderStampToCanvas(
  canvas: HTMLCanvasElement,
  settings: StampSettings,
  scale = 1
): void {
  const { width, height } = getStampLogicalDimensions(settings.shape);
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.scale(scale, scale);

  const cx = width / 2;
  const cy = height / 2;
  const padding = 20;
  const outerStroke = Math.max(2, settings.borderWidth);
  const fontFamily = STAMP_FONT_FAMILIES[settings.fontStyle];

  ctx.strokeStyle = settings.color;
  ctx.fillStyle = settings.color;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  if (settings.shape === 'round') {
    const r = width / 2 - padding;
    ctx.lineWidth = outerStroke;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();

    if (settings.borderStyle === 'double') {
      ctx.lineWidth = Math.max(1.5, outerStroke * 0.42);
      ctx.beginPath();
      ctx.arc(cx, cy, r - outerStroke - 5, 0, Math.PI * 2);
      ctx.stroke();
    }
  } else if (settings.shape === 'square') {
    const side = width - padding * 2;
    const x = padding;
    const y = padding;
    ctx.lineWidth = outerStroke;
    ctx.beginPath();
    ctx.roundRect(x, y, side, side, 14);
    ctx.stroke();

    if (settings.borderStyle === 'double') {
      const inset = outerStroke + 5;
      ctx.lineWidth = Math.max(1.5, outerStroke * 0.42);
      ctx.beginPath();
      ctx.roundRect(
        x + inset,
        y + inset,
        side - inset * 2,
        side - inset * 2,
        8
      );
      ctx.stroke();
    }
  } else {
    const rx = width / 2 - padding;
    const ry = height / 2 - padding;
    ctx.lineWidth = outerStroke;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.stroke();

    if (settings.borderStyle === 'double') {
      const gap = outerStroke + 5;
      ctx.lineWidth = Math.max(1.5, outerStroke * 0.42);
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx - gap, ry - gap, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  const primaryText = settings.text.trim() || 'STAMP';
  const subtitleText = settings.subtitle.trim();

  if (settings.shape !== 'oval' && isCjkShortSeal(primaryText)) {
    const innerRadius = width / 2 - padding - outerStroke - 14;
    drawCjkSealText(
      ctx,
      Array.from(primaryText),
      cx,
      cy,
      innerRadius,
      fontFamily
    );
  } else {
    const safeWidth =
      settings.shape === 'oval'
        ? width - padding * 2 - 58
        : settings.shape === 'square'
          ? width - padding * 2 - 40
          : width - padding * 2 - 48;

    const primaryY = subtitleText ? cy - 16 : cy;
    drawFittedText(
      ctx,
      primaryText,
      cx,
      primaryY,
      safeWidth,
      44,
      800,
      fontFamily
    );

    if (subtitleText) {
      const dividerHalf = Math.min(safeWidth * 0.42, 86);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cx - dividerHalf, cy + 8);
      ctx.lineTo(cx + dividerHalf, cy + 8);
      ctx.stroke();

      drawFittedText(
        ctx,
        subtitleText,
        cx,
        cy + 28,
        safeWidth * 0.88,
        18,
        600,
        fontFamily
      );
    }
  }

  if (settings.distress > 0) {
    const rand = mulberry32(42197);
    const count = Math.round(settings.distress * 16);
    ctx.globalCompositeOperation = 'destination-out';

    for (let i = 0; i < count; i++) {
      const sx = rand() * width;
      const sy = rand() * height;
      const sr = 0.6 + rand() * 2.1;
      ctx.fillStyle = `rgba(0, 0, 0, ${(0.25 + rand() * 0.55).toFixed(2)})`;
      ctx.beginPath();
      ctx.arc(sx, sy, sr, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();
}

export function exportStampToPngBlob(
  settings: StampSettings,
  scale: ExportScale
): Promise<{ blob: Blob; width: number; height: number } | null> {
  return new Promise((resolve) => {
    if (typeof document === 'undefined') {
      resolve(null);
      return;
    }

    const canvas = document.createElement('canvas');
    renderStampToCanvas(canvas, settings, scale);

    canvas.toBlob((blob) => {
      if (!blob) {
        resolve(null);
        return;
      }
      resolve({ blob, width: canvas.width, height: canvas.height });
    }, 'image/png');
  });
}

export function exportStampToSvg(settings: StampSettings): {
  svg: string;
  width: number;
  height: number;
} {
  const { width, height } = getStampLogicalDimensions(settings.shape);
  const cx = width / 2;
  const cy = height / 2;
  const padding = 20;
  const outerStroke = Math.max(2, settings.borderWidth);
  const innerStroke = Math.max(1.5, Number((outerStroke * 0.42).toFixed(2)));
  const fontFamily = STAMP_FONT_FAMILIES[settings.fontStyle].replace(/"/g, "'");
  const color = settings.color;

  const shapes: string[] = [];

  if (settings.shape === 'round') {
    const r = width / 2 - padding;
    shapes.push(
      `  <circle cx="${cx}" cy="${cy}" r="${r}" stroke="${color}" stroke-width="${outerStroke}" />`
    );
    if (settings.borderStyle === 'double') {
      shapes.push(
        `  <circle cx="${cx}" cy="${cy}" r="${r - outerStroke - 5}" stroke="${color}" stroke-width="${innerStroke}" />`
      );
    }
  } else if (settings.shape === 'square') {
    const side = width - padding * 2;
    shapes.push(
      `  <rect x="${padding}" y="${padding}" width="${side}" height="${side}" rx="14" stroke="${color}" stroke-width="${outerStroke}" />`
    );
    if (settings.borderStyle === 'double') {
      const inset = outerStroke + 5;
      shapes.push(
        `  <rect x="${padding + inset}" y="${padding + inset}" width="${side - inset * 2}" height="${side - inset * 2}" rx="8" stroke="${color}" stroke-width="${innerStroke}" />`
      );
    }
  } else {
    const rx = width / 2 - padding;
    const ry = height / 2 - padding;
    shapes.push(
      `  <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" stroke="${color}" stroke-width="${outerStroke}" />`
    );
    if (settings.borderStyle === 'double') {
      const gap = outerStroke + 5;
      shapes.push(
        `  <ellipse cx="${cx}" cy="${cy}" rx="${rx - gap}" ry="${ry - gap}" stroke="${color}" stroke-width="${innerStroke}" />`
      );
    }
  }

  const primaryText = settings.text.trim() || 'STAMP';
  const subtitleText = settings.subtitle.trim();
  const textEls: string[] = [];

  if (settings.shape !== 'oval' && isCjkShortSeal(primaryText)) {
    const chars = Array.from(primaryText);
    const innerRadius = width / 2 - padding - outerStroke - 14;

    if (chars.length === 2) {
      const size = Math.round(innerRadius * 0.72);
      const offset = size * 0.56;
      textEls.push(
        `  <text x="${cx}" y="${cy - offset}" fill="${color}" font-family="${fontFamily}" font-size="${size}" font-weight="700" text-anchor="middle" dominant-baseline="central">${escapeXml(chars[0])}</text>`,
        `  <text x="${cx}" y="${cy + offset}" fill="${color}" font-family="${fontFamily}" font-size="${size}" font-weight="700" text-anchor="middle" dominant-baseline="central">${escapeXml(chars[1])}</text>`
      );
    } else if (chars.length === 3) {
      const size = Math.round(innerRadius * 0.62);
      const col = size * 0.52;
      const row = size * 0.54;
      textEls.push(
        `  <text x="${cx + col}" y="${cy - row}" fill="${color}" font-family="${fontFamily}" font-size="${size}" font-weight="700" text-anchor="middle" dominant-baseline="central">${escapeXml(chars[0])}</text>`,
        `  <text x="${cx + col}" y="${cy + row}" fill="${color}" font-family="${fontFamily}" font-size="${size}" font-weight="700" text-anchor="middle" dominant-baseline="central">${escapeXml(chars[1])}</text>`,
        `  <text x="${cx - col}" y="${cy}" fill="${color}" font-family="${fontFamily}" font-size="${size}" font-weight="700" text-anchor="middle" dominant-baseline="central">${escapeXml(chars[2])}</text>`
      );
    } else {
      const size = Math.round(innerRadius * 0.58);
      const step = size * 0.56;
      textEls.push(
        `  <text x="${cx + step}" y="${cy - step}" fill="${color}" font-family="${fontFamily}" font-size="${size}" font-weight="700" text-anchor="middle" dominant-baseline="central">${escapeXml(chars[0])}</text>`,
        `  <text x="${cx + step}" y="${cy + step}" fill="${color}" font-family="${fontFamily}" font-size="${size}" font-weight="700" text-anchor="middle" dominant-baseline="central">${escapeXml(chars[1])}</text>`,
        `  <text x="${cx - step}" y="${cy - step}" fill="${color}" font-family="${fontFamily}" font-size="${size}" font-weight="700" text-anchor="middle" dominant-baseline="central">${escapeXml(chars[2])}</text>`,
        `  <text x="${cx - step}" y="${cy + step}" fill="${color}" font-family="${fontFamily}" font-size="${size}" font-weight="700" text-anchor="middle" dominant-baseline="central">${escapeXml(chars[3])}</text>`
      );
    }
  } else {
    const safeWidth =
      settings.shape === 'oval'
        ? width - padding * 2 - 58
        : settings.shape === 'square'
          ? width - padding * 2 - 40
          : width - padding * 2 - 48;
    const approxSize = Math.max(
      14,
      Math.min(
        44,
        Math.floor((safeWidth / Math.max(1, primaryText.length)) * 1.55)
      )
    );
    const primaryY = subtitleText ? cy - 16 : cy;
    textEls.push(
      `  <text x="${cx}" y="${primaryY}" fill="${color}" font-family="${fontFamily}" font-size="${approxSize}" font-weight="800" text-anchor="middle" dominant-baseline="central">${escapeXml(primaryText)}</text>`
    );

    if (subtitleText) {
      const dividerHalf = Math.min(safeWidth * 0.42, 86);
      textEls.push(
        `  <line x1="${cx - dividerHalf}" y1="${cy + 8}" x2="${cx + dividerHalf}" y2="${cy + 8}" stroke="${color}" stroke-width="1.5" />`,
        `  <text x="${cx}" y="${cy + 28}" fill="${color}" font-family="${fontFamily}" font-size="16" font-weight="600" text-anchor="middle" dominant-baseline="central">${escapeXml(subtitleText)}</text>`
      );
    }
  }

  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none">`,
    ...shapes,
    ...textEls,
    '</svg>',
  ].join('\n');

  return { svg, width, height };
}
