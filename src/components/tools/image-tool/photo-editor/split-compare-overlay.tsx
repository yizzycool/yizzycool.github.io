'use client';

import { MoveHorizontal } from 'lucide-react';
import { useRef } from 'react';

type Props = {
  beforeDataUrl: string | null;
  splitPercent: number;
  onChangeSplit: (nextPercent: number) => void;
};

/**
 * Interactive Before / After vertical split-wipe comparison overlay rendered
 * directly on top of the active Fabric viewport.
 */
export default function SplitCompareOverlay({
  beforeDataUrl,
  splitPercent,
  onChangeSplit,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef(false);

  if (!beforeDataUrl) return null;

  const updateFromClientX = (clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = ((clientX - rect.left) / Math.max(1, rect.width)) * 100;
    onChangeSplit(Math.max(4, Math.min(96, pct)));
  };

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute inset-0 z-10 select-none overflow-hidden"
    >
      {/* Left side: Unfiltered "Before" Snapshot clipped cleanly */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={beforeDataUrl}
        alt="Before adjustment snapshot"
        draggable={false}
        style={{
          clipPath: `inset(0 ${100 - splitPercent}% 0 0)`,
        }}
        className="pointer-events-none absolute inset-0 h-full w-full object-fill"
      />

      {/* Corner Status Badges */}
      <div className="absolute left-8 top-8 rounded-full border border-neutral-200/80 bg-white/85 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-neutral-700 shadow-sm backdrop-blur-md dark:border-neutral-700/80 dark:bg-neutral-900/85 dark:text-neutral-200">
        Original
      </div>
      <div className="absolute right-4 top-8 rounded-full border border-sky-400/50 bg-sky-500/85 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm backdrop-blur-md">
        Edited
      </div>

      {/* Draggable Split Handle */}
      <div
        role="slider"
        aria-label="Before and After split position"
        aria-valuemin={4}
        aria-valuemax={96}
        aria-valuenow={Math.round(splitPercent)}
        tabIndex={0}
        style={{ left: `${splitPercent}%` }}
        onPointerDown={(e) => {
          e.preventDefault();
          draggingRef.current = true;
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (!draggingRef.current) return;
          updateFromClientX(e.clientX);
        }}
        onPointerUp={(e) => {
          draggingRef.current = false;
          if (e.currentTarget.hasPointerCapture(e.pointerId)) {
            e.currentTarget.releasePointerCapture(e.pointerId);
          }
        }}
        className="pointer-events-auto absolute inset-y-0 -ml-3 flex w-6 cursor-ew-resize items-center justify-center"
      >
        <div className="h-full w-0.5 bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.85)]" />
        <div className="absolute flex h-7 w-7 items-center justify-center rounded-full border border-sky-400 bg-white text-sky-600 shadow-md dark:bg-neutral-900 dark:text-sky-400">
          <MoveHorizontal className="h-3.5 w-3.5" />
        </div>
      </div>
    </div>
  );
}
