import type { ExtendedFabricObject, MaskBrushSettings } from '../types/studio';

import * as fabric from 'fabric';

const MASK_CANVAS_CACHE = new WeakMap<fabric.FabricObject, HTMLCanvasElement>();

function loadImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });
}

/**
 * Retrieve or create the editable offscreen RGBA mask canvas backing a FabricImage's clipPath.
 */
export async function ensureLayerMaskCanvas(
  obj: fabric.FabricImage
): Promise<HTMLCanvasElement> {
  const cached = MASK_CANVAS_CACHE.get(obj);
  if (cached) return cached;

  const w = Math.max(1, Math.round(obj.width || 1));
  const h = Math.max(1, Math.round(obj.height || 1));
  const maskCanvas = document.createElement('canvas');
  maskCanvas.width = w;
  maskCanvas.height = h;
  const ctx = maskCanvas.getContext('2d');

  if (ctx) {
    const ext = obj as ExtendedFabricObject;
    if (ext._maskDataUrl) {
      try {
        const img = await loadImageElement(ext._maskDataUrl);
        ctx.drawImage(img, 0, 0, w, h);
      } catch {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, w, h);
      }
    } else {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, w, h);
    }
  }

  const clipImg = new fabric.FabricImage(maskCanvas, {
    left: 0,
    top: 0,
    originX: 'center',
    originY: 'center',
  });

  MASK_CANVAS_CACHE.set(obj, maskCanvas);
  const ext = obj as ExtendedFabricObject;
  ext._clipShape = 'none';
  if (!ext._maskDataUrl) {
    ext._maskDataUrl = maskCanvas.toDataURL('image/png');
  }

  obj.set({
    clipPath: clipImg,
    dirty: true,
  });
  obj.setCoords();

  return maskCanvas;
}

/**
 * Restore all serialized raster `_maskDataUrl` masks onto canvas images after JSON load / undo.
 */
export async function hydrateLayerMasks(canvas: fabric.Canvas): Promise<void> {
  const tasks: Array<Promise<unknown>> = [];
  for (const obj of canvas.getObjects()) {
    const ext = obj as ExtendedFabricObject;
    if (obj instanceof fabric.FabricImage && ext._maskDataUrl) {
      MASK_CANVAS_CACHE.delete(obj);
      tasks.push(ensureLayerMaskCanvas(obj));
    }
  }
  await Promise.all(tasks);
}

/**
 * Paint a feathered brush stroke into a FabricImage's editable raster Alpha Mask.
 * Converts scene-space coordinates cleanly through the object's inverted transform matrix.
 */
export function paintLayerMaskStroke(
  obj: fabric.FabricImage,
  fromScene: { x: number; y: number },
  toScene: { x: number; y: number },
  settings: MaskBrushSettings
): void {
  const maskCanvas = MASK_CANVAS_CACHE.get(obj);
  if (!maskCanvas) return;

  const ctx = maskCanvas.getContext('2d');
  if (!ctx) return;

  const inv = fabric.util.invertTransform(obj.calcTransformMatrix());
  const p0 = new fabric.Point(fromScene.x, fromScene.y).transform(inv);
  const p1 = new fabric.Point(toScene.x, toScene.y).transform(inv);

  const halfW = maskCanvas.width / 2;
  const halfH = maskCanvas.height / 2;
  const x0 = p0.x + halfW;
  const y0 = p0.y + halfH;
  const x1 = p1.x + halfW;
  const y1 = p1.y + halfH;

  const avgScale =
    (Math.abs(obj.scaleX || 1) + Math.abs(obj.scaleY || 1)) * 0.5 || 1;
  const radius = Math.max(2, (settings.size * 0.5) / avgScale);
  const featherRatio = Math.max(0.05, Math.min(0.95, settings.feather));
  const innerStop = Math.max(0, 1 - featherRatio);

  const dist = Math.hypot(x1 - x0, y1 - y0);
  const stepDist = Math.max(1.5, radius * 0.25);
  const steps = Math.max(1, Math.ceil(dist / stepDist));

  ctx.save();
  ctx.globalCompositeOperation =
    settings.mode === 'hide' ? 'destination-out' : 'source-over';

  for (let i = 0; i <= steps; i++) {
    const t = steps === 0 ? 0 : i / steps;
    const cx = x0 + (x1 - x0) * t;
    const cy = y0 + (y1 - y0) * t;

    const grad = ctx.createRadialGradient(
      cx,
      cy,
      radius * innerStop,
      cx,
      cy,
      radius
    );
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  if (obj.clipPath) {
    obj.clipPath.set({ dirty: true });
  }
  obj.set({ dirty: true });
}

export function commitLayerMaskSnapshot(obj: fabric.FabricImage): void {
  const maskCanvas = MASK_CANVAS_CACHE.get(obj);
  if (!maskCanvas) return;
  (obj as ExtendedFabricObject)._maskDataUrl =
    maskCanvas.toDataURL('image/png');
}

export async function invertLayerMask(obj: fabric.FabricImage): Promise<void> {
  const maskCanvas = await ensureLayerMaskCanvas(obj);
  const ctx = maskCanvas.getContext('2d');
  if (!ctx) return;

  const imgData = ctx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    data[i] = 255;
    data[i + 1] = 255;
    data[i + 2] = 255;
    data[i + 3] = 255 - data[i + 3];
  }
  ctx.putImageData(imgData, 0, 0);

  if (obj.clipPath) {
    obj.clipPath.set({ dirty: true });
  }
  obj.set({ dirty: true });
  commitLayerMaskSnapshot(obj);
}

export function removeLayerMask(obj: fabric.FabricImage): void {
  MASK_CANVAS_CACHE.delete(obj);
  const ext = obj as ExtendedFabricObject;
  ext._maskDataUrl = undefined;
  obj.set({
    clipPath: undefined,
    dirty: true,
  });
  obj.setCoords();
}

/**
 * Synchronize layers clipped to a base layer underneath (`_clipToLayerId`) so moving
 * or scaling the base layer updates the clipping mask accurately.
 */
export async function syncClippedLayers(canvas: fabric.Canvas): Promise<void> {
  const objects = canvas.getObjects();
  const byId = new Map<string, fabric.FabricObject>();
  for (const obj of objects) {
    const id = (obj as ExtendedFabricObject)._layerId;
    if (id) byId.set(id, obj);
  }

  for (const obj of objects) {
    const ext = obj as ExtendedFabricObject;
    if (!ext._clipToLayerId) continue;

    const base = byId.get(ext._clipToLayerId);
    if (!base) {
      ext._clipToLayerId = undefined;
      obj.set({ clipPath: undefined, dirty: true });
      continue;
    }

    const clonedBase = await base.clone();
    clonedBase.set({
      clipPath: undefined,
      absolutePositioned: true,
      visible: true,
      opacity: 1,
    });
    obj.set({
      clipPath: clonedBase,
      dirty: true,
    });
  }
}

/**
 * Apply an AI-generated single-channel alpha matte onto a FabricImage's non-destructive
 * editable Layer Mask (`clipPath`), scaling cleanly up to the original image dimensions.
 */
export async function applyAlphaMatteToLayerMask(
  obj: fabric.FabricImage,
  alpha: Uint8ClampedArray,
  maskW: number,
  maskH: number
): Promise<void> {
  const maskCanvas = await ensureLayerMaskCanvas(obj);
  const targetCtx = maskCanvas.getContext('2d');
  if (!targetCtx) return;

  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = maskW;
  tempCanvas.height = maskH;
  const tempCtx = tempCanvas.getContext('2d');
  if (!tempCtx) return;

  const imgData = tempCtx.createImageData(maskW, maskH);
  const px = imgData.data;
  for (let i = 0; i < maskW * maskH; i++) {
    const a = alpha[i] ?? 255;
    px[i * 4] = 255;
    px[i * 4 + 1] = 255;
    px[i * 4 + 2] = 255;
    px[i * 4 + 3] = a;
  }
  tempCtx.putImageData(imgData, 0, 0);

  targetCtx.save();
  targetCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
  targetCtx.imageSmoothingEnabled = true;
  targetCtx.imageSmoothingQuality = 'high';
  targetCtx.drawImage(tempCanvas, 0, 0, maskCanvas.width, maskCanvas.height);
  targetCtx.restore();

  if (obj.clipPath) {
    obj.clipPath.set({ dirty: true });
  }
  obj.set({ dirty: true });
  commitLayerMaskSnapshot(obj);
}

/**
 * Extract the non-zero masked region of a FabricImage into a tightly cropped transparent PNG Blob.
 */
export async function extractMaskedSubjectToBlob(
  obj: fabric.FabricImage,
  alpha: Uint8ClampedArray,
  maskW: number,
  maskH: number
): Promise<{
  blob: Blob;
  centerSceneX: number;
  centerSceneY: number;
  scaleX: number;
  scaleY: number;
} | null> {
  const el = obj.getElement();
  if (!el) return null;

  const natW = Math.max(1, Math.round(obj.width || 1));
  const natH = Math.max(1, Math.round(obj.height || 1));

  // Build full-resolution masked canvas
  const fullMask = document.createElement('canvas');
  fullMask.width = maskW;
  fullMask.height = maskH;
  const fmCtx = fullMask.getContext('2d');
  if (!fmCtx) return null;

  const fmData = fmCtx.createImageData(maskW, maskH);
  let minX = maskW;
  let minY = maskH;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < maskH; y++) {
    for (let x = 0; x < maskW; x++) {
      const i = y * maskW + x;
      const a = alpha[i] ?? 0;
      if (a > 12) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
      fmData.data[i * 4] = 255;
      fmData.data[i * 4 + 1] = 255;
      fmData.data[i * 4 + 2] = 255;
      fmData.data[i * 4 + 3] = a;
    }
  }

  if (maxX < minX || maxY < minY) return null;
  fmCtx.putImageData(fmData, 0, 0);

  const scaleToNatX = natW / maskW;
  const scaleToNatY = natH / maskH;
  const cropX = Math.max(0, Math.floor(minX * scaleToNatX));
  const cropY = Math.max(0, Math.floor(minY * scaleToNatY));
  const cropRight = Math.min(natW, Math.ceil((maxX + 1) * scaleToNatX));
  const cropBottom = Math.min(natH, Math.ceil((maxY + 1) * scaleToNatY));
  const cropW = Math.max(1, cropRight - cropX);
  const cropH = Math.max(1, cropBottom - cropY);

  const outCanvas = document.createElement('canvas');
  outCanvas.width = cropW;
  outCanvas.height = cropH;
  const outCtx = outCanvas.getContext('2d');
  if (!outCtx) return null;

  outCtx.drawImage(el, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
  outCtx.globalCompositeOperation = 'destination-in';
  outCtx.drawImage(
    fullMask,
    minX,
    minY,
    maxX - minX + 1,
    maxY - minY + 1,
    0,
    0,
    cropW,
    cropH
  );

  const blob = await new Promise<Blob | null>((resolve) =>
    outCanvas.toBlob(resolve, 'image/png')
  );
  if (!blob) return null;

  const localCx = cropX + cropW / 2 - natW / 2;
  const localCy = cropY + cropH / 2 - natH / 2;
  const sceneCenter = new fabric.Point(localCx, localCy).transform(
    obj.calcTransformMatrix()
  );

  return {
    blob,
    centerSceneX: sceneCenter.x,
    centerSceneY: sceneCenter.y,
    scaleX: obj.scaleX ?? 1,
    scaleY: obj.scaleY ?? 1,
  };
}
