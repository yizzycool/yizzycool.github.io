'use client';

import type { DocumentConfig, UserGuide } from '../types/studio';
import type { SnapBounds, SnapGuideLine } from '../utils/snap-guides';

import * as fabric from 'fabric';
import { useEffect, useRef } from 'react';

import { computeSnapAdjustment, drawSnapGuides } from '../utils/snap-guides';

type Props = {
  fabricCanvasRef: React.MutableRefObject<fabric.Canvas | null>;
  docConfigRef: React.MutableRefObject<DocumentConfig>;
  userGuidesRef: React.MutableRefObject<UserGuide[]>;
  canvasVersion: number;
  enabled: boolean;
};

/**
 * Magnetic alignment snap guidelines in artboard coordinate space (including user ruler guides)
 * plus 90-degree rotation angle snapping.
 * Hold Alt (or Option on Mac) while dragging/rotating to temporarily bypass snapping.
 */
export default function useSnapGuides({
  fabricCanvasRef,
  docConfigRef,
  userGuidesRef,
  canvasVersion,
  enabled,
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
    if (!canvas || canvasVersion === 0) return;

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
      if (!enabledRef.current) {
        clearGuides(false);
        return;
      }

      const pointerEvent = event.e as MouseEvent | undefined;
      if (pointerEvent?.altKey) {
        clearGuides(false);
        return;
      }

      const target = event.target;
      if (!target) return;

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
        if (excluded.has(obj) || obj.visible === false) {
          continue;
        }
        obj.setCoords();
        const rect = obj.getBoundingRect();
        targetBounds.push({
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height,
        });
      }

      const zoom = canvas.viewportTransform?.[0] || 1;
      const threshold = Math.min(32, Math.max(5, 8 / zoom));
      const { width, height } = docConfigRef.current;

      const { dx, dy, guides } = computeSnapAdjustment(
        movingBounds,
        targetBounds,
        { width, height },
        threshold,
        userGuidesRef.current
      );

      if (dx !== 0 || dy !== 0) {
        target.set({
          left: (target.left ?? 0) + dx,
          top: (target.top ?? 0) + dy,
        });
        target.setCoords();
      }

      activeGuidesRef.current = guides;
      if (guides.length > 0) {
        canvas.requestRenderAll();
      }
    };

    const handleObjectRotating = (
      event: fabric.BasicTransformEvent<fabric.TPointerEvent> & {
        target: fabric.FabricObject;
      }
    ) => {
      if (!enabledRef.current) return;
      const pointerEvent = event.e as MouseEvent | undefined;
      if (pointerEvent?.altKey) return;

      const target = event.target;
      if (!target) return;

      const angle = target.angle ?? 0;
      const snapped = Math.round(angle / 90) * 90;
      if (Math.abs(angle - snapped) <= 5) {
        target.set({ angle: snapped });
        target.setCoords();
      }
    };

    const handleClearOnEnd = () => {
      clearGuides(true);
    };

    const handleAfterRender = (opt: { ctx: CanvasRenderingContext2D }) => {
      if (
        !opt.ctx ||
        opt.ctx !== canvas.getContext() ||
        activeGuidesRef.current.length === 0
      ) {
        return;
      }
      drawSnapGuides(opt.ctx, activeGuidesRef.current, canvas);
    };

    canvas.on('object:moving', handleObjectMoving);
    canvas.on('object:rotating', handleObjectRotating);
    canvas.on('mouse:up', handleClearOnEnd);
    canvas.on('object:modified', handleClearOnEnd);
    canvas.on('selection:cleared', handleClearOnEnd);
    canvas.on('after:render', handleAfterRender);

    return () => {
      canvas.off('object:moving', handleObjectMoving);
      canvas.off('object:rotating', handleObjectRotating);
      canvas.off('mouse:up', handleClearOnEnd);
      canvas.off('object:modified', handleClearOnEnd);
      canvas.off('selection:cleared', handleClearOnEnd);
      canvas.off('after:render', handleAfterRender);
      activeGuidesRef.current = [];
    };
  }, [canvasVersion, docConfigRef, fabricCanvasRef, userGuidesRef]);
}
