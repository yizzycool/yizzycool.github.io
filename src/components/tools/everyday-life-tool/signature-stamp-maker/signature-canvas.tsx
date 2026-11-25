'use client';

import type { PointerEvent as ReactPointerEvent } from 'react';
import type { SignatureSettings, StageBackdrop, Stroke } from './types';

import { useCallback, useEffect, useRef, useState } from 'react';
import { PenLine, Redo2, Undo2 } from 'lucide-react';

import { DeleteAction } from '@/components/shared/action-button';
import LabelBar from '@/components/tools/common/label-bar';
import { Button } from '@/components/ui/button';
import { Tabs } from '@/components/ui/tabs';
import { hasOpenModalDialog } from '@/hooks/tools/use-tool-hotkeys';
import { cn } from '@/utils/cn';

import {
  LOGICAL_CANVAS_HEIGHT,
  LOGICAL_CANVAS_WIDTH,
  STAGE_BACKDROPS,
  STAGE_BACKDROP_LABELS,
} from './constants';
import { renderStrokeToContext } from './utils/stroke-engine';

interface Props {
  strokes: Stroke[];
  settings: SignatureSettings;
  canUndo: boolean;
  canRedo: boolean;
  onCommitStroke: (stroke: Stroke) => void;
  onUndo: () => void;
  onRedo: () => void;
  onRequestClear: () => void;
  onUpdateSettings: (patch: Partial<SignatureSettings>) => void;
  onTrackpadDrawingChange: (drawing: boolean) => void;
}

const BACKDROP_STYLES: Record<StageBackdrop, string> = {
  paper: 'bg-white text-slate-900',
  checkerboard:
    'bg-[repeating-conic-gradient(#e2e8f0_0%_25%,#ffffff_0%_50%)] bg-[length:16px_16px] dark:bg-[repeating-conic-gradient(#262626_0%_25%,#171717_0%_50%)]',
  dark: 'bg-neutral-950 text-white',
};

function isTextInputFocused(): boolean {
  if (typeof document === 'undefined') return false;
  const active = document.activeElement as HTMLElement | null;
  if (!active || active === document.body) return false;
  if (active.isContentEditable) return true;

  const tag = active.tagName;
  if (tag === 'TEXTAREA' || tag === 'SELECT') return true;
  if (tag === 'INPUT') {
    const inputType = (active as HTMLInputElement).type;
    return (
      inputType !== 'range' &&
      inputType !== 'color' &&
      inputType !== 'checkbox' &&
      inputType !== 'radio' &&
      inputType !== 'button'
    );
  }
  return false;
}

export default function SignatureCanvas({
  strokes,
  settings,
  canUndo,
  canRedo,
  onCommitStroke,
  onUndo,
  onRedo,
  onRequestClear,
  onUpdateSettings,
  onTrackpadDrawingChange,
}: Props) {
  const [isTrackpadDrawing, setIsTrackpadDrawing] = useState(false);

  const updateDrawingState = useCallback(
    (drawing: boolean) => {
      setIsTrackpadDrawing(drawing);
      onTrackpadDrawingChange(drawing);
    },
    [onTrackpadDrawingChange]
  );

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const cursorRingRef = useRef<HTMLDivElement | null>(null);
  const activeStrokeRef = useRef<Stroke | null>(null);
  const activePointerIdRef = useRef<number | null>(null);
  const isTrackpadDrawingRef = useRef(false);
  const isShiftDownRef = useRef(false);
  const isHoveringRef = useRef(false);
  const hoverLogicalRef = useRef<{ x: number; y: number } | null>(null);
  const settingsRef = useRef(settings);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  const toLogicalPoint = useCallback(
    (clientX: number, clientY: number, pressure = 0.5) => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      const rect = canvas.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return null;

      const x = Math.max(
        0,
        Math.min(
          LOGICAL_CANVAS_WIDTH,
          ((clientX - rect.left) / rect.width) * LOGICAL_CANVAS_WIDTH
        )
      );
      const y = Math.max(
        0,
        Math.min(
          LOGICAL_CANVAS_HEIGHT,
          ((clientY - rect.top) / rect.height) * LOGICAL_CANVAS_HEIGHT
        )
      );
      return { x, y, t: performance.now(), pressure };
    },
    []
  );

  const repaintCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr =
      typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    const scale = Math.max(2, dpr);
    const targetW = Math.round(LOGICAL_CANVAS_WIDTH * scale);
    const targetH = Math.round(LOGICAL_CANVAS_HEIGHT * scale);

    if (canvas.width !== targetW || canvas.height !== targetH) {
      canvas.width = targetW;
      canvas.height = targetH;
    }

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.scale(scale, scale);

    for (const stroke of strokes) {
      renderStrokeToContext(ctx, stroke);
    }

    if (activeStrokeRef.current) {
      renderStrokeToContext(ctx, activeStrokeRef.current);
    }

    ctx.restore();
  }, [strokes]);

  useEffect(() => {
    repaintCanvas();
  }, [repaintCanvas]);

  const createStroke = useCallback(
    (firstPoint: {
      x: number;
      y: number;
      t: number;
      pressure: number;
    }): Stroke => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      points: [firstPoint],
      color: settingsRef.current.color,
      baseWidth: settingsRef.current.baseWidth,
      smoothing: settingsRef.current.smoothing,
    }),
    []
  );

  const cancelTrackpadStroke = useCallback(() => {
    if (!isTrackpadDrawingRef.current) return;
    isTrackpadDrawingRef.current = false;
    activeStrokeRef.current = null;
    updateDrawingState(false);
    repaintCanvas();
  }, [repaintCanvas, updateDrawingState]);

  const finishTrackpadStroke = useCallback(() => {
    if (!isTrackpadDrawingRef.current) return;
    isTrackpadDrawingRef.current = false;
    updateDrawingState(false);

    const draft = activeStrokeRef.current;
    activeStrokeRef.current = null;
    if (draft && draft.points.length > 0) {
      onCommitStroke(draft);
    } else {
      repaintCanvas();
    }
  }, [onCommitStroke, repaintCanvas, updateDrawingState]);

  // Trackpad Mode: Hold Shift while hovering to draw without pressing click
  useEffect(() => {
    if (!settings.trackpadMode || typeof window === 'undefined') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) {
        isShiftDownRef.current = false;
        cancelTrackpadStroke();
        return;
      }
      if (e.key !== 'Shift' || e.repeat) return;
      if (hasOpenModalDialog() || isTextInputFocused()) return;

      isShiftDownRef.current = true;
      if (
        isHoveringRef.current &&
        hoverLogicalRef.current &&
        !isTrackpadDrawingRef.current &&
        activePointerIdRef.current === null
      ) {
        isTrackpadDrawingRef.current = true;
        updateDrawingState(true);
        activeStrokeRef.current = createStroke({
          ...hoverLogicalRef.current,
          t: performance.now(),
          pressure: 0.5,
        });
        repaintCanvas();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        isShiftDownRef.current = false;
        finishTrackpadStroke();
      }
    };

    const handleWindowBlur = () => {
      isShiftDownRef.current = false;
      finishTrackpadStroke();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleWindowBlur);
      isShiftDownRef.current = false;
      finishTrackpadStroke();
    };
  }, [
    cancelTrackpadStroke,
    createStroke,
    finishTrackpadStroke,
    repaintCanvas,
    settings.trackpadMode,
    updateDrawingState,
  ]);

  const updateCursorOverlay = (clientX: number, clientY: number) => {
    const ring = cursorRingRef.current;
    const canvas = canvasRef.current;
    if (!ring || !canvas) return;
    const rect = canvas.getBoundingClientRect();
    ring.style.opacity = '1';
    ring.style.transform = `translate3d(${clientX - rect.left}px, ${clientY - rect.top}px, 0)`;
  };

  const handlePointerDown = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    if (activePointerIdRef.current !== null || isTrackpadDrawingRef.current) {
      return;
    }

    const pt = toLogicalPoint(e.clientX, e.clientY, e.pressure ?? 0.5);
    if (!pt) return;

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // ignore if capture is unsupported
    }

    activePointerIdRef.current = e.pointerId;
    activeStrokeRef.current = createStroke(pt);
    repaintCanvas();
  };

  const handlePointerMove = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    isHoveringRef.current = true;
    const hoveredPt = toLogicalPoint(e.clientX, e.clientY, e.pressure ?? 0.5);
    if (hoveredPt) {
      hoverLogicalRef.current = { x: hoveredPt.x, y: hoveredPt.y };
    }

    if (settings.trackpadMode && e.pointerType === 'mouse') {
      updateCursorOverlay(e.clientX, e.clientY);

      if (
        isShiftDownRef.current &&
        !isTrackpadDrawingRef.current &&
        activePointerIdRef.current === null &&
        !hasOpenModalDialog() &&
        hoveredPt
      ) {
        isTrackpadDrawingRef.current = true;
        updateDrawingState(true);
        activeStrokeRef.current = createStroke(hoveredPt);
        repaintCanvas();
        return;
      }
    }

    const isPointerStroke =
      activePointerIdRef.current === e.pointerId && activeStrokeRef.current;
    const isTrackpadStroke =
      isTrackpadDrawingRef.current &&
      e.pointerType === 'mouse' &&
      activeStrokeRef.current;

    if (!isPointerStroke && !isTrackpadStroke) return;

    const native = e.nativeEvent;
    const coalesced =
      typeof native.getCoalescedEvents === 'function'
        ? native.getCoalescedEvents()
        : [native];
    const eventsToProcess = coalesced.length > 0 ? coalesced : [native];

    for (const ev of eventsToProcess) {
      const nextPt = toLogicalPoint(ev.clientX, ev.clientY, ev.pressure ?? 0.5);
      if (nextPt && activeStrokeRef.current) {
        activeStrokeRef.current.points.push(nextPt);
      }
    }

    repaintCanvas();
  };

  const finishPointerStroke = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    if (activePointerIdRef.current !== e.pointerId) return;
    activePointerIdRef.current = null;

    const draft = activeStrokeRef.current;
    activeStrokeRef.current = null;
    if (draft && draft.points.length > 0) {
      onCommitStroke(draft);
    } else {
      repaintCanvas();
    }
  };

  const handlePointerEnter = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    isHoveringRef.current = true;
    const pt = toLogicalPoint(e.clientX, e.clientY, e.pressure ?? 0.5);
    if (pt) {
      hoverLogicalRef.current = { x: pt.x, y: pt.y };
    }
    if (settings.trackpadMode && e.pointerType === 'mouse') {
      updateCursorOverlay(e.clientX, e.clientY);
      if (
        isShiftDownRef.current &&
        !isTrackpadDrawingRef.current &&
        activePointerIdRef.current === null &&
        !hasOpenModalDialog() &&
        pt
      ) {
        isTrackpadDrawingRef.current = true;
        updateDrawingState(true);
        activeStrokeRef.current = createStroke(pt);
        repaintCanvas();
      }
    }
  };

  const handlePointerLeave = () => {
    isHoveringRef.current = false;
    if (cursorRingRef.current) {
      cursorRingRef.current.style.opacity = '0';
    }
    finishTrackpadStroke();
  };

  return (
    <div className="flex flex-col">
      <LabelBar
        label={<span className="whitespace-nowrap">Signature Canvas</span>}
        icon={PenLine}
        headerClassName="min-h-8 flex-wrap gap-2"
      >
        <div className="flex flex-wrap items-center gap-2">
          <Tabs<StageBackdrop>
            tabs={STAGE_BACKDROPS}
            activeTab={settings.backdrop}
            onChange={(backdrop) => onUpdateSettings({ backdrop })}
            tabLabels={STAGE_BACKDROP_LABELS}
            variant="segment"
            size="xs"
            rounded="md"
            className="p-0.5"
            tabClassName="px-2 py-0.5"
          />

          <Button
            variant="outline"
            size="xs"
            rounded="lg"
            icon={Undo2}
            disabled={!canUndo}
            onClick={onUndo}
            title="Undo last stroke (Mod+Z)"
          >
            Undo
          </Button>
          <Button
            variant="outline"
            size="xs"
            rounded="lg"
            icon={Redo2}
            disabled={!canRedo}
            onClick={onRedo}
            title="Redo stroke (Mod+Shift+Z)"
          >
            Redo
          </Button>
          <DeleteAction
            onClick={onRequestClear}
            disabled={strokes.length === 0}
            successToast={false}
          />
        </div>
      </LabelBar>

      {/* Main Canvas Viewport */}
      <div
        className={cn(
          'shadow-2xs relative aspect-[9/4] min-h-[280px] w-full overflow-hidden rounded-2xl border transition-colors sm:min-h-[340px] lg:min-h-[400px]',
          'border-neutral-200/90 dark:border-neutral-800',
          BACKDROP_STYLES[settings.backdrop]
        )}
      >
        {/* Paper Baseline Guide */}
        {settings.guide === 'baseline' && (
          <div
            aria-hidden="true"
            className={cn(
              'pointer-events-none absolute inset-x-10 bottom-[26%] flex items-end gap-2 border-b border-dashed pb-1.5 font-mono text-sm',
              settings.backdrop === 'dark'
                ? 'border-neutral-700 text-neutral-600'
                : 'border-slate-300 text-slate-400'
            )}
          >
            <span>×</span>
          </div>
        )}

        {/* Dot Grid Guide */}
        {settings.guide === 'grid' && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                settings.backdrop === 'dark'
                  ? 'radial-gradient(#525252 1px, transparent 1px)'
                  : 'radial-gradient(#94a3b8 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />
        )}

        {/* Empty State Hint */}
        {strokes.length === 0 && !isTrackpadDrawing && (
          <div
            aria-hidden="true"
            className={cn(
              'pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-6 text-center text-sm font-medium',
              settings.backdrop === 'dark'
                ? 'text-neutral-500'
                : 'text-slate-400'
            )}
          >
            <p>
              {settings.trackpadMode
                ? 'Hover canvas, hold Shift, and glide lightly on your trackpad'
                : 'Sign here using mouse, touch, or stylus'}
            </p>
            <p className="mt-1 text-xs opacity-75">
              100% local in-memory rendering — exported with a transparent
              background
            </p>
          </div>
        )}

        {/* Trackpad Crosshair Pen Tip */}
        {settings.trackpadMode && (
          <div
            ref={cursorRingRef}
            aria-hidden="true"
            className={cn(
              'pointer-events-none absolute left-0 top-0 z-20 -ml-2 -mt-2 h-4 w-4 rounded-full border-2 transition-[background-color,border-color] duration-75',
              isTrackpadDrawing
                ? 'scale-90 border-emerald-500 bg-emerald-400/40'
                : 'border-sky-500 bg-sky-400/20'
            )}
            style={{ opacity: 0 }}
          />
        )}

        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={finishPointerStroke}
          onPointerCancel={finishPointerStroke}
          onPointerEnter={handlePointerEnter}
          onPointerLeave={handlePointerLeave}
          className={cn(
            'relative z-10 h-full w-full touch-none select-none',
            settings.trackpadMode ? 'cursor-none' : 'cursor-crosshair'
          )}
        />
      </div>
    </div>
  );
}
