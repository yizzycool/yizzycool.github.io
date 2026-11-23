'use client';

import type { PointerEvent as ReactPointerEvent } from 'react';
import type { NormalizedRgba } from './types';

import { SlidersHorizontal } from 'lucide-react';
import { useRef, useState } from 'react';

import LabelBar from '@/components/tools/common/label-bar';
import { cn } from '@/utils/cn';

import { hsvToRgba, rgbaToHsv } from './utils/color-converter';
import { clamp } from './utils/color-parser';

type Props = {
  rgba: NormalizedRgba;
  onChange: (next: NormalizedRgba) => void;
};

export default function ColorStudioPicker({ rgba, onChange }: Props) {
  const padRef = useRef<HTMLDivElement>(null);
  const [savedHue, setSavedHue] = useState<number>(() => rgbaToHsv(rgba).h);

  const hsv = rgbaToHsv(rgba);
  const effectiveHue = hsv.s > 0 && hsv.v > 0 ? hsv.h : savedHue;
  const alphaPercent = Math.round(rgba.a * 100);
  const rgbOpaque = `rgb(${rgba.r}, ${rgba.g}, ${rgba.b})`;

  const updateFromPadPointer = (e: ReactPointerEvent<HTMLDivElement>) => {
    const pad = padRef.current;
    if (!pad) return;
    const rect = pad.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    const xRatio = clamp((e.clientX - rect.left) / rect.width, 0, 1);
    const yRatio = clamp((e.clientY - rect.top) / rect.height, 0, 1);
    const nextSat = Math.round(xRatio * 100);
    const nextVal = Math.round((1 - yRatio) * 100);

    if (nextSat > 0 && nextVal > 0) {
      setSavedHue(effectiveHue);
    }
    onChange(hsvToRgba(effectiveHue, nextSat, nextVal, rgba.a));
  };

  const handlePadPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    updateFromPadPointer(e);
  };

  const handlePadPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
    updateFromPadPointer(e);
  };

  const handleHueChange = (nextHue: number) => {
    setSavedHue(nextHue);
    onChange(hsvToRgba(nextHue, hsv.s, hsv.v, rgba.a));
  };

  const handleAlphaChange = (nextAlphaPercent: number) => {
    onChange({
      ...rgba,
      a: Number((clamp(nextAlphaPercent, 0, 100) / 100).toFixed(2)),
    });
  };

  return (
    <section>
      <LabelBar
        icon={SlidersHorizontal}
        label="Interactive Studio Pad"
        description="Drag the 2D spectrum pad, hue bar, and opacity slider to dial in exact tones."
      />

      <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-white/75 p-4 shadow-sm backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-900/60">
        {/* 2D Saturation / Value Pad */}
        <div
          ref={padRef}
          role="slider"
          tabIndex={0}
          aria-label="Saturation and brightness pad"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={hsv.s}
          aria-valuetext={`Saturation ${hsv.s}%, Brightness ${hsv.v}%`}
          onPointerDown={handlePadPointerDown}
          onPointerMove={handlePadPointerMove}
          onKeyDown={(e) => {
            const step = e.shiftKey ? 5 : 1;
            if (e.key === 'ArrowLeft') {
              e.preventDefault();
              onChange(
                hsvToRgba(
                  effectiveHue,
                  clamp(hsv.s - step, 0, 100),
                  hsv.v,
                  rgba.a
                )
              );
            } else if (e.key === 'ArrowRight') {
              e.preventDefault();
              onChange(
                hsvToRgba(
                  effectiveHue,
                  clamp(hsv.s + step, 0, 100),
                  hsv.v,
                  rgba.a
                )
              );
            } else if (e.key === 'ArrowUp') {
              e.preventDefault();
              onChange(
                hsvToRgba(
                  effectiveHue,
                  hsv.s,
                  clamp(hsv.v + step, 0, 100),
                  rgba.a
                )
              );
            } else if (e.key === 'ArrowDown') {
              e.preventDefault();
              onChange(
                hsvToRgba(
                  effectiveHue,
                  hsv.s,
                  clamp(hsv.v - step, 0, 100),
                  rgba.a
                )
              );
            }
          }}
          className="relative h-48 w-full cursor-crosshair touch-none select-none overflow-hidden rounded-xl border border-black/10 dark:border-white/10"
          style={{ backgroundColor: `hsl(${effectiveHue}, 100%, 50%)` }}
        >
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              backgroundImage:
                'linear-gradient(to right, #ffffff, rgba(255, 255, 255, 0))',
            }}
          />
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              backgroundImage:
                'linear-gradient(to top, #000000, rgba(0, 0, 0, 0))',
            }}
          />

          {/* Crosshair Indicator */}
          <span
            aria-hidden="true"
            className={cn(
              'pointer-events-none absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1.5px_rgba(0,0,0,0.45)]'
            )}
            style={{
              left: `${hsv.s}%`,
              top: `${100 - hsv.v}%`,
            }}
          />
        </div>

        {/* Hue Spectrum Slider */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-neutral-600 dark:text-neutral-300">
              Hue
            </span>
            <span className="font-mono font-semibold text-neutral-800 dark:text-neutral-100">
              {effectiveHue}°
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={360}
            value={effectiveHue}
            onChange={(e) => handleHueChange(Number(e.target.value))}
            aria-label="Hue angle"
            className="h-3 w-full cursor-pointer appearance-none rounded-full border border-black/10 outline-none dark:border-white/10"
            style={{
              background:
                'linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)',
            }}
          />
        </div>

        {/* Opacity / Alpha Slider */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-neutral-600 dark:text-neutral-300">
              Opacity
            </span>
            <span className="font-mono font-semibold text-neutral-800 dark:text-neutral-100">
              {alphaPercent}%
            </span>
          </div>
          <div
            className="relative h-3 w-full overflow-hidden rounded-full border border-black/10 dark:border-white/10"
            style={{
              backgroundImage:
                'linear-gradient(45deg, #d4d4d4 25%, transparent 25%), linear-gradient(-45deg, #d4d4d4 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #d4d4d4 75%), linear-gradient(-45deg, transparent 75%, #d4d4d4 75%)',
              backgroundSize: '8px 8px',
              backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px',
            }}
          >
            <input
              type="range"
              min={0}
              max={100}
              value={alphaPercent}
              onChange={(e) => handleAlphaChange(Number(e.target.value))}
              aria-label="Color opacity"
              className="relative z-10 h-full w-full cursor-pointer appearance-none bg-transparent outline-none"
              style={{
                background: `linear-gradient(to right, transparent, ${rgbOpaque})`,
              }}
            />
          </div>
        </div>

        {/* Live HSVA Readout Footer */}
        <div className="grid grid-cols-4 gap-2 pt-1 text-center font-mono text-[11px]">
          <div className="rounded-lg bg-neutral-100/80 px-2 py-1.5 dark:bg-neutral-800/70">
            <span className="text-neutral-400">H </span>
            <span className="font-semibold text-neutral-800 dark:text-neutral-100">
              {effectiveHue}°
            </span>
          </div>
          <div className="rounded-lg bg-neutral-100/80 px-2 py-1.5 dark:bg-neutral-800/70">
            <span className="text-neutral-400">S </span>
            <span className="font-semibold text-neutral-800 dark:text-neutral-100">
              {hsv.s}%
            </span>
          </div>
          <div className="rounded-lg bg-neutral-100/80 px-2 py-1.5 dark:bg-neutral-800/70">
            <span className="text-neutral-400">V </span>
            <span className="font-semibold text-neutral-800 dark:text-neutral-100">
              {hsv.v}%
            </span>
          </div>
          <div className="rounded-lg bg-neutral-100/80 px-2 py-1.5 dark:bg-neutral-800/70">
            <span className="text-neutral-400">A </span>
            <span className="font-semibold text-neutral-800 dark:text-neutral-100">
              {alphaPercent}%
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
