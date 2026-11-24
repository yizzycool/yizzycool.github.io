import type { DepthMapData } from '../types/studio';

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0 || 1e-5)));
  return t * t * (3 - 2 * t);
}

/**
 * Render multi-plane optical Portrait Bokeh from an estimated Depth Anything V2 depth map.
 * Near-focus depths stay crisp while far-from-focal-plane regions blend smoothly across 4 blur strata.
 */
export async function renderDepthBokehBlob(
  sourceEl: HTMLImageElement | HTMLCanvasElement,
  depthMap: DepthMapData,
  focusDepth01: number,
  blurRadiusPx: number
): Promise<Blob> {
  const w =
    sourceEl instanceof HTMLImageElement
      ? sourceEl.naturalWidth || sourceEl.width
      : sourceEl.width;
  const h =
    sourceEl instanceof HTMLImageElement
      ? sourceEl.naturalHeight || sourceEl.height
      : sourceEl.height;

  const maxRadius = Math.max(2, Math.min(40, blurRadiusPx));

  const renderBlurredData = (blurPx: number): Uint8ClampedArray => {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const ctx = c.getContext('2d', { willReadFrequently: true });
    if (!ctx) return new Uint8ClampedArray(w * h * 4);
    if (blurPx > 0.25) {
      ctx.filter = `blur(${blurPx.toFixed(1)}px)`;
    }
    ctx.drawImage(sourceEl, 0, 0, w, h);
    return ctx.getImageData(0, 0, w, h).data;
  };

  // Scale depth map cleanly to natural image dimensions
  const depthCanvas = document.createElement('canvas');
  depthCanvas.width = depthMap.width;
  depthCanvas.height = depthMap.height;
  const dCtx = depthCanvas.getContext('2d');
  if (dCtx) {
    const dImg = dCtx.createImageData(depthMap.width, depthMap.height);
    for (let i = 0; i < depthMap.width * depthMap.height; i++) {
      const v = depthMap.data[i] ?? 0;
      dImg.data[i * 4] = v;
      dImg.data[i * 4 + 1] = v;
      dImg.data[i * 4 + 2] = v;
      dImg.data[i * 4 + 3] = 255;
    }
    dCtx.putImageData(dImg, 0, 0);
  }

  const scaledDepthCanvas = document.createElement('canvas');
  scaledDepthCanvas.width = w;
  scaledDepthCanvas.height = h;
  const sdCtx = scaledDepthCanvas.getContext('2d', {
    willReadFrequently: true,
  });
  let depthPixels: Uint8ClampedArray<ArrayBufferLike> = new Uint8ClampedArray(
    w * h * 4
  );
  if (sdCtx) {
    sdCtx.imageSmoothingEnabled = true;
    sdCtx.drawImage(depthCanvas, 0, 0, w, h);
    depthPixels = sdCtx.getImageData(0, 0, w, h).data;
  }

  const sharp = renderBlurredData(0);
  const soft = renderBlurredData(maxRadius * 0.35);
  const med = renderBlurredData(maxRadius * 0.68);
  const deep = renderBlurredData(maxRadius);

  const outCanvas = document.createElement('canvas');
  outCanvas.width = w;
  outCanvas.height = h;
  const outCtx = outCanvas.getContext('2d');
  if (!outCtx) throw new Error('Canvas 2D context unavailable');

  const outImg = outCtx.createImageData(w, h);
  const dst = outImg.data;
  const dofWidth = 0.08;

  for (let i = 0; i < w * h; i++) {
    const p = i * 4;
    const dNorm = depthPixels[p] / 255;
    const diff = Math.max(0, Math.abs(dNorm - focusDepth01) - dofWidth);
    const amount = Math.min(1, diff / 0.55);

    let srcA = sharp;
    let srcB = soft;
    let t = amount * 3;
    if (t >= 2) {
      srcA = med;
      srcB = deep;
      t = Math.min(1, t - 2);
    } else if (t >= 1) {
      srcA = soft;
      srcB = med;
      t = t - 1;
    }

    dst[p] = Math.round(srcA[p] + (srcB[p] - srcA[p]) * t);
    dst[p + 1] = Math.round(srcA[p + 1] + (srcB[p + 1] - srcA[p + 1]) * t);
    dst[p + 2] = Math.round(srcA[p + 2] + (srcB[p + 2] - srcA[p + 2]) * t);
    dst[p + 3] = sharp[p + 3];
  }

  outCtx.putImageData(outImg, 0, 0);
  const blob = await new Promise<Blob | null>((resolve) =>
    outCanvas.toBlob(resolve, 'image/png')
  );
  if (!blob) throw new Error('Failed to render depth bokeh PNG.');
  return blob;
}

/**
 * Generate a smooth foreground alpha matte (close = opaque, background = transparent)
 * for creating "Text Behind Subject" magazine compositions.
 */
export function buildForegroundAlphaFromDepth(
  depthMap: DepthMapData,
  cutoff01: number,
  feather = 0.06
): Uint8ClampedArray {
  const total = depthMap.width * depthMap.height;
  const alpha = new Uint8ClampedArray(total);
  for (let i = 0; i < total; i++) {
    const dNorm = (depthMap.data[i] ?? 0) / 255;
    const w = smoothstep(cutoff01 - feather, cutoff01 + feather, dNorm);
    alpha[i] = Math.round(w * 255);
  }
  return alpha;
}
