'use client';

import type { CanvasConfig } from '../types/config';
import type { SnapBounds, SnapGuideLine } from '../utils/snap-guides';

import * as fabric from 'fabric';
import { useEffect, useRef } from 'react';

import { computeSnapAdjustment, drawSnapGuides } from '../utils/snap-guides';

type Props = {
  fabricCanvasRef: React.MutableRefObject<fabric.Canvas | null>;
  canvasConfigRef: React.MutableRefObject<CanvasConfig>;
  isFabricReady: boolean;
  enabled?: boolean;
};

/**
 * Provides magnetic alignment snap guidelines during Free-layout image dragging.
 * Hold Alt (or Option on Mac) while dragging to temporarily bypass snapping.
 */
export default function useSnapGuides({
  fabricCanvasRef,
  canvasConfigRef,
  isFabricReady,
  enabled = true,
}: Props) {
  const activeGuidesRef = useRef<SnapGuideLine[]>([]);
  const enabledRef = useRef(enabled);

  useEffect(() => {
    enabledRef.current = enabled;
    if (!enabled && activeGuidesRef.current.length > 0) {
      activeGuidesRef.current = [];
      fabricCanvasRef.current?.requestRenderAll();
    }
  }, [enabled, fabricCanvasRef]);

  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || !isFabricReady) return;

    const clearGuides = (shouldRender: boolean) => {
      if (activeGuidesRef.current.length === 0) return;
      activeGuidesRef.current = [];
      if (shouldRender) {
        canvas.requestRenderAll();
      }
    };

    const handleObjectMoving = (
      event: fabric.BasicTransformEvent<fabric.TPointerEvent> & {
        target: fabric.FabricObject;
      }
    ) => {
      if (!enabledRef.current || canvasConfigRef.current.layout !== 'free') {
        clearGuides(false);
        return;
      }

      const pointerEvent = event.e as MouseEvent | undefined;
      if (pointerEvent?.altKey) {
        clearGuides(false);
        return;
      }

      const target = event.target;
      if (
        !(target instanceof fabric.FabricImage) &&
        !(target instanceof fabric.ActiveSelection)
      ) {
        return;
      }

      const excluded = new Set<fabric.FabricObject>([target]);
      if (target instanceof fabric.ActiveSelection) {
        for (const child of target.getObjects()) {
          excluded.add(child);
        }
      }

      target.setCoords();
      const movingRect = target.getBoundingRect();
      const movingBounds: SnapBounds = {
        left: movingRect.left,
        top: movingRect.top,
        width: movingRect.width,
        height: movingRect.height,
      };

      const targetBounds: SnapBounds[] = [];
      for (const obj of canvas.getObjects()) {
        if (
          excluded.has(obj) ||
          !(obj instanceof fabric.FabricImage) ||
          obj.visible === false
        ) {
          continue;
        }
        const rect = obj.getBoundingRect();
        targetBounds.push({
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height,
        });
      }

      const displayScale = (canvas.get('_scale') as number | undefined) || 1;
      const threshold = Math.min(18, Math.max(4, 6 / displayScale));

      const { dx, dy, guides } = computeSnapAdjustment(
        movingBounds,
        targetBounds,
        { width: canvas.width, height: canvas.height },
        threshold
      );

      if (dx !== 0 || dy !== 0) {
        target.set({
          left: (target.left ?? 0) + dx,
          top: (target.top ?? 0) + dy,
        });
        target.setCoords();
      }

      activeGuidesRef.current = guides;
    };

    const handleClearOnEnd = () => {
      clearGuides(true);
    };

    const handleAfterRender = (opt: { ctx: CanvasRenderingContext2D }) => {
      if (!opt.ctx || activeGuidesRef.current.length === 0) return;
      drawSnapGuides(opt.ctx, activeGuidesRef.current, canvas);
    };

    canvas.on('object:moving', handleObjectMoving);
    canvas.on('mouse:up', handleClearOnEnd);
    canvas.on('object:modified', handleClearOnEnd);
    canvas.on('selection:cleared', handleClearOnEnd);
    canvas.on('after:render', handleAfterRender);

    return () => {
      canvas.off('object:moving', handleObjectMoving);
      canvas.off('mouse:up', handleClearOnEnd);
      canvas.off('object:modified', handleClearOnEnd);
      canvas.off('selection:cleared', handleClearOnEnd);
      canvas.off('after:render', handleAfterRender);
      activeGuidesRef.current = [];
    };
  }, [fabricCanvasRef, canvasConfigRef, isFabricReady]);
}
