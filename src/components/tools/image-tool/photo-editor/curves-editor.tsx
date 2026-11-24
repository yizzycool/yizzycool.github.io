'use client';

import type { CurveChannel, CurvePoint, CurvesConfig } from './types/studio';

import { RotateCcw } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { PillTabs } from '@/components/ui/tabs';

import { evaluateCurveSpline } from './shaders';

type Props = {
  curves: CurvesConfig;
  onChange: (next: CurvesConfig) => void;
  onChangeEnd: (next: CurvesConfig, label: string) => void;
};

const CHANNELS: CurveChannel[] = ['master', 'red', 'green', 'blue'];

const CHANNEL_COLORS: Record<CurveChannel, string> = {
  master: '#0ea5e9',
  red: '#ef4444',
  green: '#22c55e',
  blue: '#3b82f6',
};

const SVG_W = 240;
const SVG_H = 152;
const PAD = 10;

function toSvgCoords(pt: CurvePoint): { sx: number; sy: number } {
  return {
    sx: PAD + pt.x * (SVG_W - PAD * 2),
    sy: SVG_H - PAD - pt.y * (SVG_H - PAD * 2),
  };
}

function fromClientToNorm(
  svgEl: SVGSVGElement,
  clientX: number,
  clientY: number
): CurvePoint {
  const rect = svgEl.getBoundingClientRect();
  const relX = ((clientX - rect.left) / rect.width) * SVG_W;
  const relY = ((clientY - rect.top) / rect.height) * SVG_H;
  const x = (relX - PAD) / (SVG_W - PAD * 2);
  const y = (SVG_H - PAD - relY) / (SVG_H - PAD * 2);
  return {
    x: Math.max(0, Math.min(1, Number(x.toFixed(3)))),
    y: Math.max(0, Math.min(1, Number(y.toFixed(3)))),
  };
}

/**
 * Interactive 4-channel RGB / Luma monotonic spline Tone Curves editor.
 * Click empty grid to add control points, drag smoothly, or double-click interior points to remove.
 */
export default function CurvesEditor({ curves, onChange, onChangeEnd }: Props) {
  const [channel, setChannel] = useState<CurveChannel>('master');
  const svgRef = useRef<SVGSVGElement | null>(null);
  const dragIdxRef = useRef<number | null>(null);
  const latestCurvesRef = useRef<CurvesConfig>(curves);

  useEffect(() => {
    latestCurvesRef.current = curves;
  }, [curves]);

  const activePoints = curves[channel];

  const splinePathD = useMemo(() => {
    const lut = evaluateCurveSpline(activePoints);
    const cmds: string[] = [];
    for (let i = 0; i < 256; i += 4) {
      const { sx, sy } = toSvgCoords({ x: i / 255, y: lut[i] / 255 });
      cmds.push(`${i === 0 ? 'M' : 'L'} ${sx.toFixed(1)} ${sy.toFixed(1)}`);
    }
    const endPt = toSvgCoords({ x: 1, y: lut[255] / 255 });
    cmds.push(`L ${endPt.sx.toFixed(1)} ${endPt.sy.toFixed(1)}`);
    return cmds.join(' ');
  }, [activePoints]);

  const updateChannelPoints = (nextPts: CurvePoint[], commitLabel?: string) => {
    const sorted = [...nextPts].sort((a, b) => a.x - b.x);
    const nextConfig: CurvesConfig = {
      ...latestCurvesRef.current,
      [channel]: sorted,
    };
    latestCurvesRef.current = nextConfig;
    onChange(nextConfig);
    if (commitLabel) {
      onChangeEnd(nextConfig, commitLabel);
    }
  };

  const handleSvgPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    const svgEl = svgRef.current;
    if (!svgEl) return;

    const pt = fromClientToNorm(svgEl, e.clientX, e.clientY);
    const hitIdx = activePoints.findIndex(
      (p) => Math.hypot(p.x - pt.x, p.y - pt.y) < 0.065
    );

    if (hitIdx !== -1) {
      dragIdxRef.current = hitIdx;
    } else {
      const next = [...activePoints, pt].sort((a, b) => a.x - b.x);
      dragIdxRef.current = next.findIndex(
        (p) => Math.abs(p.x - pt.x) < 1e-4 && Math.abs(p.y - pt.y) < 1e-4
      );
      updateChannelPoints(next);
    }

    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handleSvgPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const idx = dragIdxRef.current;
    const svgEl = svgRef.current;
    if (idx === null || !svgEl) return;

    const pt = fromClientToNorm(svgEl, e.clientX, e.clientY);
    const current = [...latestCurvesRef.current[channel]];
    if (!current[idx]) return;

    const minX = idx === 0 ? 0 : current[idx - 1].x + 0.02;
    const maxX = idx === current.length - 1 ? 1 : current[idx + 1].x - 0.02;

    current[idx] = {
      x: Math.max(minX, Math.min(maxX, pt.x)),
      y: pt.y,
    };
    updateChannelPoints(current);
  };

  const handleSvgPointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    if (dragIdxRef.current === null) return;
    dragIdxRef.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    onChangeEnd(latestCurvesRef.current, 'Adjust Tone Curves');
  };

  const handleRemovePoint = (idx: number) => {
    if (idx === 0 || idx === activePoints.length - 1) return;
    const next = activePoints.filter((_, i) => i !== idx);
    updateChannelPoints(next, 'Remove Curve Point');
  };

  const handleResetChannel = () => {
    updateChannelPoints(
      [
        { x: 0, y: 0 },
        { x: 1, y: 1 },
      ],
      'Reset Tone Curve'
    );
  };

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between gap-2">
        <PillTabs<CurveChannel>
          tabs={CHANNELS}
          activeTab={channel}
          onChange={setChannel}
          tabLabels={{
            master: 'RGB',
            red: 'R',
            green: 'G',
            blue: 'B',
          }}
          size="xs"
          fullWidth
          tabClassName="px-2"
        />
        <Button
          variant="ghost"
          size="xs"
          icon={RotateCcw}
          onClick={handleResetChannel}
          title="Reset Active Curve Channel"
          aria-label="Reset Curve Channel"
          className="!px-1.5"
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-neutral-200/80 bg-neutral-50/80 p-1.5 dark:border-neutral-800/80 dark:bg-neutral-950/70">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          onPointerDown={handleSvgPointerDown}
          onPointerMove={handleSvgPointerMove}
          onPointerUp={handleSvgPointerUp}
          className="h-[152px] w-full cursor-crosshair touch-none select-none"
        >
          {/* 4x4 Grid */}
          {[0.25, 0.5, 0.75].map((t) => {
            const p = toSvgCoords({ x: t, y: t });
            return (
              <g key={t}>
                <line
                  x1={p.sx}
                  y1={PAD}
                  x2={p.sx}
                  y2={SVG_H - PAD}
                  stroke="currentColor"
                  className="text-neutral-200 dark:text-neutral-800"
                  strokeWidth={1}
                />
                <line
                  x1={PAD}
                  y1={p.sy}
                  x2={SVG_W - PAD}
                  y2={p.sy}
                  stroke="currentColor"
                  className="text-neutral-200 dark:text-neutral-800"
                  strokeWidth={1}
                />
              </g>
            );
          })}

          {/* Border */}
          <rect
            x={PAD}
            y={PAD}
            width={SVG_W - PAD * 2}
            height={SVG_H - PAD * 2}
            fill="none"
            stroke="currentColor"
            className="text-neutral-300 dark:text-neutral-700"
            strokeWidth={1}
          />

          {/* Identity Diagonal */}
          <line
            x1={PAD}
            y1={SVG_H - PAD}
            x2={SVG_W - PAD}
            y2={PAD}
            stroke="currentColor"
            strokeDasharray="3 3"
            className="text-neutral-300 dark:text-neutral-700"
            strokeWidth={1}
          />

          {/* Smooth Spline Curve */}
          <path
            d={splinePathD}
            fill="none"
            stroke={CHANNEL_COLORS[channel]}
            strokeWidth={2}
            strokeLinecap="round"
          />

          {/* Control Points */}
          {activePoints.map((pt, idx) => {
            const { sx, sy } = toSvgCoords(pt);
            return (
              <circle
                key={`${idx}_${pt.x.toFixed(2)}`}
                cx={sx}
                cy={sy}
                r={4.5}
                fill="#ffffff"
                stroke={CHANNEL_COLORS[channel]}
                strokeWidth={2}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  handleRemovePoint(idx);
                }}
                className="cursor-grab"
              />
            );
          })}
        </svg>
        <p className="px-1 pt-0.5 text-[10px] text-neutral-400 dark:text-neutral-500">
          Click to add point · Drag to shape · Double-click point to remove
        </p>
      </div>
    </div>
  );
}
