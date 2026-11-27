import * as fabric from 'fabric';

import type { CropAspectRatio, CropRect } from '../types/studio';

export type CropHandleKind =
  | 'nw'
  | 'n'
  | 'ne'
  | 'e'
  | 'se'
  | 's'
  | 'sw'
  | 'w'
  | 'move'
  | null;

export function parseCropAspectValue(aspect: CropAspectRatio): number | null {
  if (aspect === 'free') return null;
  const [wStr, hStr] = aspect.split(':');
  const w = Number(wStr);
  const h = Number(hStr);
  return w > 0 && h > 0 ? w / h : null;
}

export function createInitialCropRect(
  boundsWidth: number,
  boundsHeight: number,
  aspect: CropAspectRatio,
  ratioOverride?: number | null
): CropRect {
  const safeW = Math.max(1, Math.round(boundsWidth));
  const safeH = Math.max(1, Math.round(boundsHeight));
  const ratio =
    ratioOverride !== undefined ? ratioOverride : parseCropAspectValue(aspect);
  if (!ratio) {
    return { x: 0, y: 0, width: safeW, height: safeH };
  }

  let w = safeW;
  let h = w / ratio;
  if (h > safeH) {
    h = safeH;
    w = h * ratio;
  }
  const minW = Math.min(16, safeW);
  const minH = Math.min(16, safeH);
  return {
    x: Math.max(0, Math.round((safeW - w) / 2)),
    y: Math.max(0, Math.round((safeH - h) / 2)),
    width: Math.min(safeW, Math.max(minW, Math.round(w))),
    height: Math.min(safeH, Math.max(minH, Math.round(h))),
  };
}

/**
 * Convert a scene point to image-pixel coordinates `[0..origWidth, 0..origHeight]`.
 */
export function scenePointToImagePixel(
  scenePt: { x: number; y: number },
  target: fabric.FabricObject,
  origWidth: number,
  origHeight: number
): { x: number; y: number } {
  const inv = fabric.util.invertTransform(target.calcTransformMatrix());
  const localPt = new fabric.Point(scenePt.x, scenePt.y).transform(inv);
  return {
    x: localPt.x + origWidth / 2,
    y: localPt.y + origHeight / 2,
  };
}

export function hitTestCropHandle(
  scenePt: { x: number; y: number },
  rect: CropRect,
  target: fabric.FabricObject,
  origWidth: number,
  origHeight: number,
  zoom: number
): CropHandleKind {
  const tol = Math.max(8, 12 / Math.max(0.1, zoom));
  const mat = target.calcTransformMatrix();

  const toScene = (px: number, py: number) =>
    new fabric.Point(px - origWidth / 2, py - origHeight / 2).transform(mat);

  const left = rect.x;
  const right = rect.x + rect.width;
  const top = rect.y;
  const bottom = rect.y + rect.height;
  const midX = rect.x + rect.width / 2;
  const midY = rect.y + rect.height / 2;

  const corners: Array<
    [Exclude<CropHandleKind, 'move' | null>, number, number]
  > = [
    ['nw', left, top],
    ['ne', right, top],
    ['se', right, bottom],
    ['sw', left, bottom],
    ['n', midX, top],
    ['e', right, midY],
    ['s', midX, bottom],
    ['w', left, midY],
  ];

  for (const [kind, px, py] of corners) {
    const sp = toScene(px, py);
    if (Math.hypot(scenePt.x - sp.x, scenePt.y - sp.y) <= tol) {
      return kind;
    }
  }

  const pixelPt = scenePointToImagePixel(
    scenePt,
    target,
    origWidth,
    origHeight
  );
  if (
    pixelPt.x >= left &&
    pixelPt.x <= right &&
    pixelPt.y >= top &&
    pixelPt.y <= bottom
  ) {
    return 'move';
  }
  return null;
}

export function applyCropDrag(
  startRect: CropRect,
  handle: Exclude<CropHandleKind, null>,
  dx: number,
  dy: number,
  aspect: CropAspectRatio,
  bounds: { width: number; height: number },
  ratioOverride?: number | null
): CropRect {
  const maxW = Math.max(1, bounds.width);
  const maxH = Math.max(1, bounds.height);
  const minSize = Math.min(16, maxW, maxH);

  if (handle === 'move') {
    const clampedX = Math.max(
      0,
      Math.min(maxW - startRect.width, Math.round(startRect.x + dx))
    );
    const clampedY = Math.max(
      0,
      Math.min(maxH - startRect.height, Math.round(startRect.y + dy))
    );
    return {
      ...startRect,
      x: clampedX,
      y: clampedY,
    };
  }

  const ratio =
    ratioOverride !== undefined ? ratioOverride : parseCropAspectValue(aspect);

  if (!ratio) {
    let left = startRect.x;
    let top = startRect.y;
    let right = startRect.x + startRect.width;
    let bottom = startRect.y + startRect.height;

    if (handle.includes('w')) {
      left = Math.max(0, Math.min(right - minSize, left + dx));
    }
    if (handle.includes('e')) {
      right = Math.min(maxW, Math.max(left + minSize, right + dx));
    }
    if (handle.includes('n')) {
      top = Math.max(0, Math.min(bottom - minSize, top + dy));
    }
    if (handle.includes('s')) {
      bottom = Math.min(maxH, Math.max(top + minSize, bottom + dy));
    }

    const rLeft = Math.max(0, Math.round(left));
    const rTop = Math.max(0, Math.round(top));
    const rRight = Math.min(maxW, Math.round(right));
    const rBottom = Math.min(maxH, Math.round(bottom));

    return {
      x: rLeft,
      y: rTop,
      width: Math.max(minSize, rRight - rLeft),
      height: Math.max(minSize, rBottom - rTop),
    };
  }

  // Aspect-locked dragging strictly clamped within [0..maxW, 0..maxH]
  if (handle === 'n' || handle === 's') {
    let top = startRect.y;
    let bottom = startRect.y + startRect.height;
    if (handle === 'n') {
      top = Math.max(0, Math.min(bottom - minSize, top + dy));
    } else {
      bottom = Math.min(maxH, Math.max(top + minSize, bottom + dy));
    }
    let height = Math.min(bottom - top, maxW / ratio);
    height = Math.max(minSize, height);
    const width = Math.min(maxW, height * ratio);
    if (handle === 'n') {
      top = bottom - height;
    } else {
      bottom = top + height;
    }
    const cx = startRect.x + startRect.width / 2;
    const left = Math.max(0, Math.min(maxW - width, cx - width / 2));
    return {
      x: Math.round(left),
      y: Math.round(top),
      width: Math.max(minSize, Math.round(width)),
      height: Math.max(minSize, Math.round(height)),
    };
  }

  if (handle === 'e' || handle === 'w') {
    let left = startRect.x;
    let right = startRect.x + startRect.width;
    if (handle === 'w') {
      left = Math.max(0, Math.min(right - minSize, left + dx));
    } else {
      right = Math.min(maxW, Math.max(left + minSize, right + dx));
    }
    let width = Math.min(right - left, maxH * ratio);
    width = Math.max(minSize, width);
    const height = Math.min(maxH, width / ratio);
    if (handle === 'w') {
      left = right - width;
    } else {
      right = left + width;
    }
    const cy = startRect.y + startRect.height / 2;
    const top = Math.max(0, Math.min(maxH - height, cy - height / 2));
    return {
      x: Math.round(left),
      y: Math.round(top),
      width: Math.max(minSize, Math.round(width)),
      height: Math.max(minSize, Math.round(height)),
    };
  }

  // Corner handle with opposite corner anchored
  const anchorRight = handle.includes('w');
  const anchorBottom = handle.includes('n');
  const anchorX = anchorRight ? startRect.x + startRect.width : startRect.x;
  const anchorY = anchorBottom ? startRect.y + startRect.height : startRect.y;

  const availW = anchorRight ? anchorX : maxW - anchorX;
  const availH = anchorBottom ? anchorY : maxH - anchorY;
  const maxAllowedW = Math.min(availW, availH * ratio);

  const rawW = anchorRight
    ? anchorX - (startRect.x + dx)
    : startRect.x + startRect.width + dx - anchorX;
  const width = Math.max(minSize, Math.min(maxAllowedW, rawW));
  const height = Math.max(minSize, Math.min(availH, width / ratio));

  const x = anchorRight ? anchorX - width : anchorX;
  const y = anchorBottom ? anchorY - height : anchorY;

  return {
    x: Math.max(0, Math.round(x)),
    y: Math.max(0, Math.round(y)),
    width: Math.max(minSize, Math.round(width)),
    height: Math.max(minSize, Math.round(height)),
  };
}

/**
 * Draw image-local dimmed surround mask, rule-of-thirds grid, and 8 screen-aligned handles.
 */
export function renderCropOverlay(
  ctx: CanvasRenderingContext2D,
  canvas: fabric.Canvas,
  crop: CropRect,
  target: fabric.FabricObject,
  origWidth: number,
  origHeight: number
): void {
  const v = canvas.viewportTransform || [1, 0, 0, 1, 0, 0];
  const fullMat = fabric.util.multiplyTransformMatrices(
    v,
    target.calcTransformMatrix()
  );
  const scaleFactor = Math.max(0.05, Math.hypot(fullMat[0], fullMat[1]));
  const invScale = 1 / scaleFactor;

  const halfW = origWidth / 2;
  const halfH = origHeight / 2;
  const lx = crop.x - halfW;
  const ly = crop.y - halfH;
  const lw = crop.width;
  const lh = crop.height;

  ctx.save();
  ctx.transform(
    fullMat[0],
    fullMat[1],
    fullMat[2],
    fullMat[3],
    fullMat[4],
    fullMat[5]
  );

  // Scrim outside crop box within full uncropped image bounds
  ctx.beginPath();
  ctx.rect(-halfW, -halfH, origWidth, origHeight);
  ctx.rect(lx, ly, lw, lh);
  ctx.fillStyle = 'rgba(15, 23, 42, 0.58)';
  ctx.fill('evenodd');

  // Subtle dashed outline showing full uncropped image boundary
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.lineWidth = 1 * invScale;
  ctx.setLineDash([4 * invScale, 4 * invScale]);
  ctx.strokeRect(-halfW, -halfH, origWidth, origHeight);
  ctx.setLineDash([]);

  // Rule of thirds lines inside crop rect
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.lineWidth = 1 * invScale;
  ctx.beginPath();
  for (let i = 1; i <= 2; i++) {
    const gx = lx + (lw * i) / 3;
    const gy = ly + (lh * i) / 3;
    ctx.moveTo(gx, ly);
    ctx.lineTo(gx, ly + lh);
    ctx.moveTo(lx, gy);
    ctx.lineTo(lx + lw, gy);
  }
  ctx.stroke();

  // Crop border
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 2 * invScale;
  ctx.strokeRect(lx, ly, lw, lh);

  ctx.restore();

  // Screen-space uniform corner & edge midpoint handles
  const hs = 5;
  const handleLocals: Array<[number, number]> = [
    [lx, ly],
    [lx + lw / 2, ly],
    [lx + lw, ly],
    [lx + lw, ly + lh / 2],
    [lx + lw, ly + lh],
    [lx + lw / 2, ly + lh],
    [lx, ly + lh],
    [lx, ly + lh / 2],
  ];

  ctx.save();
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#0284c7';
  ctx.lineWidth = 1.6;
  for (const [px, py] of handleLocals) {
    const sp = new fabric.Point(px, py).transform(fullMat);
    ctx.fillRect(sp.x - hs, sp.y - hs, hs * 2, hs * 2);
    ctx.strokeRect(sp.x - hs, sp.y - hs, hs * 2, hs * 2);
  }
  ctx.restore();
}
