'use client';

import type { WeightedSlice } from './types';

import { useEffect, useRef, useState } from 'react';
import { Dices, RotateCcw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';

import { getContrastingTextColor } from './utils/wheel-math';

type Props = {
  slices: WeightedSlice[];
  rotationRad: number;
  isSpinning: boolean;
  pointerDeflection: number;
  eliminatedCount: number;
  onSpin: () => void;
  onRestoreEliminated: () => void;
};

function truncateLabel(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let truncated = text;
  while (
    truncated.length > 1 &&
    ctx.measureText(`${truncated}…`).width > maxWidth
  ) {
    truncated = truncated.slice(0, -1);
  }
  return `${truncated}…`;
}

/**
 * Modern High-DPI HTML5 Canvas spinner wheel with a soft architectural bezel,
 * luminous radial wedge shading, hairline dividers, pearl rim pegs, and a tactile SPIN dial.
 */
export default function WheelCanvas({
  slices,
  rotationRad,
  isSpinning,
  pointerDeflection,
  eliminatedCount,
  onSpin,
  onRestoreEliminated,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [stageSize, setStageSize] = useState<number>(400);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const next = Math.max(
        240,
        Math.min(420, Math.floor(entry.contentRect.width))
      );
      setStageSize((prev) => (prev === next ? prev : next));
    });

    observer.observe(el);
    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    canvas.width = stageSize * dpr;
    canvas.height = stageSize * dpr;
    canvas.style.width = `${stageSize}px`;
    canvas.style.height = `${stageSize}px`;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, stageSize, stageSize);

    const cx = stageSize / 2;
    const cy = stageSize / 2;
    const wheelRadius = stageSize / 2 - 2;

    if (slices.length === 0) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, wheelRadius, 0, Math.PI * 2);
      ctx.fillStyle = '#e2e8f0';
      ctx.fill();
      ctx.restore();
      return;
    }

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rotationRad);

    // Draw weighted slices
    for (const slice of slices) {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, wheelRadius, slice.startAngle, slice.endAngle);
      ctx.closePath();
      ctx.fillStyle = slice.entry.color;
      ctx.fill();

      // Hairline divider between wedges
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.72)';
      ctx.stroke();

      // Radial label along slice bisector
      const arcAngle = slice.endAngle - slice.startAngle;
      if (arcAngle > 0.11) {
        const scaleFactor =
          slices.length <= 4 ? 1.08 : slices.length > 14 ? 0.85 : 1;
        const fontSize = Math.max(
          11,
          Math.min(17, Math.floor((wheelRadius / 13.5) * scaleFactor))
        );
        const hubClearance = Math.max(46, wheelRadius * 0.27);
        const labelMaxWidth = wheelRadius - hubClearance - 24;
        const textColor = getContrastingTextColor(slice.entry.color);

        ctx.save();
        ctx.rotate(slice.midAngle);
        ctx.font = `600 ${fontSize}px system-ui, -apple-system, BlinkMacSystemFont, sans-serif`;
        ctx.fillStyle = textColor;
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        if (textColor === '#ffffff') {
          ctx.shadowColor = 'rgba(15, 23, 42, 0.2)';
          ctx.shadowBlur = 2;
        }
        const label = truncateLabel(ctx, slice.entry.label, labelMaxWidth);
        ctx.fillText(label, wheelRadius - 22, 0);
        ctx.restore();
      }
    }

    // Subtle soft radial sheen across the entire wheel face
    const sheenGrad = ctx.createRadialGradient(
      0,
      0,
      wheelRadius * 0.18,
      0,
      0,
      wheelRadius
    );
    sheenGrad.addColorStop(0, 'rgba(255, 255, 255, 0.16)');
    sheenGrad.addColorStop(0.65, 'rgba(255, 255, 255, 0.04)');
    sheenGrad.addColorStop(1, 'rgba(15, 23, 42, 0.07)');
    ctx.beginPath();
    ctx.arc(0, 0, wheelRadius, 0, Math.PI * 2);
    ctx.fillStyle = sheenGrad;
    ctx.fill();

    // Crisp inner perimeter ring & delicate pearl boundary pegs
    ctx.beginPath();
    ctx.arc(0, 0, wheelRadius - 1, 0, Math.PI * 2);
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
    ctx.stroke();

    const pegRadius = Math.max(2.5, wheelRadius * 0.015);
    const pegOrbit = wheelRadius - pegRadius - 5;
    for (const slice of slices) {
      const px = Math.cos(slice.startAngle) * pegOrbit;
      const py = Math.sin(slice.startAngle) * pegOrbit;

      ctx.beginPath();
      ctx.arc(px, py, pegRadius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
      ctx.fill();
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(15, 23, 42, 0.18)';
      ctx.stroke();
    }

    ctx.restore();
  }, [rotationRad, slices, stageSize]);

  const canSpin = slices.length >= 2;

  return (
    <div className="relative flex flex-col items-center justify-center rounded-2xl border border-neutral-200/80 bg-white/80 p-5 shadow-sm backdrop-blur-md sm:p-7 dark:border-neutral-800/80 dark:bg-neutral-900/60">
      {/* Subtle Dot-Grid Studio Stage */}
      <div
        className={cn(
          'relative flex w-full items-center justify-center rounded-xl border p-5 sm:p-7',
          'border-neutral-200/70 bg-neutral-50/70 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]',
          'dark:border-neutral-800/80 dark:bg-neutral-950/60 dark:bg-[radial-gradient(#262626_1px,transparent_1px)]'
        )}
      >
        <div className="relative flex w-full max-w-[440px] items-center justify-center">
          {/* Refined 12 O'Clock Teardrop Pointer */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-3 left-1/2 z-20 -translate-x-1/2"
          >
            <div
              className="origin-top transition-transform duration-75 ease-out"
              style={{ transform: `rotate(${pointerDeflection}deg)` }}
            >
              <svg
                width="30"
                height="38"
                viewBox="0 0 30 38"
                fill="none"
                className="drop-shadow-[0_4px_8px_rgba(15,23,42,0.22)]"
              >
                <path
                  d="M15 35L4.5 14.5C2.1 9.8 5.5 3 11 3H19C24.5 3 27.9 9.8 25.5 14.5L15 35Z"
                  className="fill-slate-900 stroke-white dark:fill-white dark:stroke-neutral-900"
                  strokeWidth="2.5"
                />
                <circle
                  cx="15"
                  cy="12"
                  r="3"
                  className="fill-sky-400 dark:fill-sky-500"
                />
              </svg>
            </div>
          </div>

          {/* Soft Outer Architectural Bezel */}
          <div
            className={cn(
              'relative flex aspect-square w-full items-center justify-center rounded-full p-2.5 transition-shadow duration-300',
              'bg-white shadow-[0_14px_38px_-10px_rgba(15,23,42,0.16)] ring-1 ring-slate-200/90',
              'dark:bg-neutral-800/95 dark:shadow-[0_16px_44px_-10px_rgba(0,0,0,0.6)] dark:ring-neutral-700/80'
            )}
          >
            <div
              ref={containerRef}
              className="relative flex aspect-square w-full items-center justify-center"
            >
              {/* Canvas Wheel */}
              <canvas
                ref={canvasRef}
                onClick={canSpin && !isSpinning ? onSpin : undefined}
                className={cn(
                  'rounded-full transition-opacity duration-200',
                  canSpin && !isSpinning && 'cursor-pointer',
                  !canSpin && 'opacity-35'
                )}
              />

              {/* Center Tactile Spin Dial Hub */}
              {canSpin ? (
                <button
                  type="button"
                  onClick={onSpin}
                  disabled={isSpinning}
                  aria-label="Spin the wheel"
                  className={cn(
                    'absolute left-1/2 top-1/2 z-10 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200/90 bg-white text-xs font-bold uppercase tracking-widest text-slate-800 shadow-[0_6px_20px_rgba(15,23,42,0.18)] ring-4 ring-white/75 transition-all sm:h-[72px] sm:w-[72px] sm:text-sm dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:ring-neutral-800/80',
                    !isSpinning
                      ? 'hover:scale-105 hover:border-sky-500/40 hover:text-sky-600 active:scale-95 dark:hover:border-sky-400/50 dark:hover:text-sky-400'
                      : 'cursor-not-allowed opacity-90'
                  )}
                >
                  {isSpinning ? '···' : 'SPIN'}
                </button>
              ) : (
                <div className="absolute inset-4 z-10 flex flex-col items-center justify-center gap-3 rounded-full bg-white/85 p-6 text-center backdrop-blur-sm dark:bg-neutral-900/85">
                  <Dices size={28} className="text-sky-500" />
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
                      {eliminatedCount > 0 && slices.length < 2
                        ? 'Round Complete!'
                        : 'Add at least 2 options'}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      {eliminatedCount > 0 && slices.length < 2
                        ? 'Restore eliminated options to keep playing.'
                        : 'Use the panel to add items or load a quick preset.'}
                    </p>
                  </div>
                  {eliminatedCount > 0 && (
                    <Button
                      variant="primary"
                      size="xs"
                      rounded="full"
                      icon={RotateCcw}
                      onClick={onRestoreEliminated}
                    >
                      Restore {eliminatedCount} Eliminated
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
