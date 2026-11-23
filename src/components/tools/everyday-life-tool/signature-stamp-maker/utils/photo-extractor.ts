import type {
  BoundingBox,
  ExportScale,
  PhotoCrop,
  PhotoExtractSettings,
} from '../types';

import { TRIM_PADDING } from '../constants';

const MAX_PHOTO_DIMENSION = 1600;
const BG_ESTIMATE_MAX_DIM = 64;

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const cleaned = hex.replace('#', '').trim();
  const full =
    cleaned.length === 3
      ? cleaned
          .split('')
          .map((c) => c + c)
          .join('')
      : cleaned;

  const num = Number.parseInt(full, 16);
  if (Number.isNaN(num) || full.length !== 6) {
    return { r: 17, g: 24, b: 39 };
  }

  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

export function computePhotoAlphaBoundsFromRgba(
  data: Uint8ClampedArray,
  width: number,
  height: number
): BoundingBox | null {
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * width * 4;
    for (let x = 0; x < width; x++) {
      const alpha = data[rowOffset + x * 4 + 3];
      if (alpha > 10) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (maxX < minX || maxY < minY) return null;

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX + 1,
    height: maxY - minY + 1,
  };
}

export function getCroppedDimensions(
  sourceWidth: number,
  sourceHeight: number,
  crop: PhotoCrop
): { sx: number; sy: number; cw: number; ch: number } {
  const left = Math.max(0, Math.min(45, crop.left)) / 100;
  const right = Math.max(0, Math.min(45, crop.right)) / 100;
  const top = Math.max(0, Math.min(45, crop.top)) / 100;
  const bottom = Math.max(0, Math.min(45, crop.bottom)) / 100;

  const sx = Math.round(sourceWidth * left);
  const sy = Math.round(sourceHeight * top);
  const cw = Math.max(8, Math.round(sourceWidth * (1 - left - right)));
  const ch = Math.max(8, Math.round(sourceHeight * (1 - top - bottom)));

  return { sx, sy, cw, ch };
}

/**
 * Decodes an uploaded or pasted image into an offscreen HTMLCanvasElement,
 * capped at 1600px on the longest side for responsive real-time extraction.
 */
export function loadPhotoToCanvas(
  source: File | Blob
): Promise<{ canvas: HTMLCanvasElement; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(source);
    const img = new Image();

    img.onload = () => {
      try {
        const naturalW = img.naturalWidth || img.width;
        const naturalH = img.naturalHeight || img.height;
        const scale = Math.min(
          1,
          MAX_PHOTO_DIMENSION / Math.max(naturalW, naturalH, 1)
        );
        const width = Math.max(1, Math.round(naturalW * scale));
        const height = Math.max(1, Math.round(naturalH * scale));

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          URL.revokeObjectURL(objectUrl);
          reject(new Error('Canvas context unavailable'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        URL.revokeObjectURL(objectUrl);
        resolve({ canvas, width, height });
      } catch (err) {
        URL.revokeObjectURL(objectUrl);
        reject(err);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to decode image file'));
    };

    img.src = objectUrl;
  });
}

/**
 * Generates a realistic synthetic smartphone photo (warm yellow tint + diagonal phone shadow)
 * of a handwritten signature so users can immediately test local extraction.
 */
export function createSampleSignaturePhotoCanvas(): HTMLCanvasElement {
  const width = 900;
  const height = 400;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  // Uneven warm-to-shadow diagonal lighting simulating indoor phone photography
  const grad = ctx.createLinearGradient(0, 0, width, height);
  grad.addColorStop(0, '#f5ebd6');
  grad.addColorStop(0.55, '#dfd0b4');
  grad.addColorStop(1, '#a99980');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Faint printed baseline under signature
  ctx.strokeStyle = 'rgba(71, 85, 105, 0.28)';
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 8]);
  ctx.beginPath();
  ctx.moveTo(90, 290);
  ctx.lineTo(810, 290);
  ctx.stroke();
  ctx.setLineDash([]);

  // Sample cursive ink strokes
  ctx.strokeStyle = '#182438';
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(155, 250);
  ctx.bezierCurveTo(215, 95, 265, 110, 235, 248);
  ctx.bezierCurveTo(222, 295, 285, 165, 330, 225);
  ctx.bezierCurveTo(360, 260, 405, 185, 455, 228);
  ctx.bezierCurveTo(495, 258, 545, 165, 610, 215);
  ctx.bezierCurveTo(665, 252, 715, 200, 765, 185);
  ctx.stroke();

  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(185, 276);
  ctx.quadraticCurveTo(465, 255, 745, 266);
  ctx.stroke();

  return canvas;
}

function estimateLocalPaperLuminance(
  croppedCanvas: HTMLCanvasElement,
  width: number,
  height: number
): { bgLum: Float32Array; bgW: number; bgH: number } {
  const scale = Math.min(1, BG_ESTIMATE_MAX_DIM / Math.max(width, height, 1));
  const bgW = Math.max(4, Math.round(width * scale));
  const bgH = Math.max(4, Math.round(height * scale));

  const smallCanvas = document.createElement('canvas');
  smallCanvas.width = bgW;
  smallCanvas.height = bgH;
  const sCtx = smallCanvas.getContext('2d');

  const rawLum = new Float32Array(bgW * bgH);
  const dilated = new Float32Array(bgW * bgH);

  if (!sCtx) {
    dilated.fill(255);
    return { bgLum: dilated, bgW, bgH };
  }

  sCtx.drawImage(croppedCanvas, 0, 0, bgW, bgH);
  const smallData = sCtx.getImageData(0, 0, bgW, bgH).data;

  for (let i = 0; i < bgW * bgH; i++) {
    const idx = i * 4;
    rawLum[i] =
      0.299 * smallData[idx] +
      0.587 * smallData[idx + 1] +
      0.114 * smallData[idx + 2];
  }

  // 3x3 max-biased local paper estimator so dark ink strokes don't pull the paper map down
  for (let y = 0; y < bgH; y++) {
    for (let x = 0; x < bgW; x++) {
      let maxVal = 0;
      let sumVal = 0;
      let count = 0;
      for (let dy = -1; dy <= 1; dy++) {
        const ny = Math.max(0, Math.min(bgH - 1, y + dy));
        for (let dx = -1; dx <= 1; dx++) {
          const nx = Math.max(0, Math.min(bgW - 1, x + dx));
          const v = rawLum[ny * bgW + nx];
          if (v > maxVal) maxVal = v;
          sumVal += v;
          count++;
        }
      }
      dilated[y * bgW + x] = maxVal * 0.72 + (sumVal / count) * 0.28;
    }
  }

  return { bgLum: dilated, bgW, bgH };
}

function sampleBilinear(
  grid: Float32Array,
  gw: number,
  gh: number,
  u: number,
  v: number
): number {
  const fx = Math.max(0, Math.min(gw - 1, u * (gw - 1)));
  const fy = Math.max(0, Math.min(gh - 1, v * (gh - 1)));
  const x0 = Math.floor(fx);
  const y0 = Math.floor(fy);
  const x1 = Math.min(gw - 1, x0 + 1);
  const y1 = Math.min(gh - 1, y0 + 1);
  const tx = fx - x0;
  const ty = fy - y0;

  const top = grid[y0 * gw + x0] * (1 - tx) + grid[y0 * gw + x1] * tx;
  const bot = grid[y1 * gw + x0] * (1 - tx) + grid[y1 * gw + x1] * tx;

  return top * (1 - ty) + bot * ty;
}

/**
 * Runs 100% client-side illumination normalization, soft-alpha background extraction,
 * optional ink recoloring, and tight bounding-box computation.
 */
export function processPhotoSignature(
  sourceCanvas: HTMLCanvasElement,
  settings: PhotoExtractSettings,
  outputCanvas: HTMLCanvasElement
): { bounds: BoundingBox | null; width: number; height: number } {
  const { sx, sy, cw, ch } = getCroppedDimensions(
    sourceCanvas.width,
    sourceCanvas.height,
    settings.crop
  );

  outputCanvas.width = cw;
  outputCanvas.height = ch;

  const outCtx = outputCanvas.getContext('2d', { willReadFrequently: true });
  if (!outCtx) {
    return { bounds: null, width: cw, height: ch };
  }

  outCtx.clearRect(0, 0, cw, ch);
  outCtx.drawImage(sourceCanvas, sx, sy, cw, ch, 0, 0, cw, ch);

  const imgData = outCtx.getImageData(0, 0, cw, ch);
  const data = imgData.data;

  const bgMap = settings.normalizeLighting
    ? estimateLocalPaperLuminance(outputCanvas, cw, ch)
    : null;

  const targetRgb = hexToRgb(settings.recolorHex);
  const softness = Math.max(4, settings.softness);
  const highCut = settings.threshold + softness;
  const lowCut = settings.threshold - softness;
  const range = Math.max(1, highCut - lowCut);
  const strength = Math.max(0.4, Math.min(2, settings.inkStrength / 100));

  for (let y = 0; y < ch; y++) {
    const vRatio = ch > 1 ? y / (ch - 1) : 0;
    const rowOffset = y * cw * 4;

    for (let x = 0; x < cw; x++) {
      const idx = rowOffset + x * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const srcAlpha = data[idx + 3];

      if (srcAlpha === 0) continue;

      const rawLum = 0.299 * r + 0.587 * g + 0.114 * b;
      let normalizedLum = rawLum;

      if (bgMap) {
        const localPaper = sampleBilinear(
          bgMap.bgLum,
          bgMap.bgW,
          bgMap.bgH,
          cw > 1 ? x / (cw - 1) : 0,
          vRatio
        );
        normalizedLum = Math.min(
          255,
          (rawLum / Math.max(localPaper, 20)) * 255
        );
      }

      // Preserve vivid colored ink (e.g. red stamps or blue ink) when keeping original colors
      const chroma = Math.max(r, g, b) - Math.min(r, g, b);
      const effectiveLum =
        settings.colorMode === 'original'
          ? Math.max(0, normalizedLum - chroma * 0.48)
          : normalizedLum;

      let alphaNorm: number;
      if (effectiveLum >= highCut) {
        alphaNorm = 0;
      } else if (effectiveLum <= lowCut) {
        alphaNorm = 1;
      } else {
        const t = (highCut - effectiveLum) / range;
        alphaNorm = t * t * (3 - 2 * t);
      }

      const finalAlpha = Math.round(
        Math.min(255, alphaNorm * strength * srcAlpha)
      );

      if (finalAlpha < 8) {
        data[idx + 3] = 0;
      } else {
        data[idx + 3] = finalAlpha;
        if (settings.colorMode === 'recolor') {
          data[idx] = targetRgb.r;
          data[idx + 1] = targetRgb.g;
          data[idx + 2] = targetRgb.b;
        }
      }
    }
  }

  outCtx.putImageData(imgData, 0, 0);
  const bounds = computePhotoAlphaBoundsFromRgba(data, cw, ch);

  return { bounds, width: cw, height: ch };
}

export function getPhotoExportBox(
  canvasWidth: number,
  canvasHeight: number,
  bounds: BoundingBox | null,
  trimWhitespace: boolean
): { x: number; y: number; width: number; height: number } {
  if (!trimWhitespace || !bounds) {
    return {
      x: 0,
      y: 0,
      width: Math.max(1, canvasWidth),
      height: Math.max(1, canvasHeight),
    };
  }

  const x = Math.max(0, Math.floor(bounds.minX - TRIM_PADDING));
  const y = Math.max(0, Math.floor(bounds.minY - TRIM_PADDING));
  const maxRight = Math.min(canvasWidth, Math.ceil(bounds.maxX + TRIM_PADDING));
  const maxBottom = Math.min(
    canvasHeight,
    Math.ceil(bounds.maxY + TRIM_PADDING)
  );

  return {
    x,
    y,
    width: Math.max(16, maxRight - x),
    height: Math.max(16, maxBottom - y),
  };
}

export function exportExtractedPhotoToPngBlob(
  processedCanvas: HTMLCanvasElement,
  bounds: BoundingBox | null,
  options: { trimWhitespace: boolean; scale: ExportScale }
): Promise<{ blob: Blob; width: number; height: number } | null> {
  return new Promise((resolve) => {
    if (
      typeof document === 'undefined' ||
      processedCanvas.width === 0 ||
      processedCanvas.height === 0
    ) {
      resolve(null);
      return;
    }

    const box = getPhotoExportBox(
      processedCanvas.width,
      processedCanvas.height,
      bounds,
      options.trimWhitespace
    );

    const outW = Math.max(1, Math.round(box.width * options.scale));
    const outH = Math.max(1, Math.round(box.height * options.scale));

    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = outW;
    exportCanvas.height = outH;

    const ctx = exportCanvas.getContext('2d');
    if (!ctx) {
      resolve(null);
      return;
    }

    ctx.drawImage(
      processedCanvas,
      box.x,
      box.y,
      box.width,
      box.height,
      0,
      0,
      outW,
      outH
    );

    exportCanvas.toBlob((blob) => {
      if (!blob) {
        resolve(null);
        return;
      }
      resolve({ blob, width: outW, height: outH });
    }, 'image/png');
  });
}
