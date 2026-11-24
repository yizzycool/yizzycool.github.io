'use client';

import { useEffect, useRef } from 'react';

type Props = {
  imageElement: HTMLCanvasElement | HTMLImageElement | null;
  revision: number;
};

const BINS = 256;

function computeHistograms(source: HTMLCanvasElement | HTMLImageElement): {
  r: Uint32Array;
  g: Uint32Array;
  b: Uint32Array;
  luma: Uint32Array;
  maxVal: number;
} {
  const sampleCanvas = document.createElement('canvas');
  const maxDim = 140;
  const srcW =
    source instanceof HTMLImageElement
      ? source.naturalWidth || source.width
      : source.width;
  const srcH =
    source instanceof HTMLImageElement
      ? source.naturalHeight || source.height
      : source.height;
  const scale = Math.min(1, maxDim / Math.max(srcW || 1, srcH || 1));
  const w = Math.max(1, Math.round((srcW || 1) * scale));
  const h = Math.max(1, Math.round((srcH || 1) * scale));

  sampleCanvas.width = w;
  sampleCanvas.height = h;
  const ctx = sampleCanvas.getContext('2d', { willReadFrequently: true });

  const r = new Uint32Array(BINS);
  const g = new Uint32Array(BINS);
  const b = new Uint32Array(BINS);
  const luma = new Uint32Array(BINS);

  if (!ctx) return { r, g, b, luma, maxVal: 1 };

  ctx.drawImage(source, 0, 0, w, h);
  const data = ctx.getImageData(0, 0, w, h).data;

  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 8) continue;
    const rv = data[i];
    const gv = data[i + 1];
    const bv = data[i + 2];
    const lv = Math.min(255, Math.round(rv * 0.299 + gv * 0.587 + bv * 0.114));
    r[rv] += 1;
    g[gv] += 1;
    b[bv] += 1;
    luma[lv] += 1;
  }

  let maxVal = 1;
  // Ignore extreme edge spikes at 0 / 255 slightly so midtones stay readable
  for (let i = 2; i < BINS - 2; i++) {
    maxVal = Math.max(maxVal, r[i], g[i], b[i], luma[i]);
  }
  maxVal = Math.max(
    maxVal,
    Math.round(r[0] * 0.5),
    Math.round(luma[255] * 0.5)
  );

  return { r, g, b, luma, maxVal };
}

/**
 * Live RGB & Luminance histogram analyzer rendering smooth translucent channel distributions.
 */
export default function HistogramCanvas({ imageElement, revision }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    if (!imageElement) return;

    const { r, g, b, luma, maxVal } = computeHistograms(imageElement);

    const drawChannel = (bins: Uint32Array, fill: string, stroke: string) => {
      ctx.beginPath();
      ctx.moveTo(0, h);
      for (let i = 0; i < BINS; i++) {
        const x = (i / (BINS - 1)) * w;
        const norm = Math.min(1, bins[i] / maxVal);
        const y = h - norm * (h - 4);
        ctx.lineTo(x, y);
      }
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fillStyle = fill;
      ctx.fill();
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 1;
      ctx.stroke();
    };

    drawChannel(r, 'rgba(239, 68, 68, 0.22)', 'rgba(239, 68, 68, 0.65)');
    drawChannel(g, 'rgba(34, 197, 94, 0.22)', 'rgba(34, 197, 94, 0.65)');
    drawChannel(b, 'rgba(59, 130, 246, 0.22)', 'rgba(59, 130, 246, 0.65)');
    drawChannel(luma, 'rgba(148, 163, 184, 0.24)', 'rgba(148, 163, 184, 0.85)');
  }, [imageElement, revision]);

  return (
    <div className="overflow-hidden rounded-xl border border-neutral-200/80 bg-neutral-50/90 p-2 dark:border-neutral-800/80 dark:bg-neutral-950/70">
      <div className="mb-1 flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
        <span>Live Histogram</span>
        <span>RGB + Luma</span>
      </div>
      <canvas
        ref={canvasRef}
        width={256}
        height={68}
        className="block h-[68px] w-full rounded bg-white/80 dark:bg-neutral-900/90"
      />
    </div>
  );
}
