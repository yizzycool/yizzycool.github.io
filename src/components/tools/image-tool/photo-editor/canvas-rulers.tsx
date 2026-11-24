'use client';

import { Trash2 } from 'lucide-react';
import { useEffect, useRef } from 'react';

type Props = {
  visible: boolean;
  stageWidth: number;
  stageHeight: number;
  viewportTransform: number[];
  cursorPos: { x: number; y: number } | null;
  guidesCount: number;
  onStartDragGuide: (orientation: 'h' | 'v', clientCoord: number) => void;
  onClearGuides: () => void;
};

const RULER_THICKNESS = 20;

function pickTickStep(zoom: number): number {
  const targetPxPerTick = 56;
  const rawUnits = targetPxPerTick / Math.max(0.05, zoom);
  const steps = [5, 10, 25, 50, 100, 250, 500, 1000];
  for (const s of steps) {
    if (s >= rawUnits) return s;
  }
  return 1000;
}

/**
 * Synchronized horizontal and vertical Photoshop-style canvas rulers.
 * Drag from either ruler onto the canvas to spawn magnetic user alignment guides.
 */
export default function CanvasRulers({
  visible,
  stageWidth,
  stageHeight,
  viewportTransform,
  cursorPos,
  guidesCount,
  onStartDragGuide,
  onClearGuides,
}: Props) {
  const topCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const leftCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!visible) return;

    const zoom = viewportTransform[0] || 1;
    const tx = viewportTransform[4] || 0;
    const ty = viewportTransform[5] || 0;
    const majorStep = pickTickStep(zoom);
    const minorStep = majorStep / 5;
    const dpr = Math.min(3, window.devicePixelRatio || 1);
    const isDark =
      typeof document !== 'undefined' &&
      document.documentElement.getAttribute('data-mode') === 'dark';

    const tickColor = isDark
      ? 'rgba(163,163,163,0.45)'
      : 'rgba(115,115,115,0.45)';
    const textColor = isDark ? '#a3a3a3' : '#525252';

    const topCanvas = topCanvasRef.current;
    if (topCanvas && stageWidth > RULER_THICKNESS) {
      const w = stageWidth - RULER_THICKNESS;
      topCanvas.width = Math.round(w * dpr);
      topCanvas.height = Math.round(RULER_THICKNESS * dpr);
      const ctx = topCanvas.getContext('2d');
      if (ctx) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, w, RULER_THICKNESS);
        ctx.font = '500 9px ui-monospace, SFMono-Regular, monospace';
        ctx.textBaseline = 'top';
        ctx.fillStyle = textColor;
        ctx.strokeStyle = tickColor;
        ctx.lineWidth = 1;

        const startDocX =
          Math.floor((RULER_THICKNESS - tx) / zoom / minorStep) * minorStep;
        const endDocX =
          Math.ceil((stageWidth - tx) / zoom / minorStep) * minorStep;

        for (let x = startDocX; x <= endDocX; x += minorStep) {
          const px = x * zoom + tx - RULER_THICKNESS;
          if (px < 0 || px > w) continue;
          const sx = Math.floor(px) + 0.5;
          const isMajor =
            Math.abs(Math.round(x / majorStep) * majorStep - x) < 0.01;
          ctx.beginPath();
          ctx.moveTo(sx, RULER_THICKNESS);
          ctx.lineTo(sx, isMajor ? 5 : 13);
          ctx.stroke();
          if (isMajor) {
            ctx.fillText(String(Math.round(x)), Math.floor(px) + 3, 2);
          }
        }

        if (cursorPos) {
          const cx = cursorPos.x * zoom + tx - RULER_THICKNESS;
          if (cx >= 0 && cx <= w) {
            const scx = Math.floor(cx) + 0.5;
            ctx.strokeStyle = '#0ea5e9';
            ctx.beginPath();
            ctx.moveTo(scx, 0);
            ctx.lineTo(scx, RULER_THICKNESS);
            ctx.stroke();
          }
        }
      }
    }

    const leftCanvas = leftCanvasRef.current;
    if (leftCanvas && stageHeight > RULER_THICKNESS) {
      const h = stageHeight - RULER_THICKNESS;
      leftCanvas.width = Math.round(RULER_THICKNESS * dpr);
      leftCanvas.height = Math.round(h * dpr);
      const ctx = leftCanvas.getContext('2d');
      if (ctx) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, RULER_THICKNESS, h);
        ctx.font = '500 9px ui-monospace, SFMono-Regular, monospace';
        ctx.textBaseline = 'top';
        ctx.fillStyle = textColor;
        ctx.strokeStyle = tickColor;
        ctx.lineWidth = 1;

        const startDocY =
          Math.floor((RULER_THICKNESS - ty) / zoom / minorStep) * minorStep;
        const endDocY =
          Math.ceil((stageHeight - ty) / zoom / minorStep) * minorStep;

        for (let y = startDocY; y <= endDocY; y += minorStep) {
          const py = y * zoom + ty - RULER_THICKNESS;
          if (py < 0 || py > h) continue;
          const sy = Math.floor(py) + 0.5;
          const isMajor =
            Math.abs(Math.round(y / majorStep) * majorStep - y) < 0.01;
          ctx.beginPath();
          ctx.moveTo(RULER_THICKNESS, sy);
          ctx.lineTo(isMajor ? 5 : 13, sy);
          ctx.stroke();
          if (isMajor) {
            ctx.save();
            ctx.translate(2, Math.floor(py) + 3);
            ctx.rotate(-Math.PI / 2);
            ctx.textAlign = 'right';
            ctx.fillText(String(Math.round(y)), 0, 0);
            ctx.restore();
          }
        }

        if (cursorPos) {
          const cy = cursorPos.y * zoom + ty - RULER_THICKNESS;
          if (cy >= 0 && cy <= h) {
            const scy = Math.floor(cy) + 0.5;
            ctx.strokeStyle = '#0ea5e9';
            ctx.beginPath();
            ctx.moveTo(0, scy);
            ctx.lineTo(RULER_THICKNESS, scy);
            ctx.stroke();
          }
        }
      }
    }
  }, [cursorPos, stageHeight, stageWidth, viewportTransform, visible]);

  if (!visible) return null;

  return (
    <>
      {/* Top-Left Corner: Clear Guides */}
      <button
        type="button"
        onClick={onClearGuides}
        disabled={guidesCount === 0}
        title={
          guidesCount > 0
            ? `Clear ${guidesCount} guide line(s)`
            : 'Drag from rulers to add guides'
        }
        className="absolute left-0 top-0 z-20 flex h-5 w-5 items-center justify-center border-b border-r border-neutral-200/80 bg-white/90 text-[9px] font-bold text-neutral-500 backdrop-blur-sm transition-colors hover:text-sky-600 disabled:opacity-60 dark:border-neutral-800/80 dark:bg-neutral-900/90 dark:text-neutral-400"
      >
        {guidesCount > 0 ? <Trash2 className="h-2.5 w-2.5" /> : 'px'}
      </button>

      {/* Top Horizontal Ruler (drag down to spawn horizontal guide) */}
      <div
        title="Drag down to add horizontal guide"
        onPointerDown={(e) => {
          e.preventDefault();
          onStartDragGuide('h', e.clientY);
        }}
        className="absolute left-5 right-0 top-0 z-20 h-5 cursor-row-resize border-b border-neutral-200/80 bg-white/90 backdrop-blur-sm dark:border-neutral-800/80 dark:bg-neutral-900/90"
      >
        <canvas ref={topCanvasRef} className="block h-full w-full" />
      </div>

      {/* Left Vertical Ruler (drag right to spawn vertical guide) */}
      <div
        title="Drag right to add vertical guide"
        onPointerDown={(e) => {
          e.preventDefault();
          onStartDragGuide('v', e.clientX);
        }}
        className="absolute bottom-0 left-0 top-5 z-20 w-5 cursor-col-resize border-r border-neutral-200/80 bg-white/90 backdrop-blur-sm dark:border-neutral-800/80 dark:bg-neutral-900/90"
      >
        <canvas ref={leftCanvasRef} className="block h-full w-full" />
      </div>
    </>
  );
}
