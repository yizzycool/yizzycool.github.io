import type { DocumentConfig, GifExportSettings } from '../types/studio';

import * as fabric from 'fabric';

const MAX_GIF_EXPORT_EDGE = 720;

type ObjectAnimSnapshot = {
  left: number;
  top: number;
  scaleX: number;
  scaleY: number;
  angle: number;
  opacity: number;
  visible: boolean;
};

/**
 * Dynamically encode animated GIFs (layer reveal sequence or keyframed motion presets)
 * using `modern-gif`, clamping dimensions to 720px max for fast browser encoding.
 */
export async function exportCanvasToGif(
  canvas: fabric.Canvas,
  docConfig: DocumentConfig,
  settings: GifExportSettings
): Promise<Blob> {
  const { encode } = await import('modern-gif');

  const maxEdge = Math.max(docConfig.width, docConfig.height, 1);
  const scale =
    maxEdge > MAX_GIF_EXPORT_EDGE ? MAX_GIF_EXPORT_EDGE / maxEdge : 1;
  const outW = Math.max(16, Math.round(docConfig.width * scale));
  const outH = Math.max(16, Math.round(docConfig.height * scale));

  const offscreen = document.createElement('canvas');
  offscreen.width = outW;
  offscreen.height = outH;
  const oCtx = offscreen.getContext('2d', { willReadFrequently: true });
  if (!oCtx) {
    throw new Error('Unable to initialize GIF frame compositor.');
  }

  const objects = canvas.getObjects();
  const snapshots: ObjectAnimSnapshot[] = objects.map((obj) => ({
    left: obj.left ?? 0,
    top: obj.top ?? 0,
    scaleX: obj.scaleX ?? 1,
    scaleY: obj.scaleY ?? 1,
    angle: obj.angle ?? 0,
    opacity: obj.opacity ?? 1,
    visible: obj.visible !== false,
  }));

  const prevVpt = [...canvas.viewportTransform];
  const prevSelection = canvas.getActiveObject();
  const safeFps = Math.max(2, Math.min(24, settings.fps || 10));
  const safeDuration = Math.max(1, Math.min(5, settings.durationSec || 2));

  const frames: Array<{ data: Uint8ClampedArray; delay: number }> = [];

  const captureCurrentFrame = (delayMs: number) => {
    canvas.renderAll();
    const el = canvas.toCanvasElement(scale);
    oCtx.clearRect(0, 0, outW, outH);
    if (docConfig.backgroundType === 'transparent') {
      oCtx.fillStyle = '#ffffff';
      oCtx.fillRect(0, 0, outW, outH);
    }
    oCtx.drawImage(el, 0, 0, outW, outH);
    const imgData = oCtx.getImageData(0, 0, outW, outH);
    frames.push({ data: imgData.data, delay: Math.round(delayMs) });
  };

  try {
    canvas.discardActiveObject();
    canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
    canvas.setDimensions({ width: docConfig.width, height: docConfig.height });

    const isLayersMode = settings.mode === 'layers' && objects.length >= 2;
    const frameCount = isLayersMode
      ? objects.length
      : Math.max(8, Math.round(safeFps * safeDuration));
    const frameDelayMs = isLayersMode
      ? Math.max(200, Math.round(1000 / Math.max(1, safeFps / 3)))
      : Math.max(40, Math.round(1000 / safeFps));

    for (let f = 0; f < frameCount; f++) {
      const progress = f / frameCount;
      const wave = Math.sin(progress * Math.PI * 2);

      objects.forEach((obj, idx) => {
        const base = snapshots[idx];
        obj.set({
          left: base.left,
          top: base.top,
          scaleX: base.scaleX,
          scaleY: base.scaleY,
          angle: base.angle,
          opacity: base.opacity,
          visible: base.visible,
        });

        if (!base.visible) return;

        if (isLayersMode) {
          obj.set({ visible: idx <= f });
        } else if (settings.mode === 'pulse') {
          const factor = 1 + 0.06 * wave;
          obj.set({
            scaleX: base.scaleX * factor,
            scaleY: base.scaleY * factor,
          });
        } else if (settings.mode === 'spin') {
          obj.set({
            angle: (base.angle + progress * 360) % 360,
          });
        } else if (settings.mode === 'bounce') {
          const bounceOffset =
            -Math.abs(wave) * Math.min(36, docConfig.height * 0.04);
          obj.set({
            top: base.top + bounceOffset,
          });
        } else if (settings.mode === 'fade') {
          const alpha =
            0.35 + 0.65 * (0.5 + 0.5 * Math.cos(progress * Math.PI * 2));
          obj.set({ opacity: base.opacity * alpha });
        } else if (settings.mode === 'slide') {
          const slidePhase = Math.min(1, progress * 1.45);
          const eased = 1 - Math.pow(1 - slidePhase, 3);
          const shiftX = (1 - eased) * -docConfig.width * 0.35;
          obj.set({
            left: base.left + shiftX,
            opacity: base.opacity * Math.min(1, eased * 1.1),
          });
        }
        obj.setCoords();
      });

      captureCurrentFrame(frameDelayMs);
    }

    const blob = await encode({
      width: outW,
      height: outH,
      frames,
      format: 'blob',
    });
    return blob;
  } finally {
    objects.forEach((obj, idx) => {
      const base = snapshots[idx];
      obj.set({
        left: base.left,
        top: base.top,
        scaleX: base.scaleX,
        scaleY: base.scaleY,
        angle: base.angle,
        opacity: base.opacity,
        visible: base.visible,
      });
      obj.setCoords();
    });
    if (prevVpt.length === 6) {
      canvas.setViewportTransform(
        prevVpt as [number, number, number, number, number, number]
      );
    }
    if (prevSelection) {
      canvas.setActiveObject(prevSelection);
    }
    canvas.requestRenderAll();
  }
}
