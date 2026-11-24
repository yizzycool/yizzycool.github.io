import type * as fabric from 'fabric';
import type {
  CropAspectRatio,
  CropRect,
  DocumentConfig,
} from '../types/studio';

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
  docWidth: number,
  docHeight: number,
  aspect: CropAspectRatio
): CropRect {
  const ratio = parseCropAspectValue(aspect);
  if (!ratio) {
    return { x: 0, y: 0, width: docWidth, height: docHeight };
  }

  let w = docWidth;
  let h = w / ratio;
  if (h > docHeight) {
    h = docHeight;
    w = h * ratio;
  }
  return {
    x: Math.round((docWidth - w) / 2),
    y: Math.round((docHeight - h) / 2),
    width: Math.max(32, Math.round(w)),
    height: Math.max(32, Math.round(h)),
  };
}

export function hitTestCropHandle(
  pt: { x: number; y: number },
  rect: CropRect,
  zoom: number
): CropHandleKind {
  const tol = Math.max(8, 12 / Math.max(0.1, zoom));
  const left = rect.x;
  const right = rect.x + rect.width;
  const top = rect.y;
  const bottom = rect.y + rect.height;
  const midX = rect.x + rect.width / 2;
  const midY = rect.y + rect.height / 2;

  if (Math.hypot(pt.x - left, pt.y - top) <= tol) return 'nw';
  if (Math.hypot(pt.x - right, pt.y - top) <= tol) return 'ne';
  if (Math.hypot(pt.x - right, pt.y - bottom) <= tol) return 'se';
  if (Math.hypot(pt.x - left, pt.y - bottom) <= tol) return 'sw';

  if (Math.hypot(pt.x - midX, pt.y - top) <= tol) return 'n';
  if (Math.hypot(pt.x - right, pt.y - midY) <= tol) return 'e';
  if (Math.hypot(pt.x - midX, pt.y - bottom) <= tol) return 's';
  if (Math.hypot(pt.x - left, pt.y - midY) <= tol) return 'w';

  if (pt.x >= left && pt.x <= right && pt.y >= top && pt.y <= bottom) {
    return 'move';
  }
  return null;
}

export function applyCropDrag(
  startRect: CropRect,
  handle: Exclude<CropHandleKind, null>,
  dx: number,
  dy: number,
  aspect: CropAspectRatio
): CropRect {
  const minSize = 32;
  if (handle === 'move') {
    return {
      ...startRect,
      x: Math.round(startRect.x + dx),
      y: Math.round(startRect.y + dy),
    };
  }

  let left = startRect.x;
  let top = startRect.y;
  let right = startRect.x + startRect.width;
  let bottom = startRect.y + startRect.height;

  if (handle.includes('w')) left = Math.min(right - minSize, left + dx);
  if (handle.includes('e')) right = Math.max(left + minSize, right + dx);
  if (handle.includes('n')) top = Math.min(bottom - minSize, top + dy);
  if (handle.includes('s')) bottom = Math.max(top + minSize, bottom + dy);

  let width = right - left;
  let height = bottom - top;

  const ratio = parseCropAspectValue(aspect);
  if (ratio) {
    if (handle === 'n' || handle === 's') {
      width = height * ratio;
      const cx = startRect.x + startRect.width / 2;
      left = cx - width / 2;
    } else {
      const targetH = width / ratio;
      if (handle.includes('n')) {
        top = bottom - targetH;
      } else {
        bottom = top + targetH;
      }
      height = bottom - top;
    }
  }

  return {
    x: Math.round(left),
    y: Math.round(top),
    width: Math.max(minSize, Math.round(width)),
    height: Math.max(minSize, Math.round(height)),
  };
}

/**
 * Draw dimmed surround mask, rule-of-thirds grid, and 8 resize handles for Crop Mode.
 */
export function renderCropOverlay(
  ctx: CanvasRenderingContext2D,
  canvas: fabric.Canvas,
  crop: CropRect,
  doc: DocumentConfig
): void {
  const v = canvas.viewportTransform || [1, 0, 0, 1, 0, 0];
  const invZoom = 1 / (v[0] || 1);

  ctx.save();
  ctx.transform(v[0], v[1], v[2], v[3], v[4], v[5]);

  // Scrim outside crop region over artboard bounds
  const minX = Math.min(0, crop.x) - 2000;
  const minY = Math.min(0, crop.y) - 2000;
  const maxW = Math.max(doc.width, crop.x + crop.width) + 4000;
  const maxH = Math.max(doc.height, crop.y + crop.height) + 4000;

  ctx.beginPath();
  ctx.rect(minX, minY, maxW, maxH);
  ctx.rect(crop.x, crop.y, crop.width, crop.height);
  ctx.fillStyle = 'rgba(15, 23, 42, 0.55)';
  ctx.fill('evenodd');

  // Rule of thirds lines
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.lineWidth = 1 * invZoom;
  ctx.beginPath();
  for (let i = 1; i <= 2; i++) {
    const gx = crop.x + (crop.width * i) / 3;
    const gy = crop.y + (crop.height * i) / 3;
    ctx.moveTo(gx, crop.y);
    ctx.lineTo(gx, crop.y + crop.height);
    ctx.moveTo(crop.x, gy);
    ctx.lineTo(crop.x + crop.width, gy);
  }
  ctx.stroke();

  // Crop border
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 2 * invZoom;
  ctx.strokeRect(crop.x, crop.y, crop.width, crop.height);

  // Corner & midpoint handles
  const hs = 5 * invZoom;
  const handlePts = [
    [crop.x, crop.y],
    [crop.x + crop.width / 2, crop.y],
    [crop.x + crop.width, crop.y],
    [crop.x + crop.width, crop.y + crop.height / 2],
    [crop.x + crop.width, crop.y + crop.height],
    [crop.x + crop.width / 2, crop.y + crop.height],
    [crop.x, crop.y + crop.height],
    [crop.x, crop.y + crop.height / 2],
  ];

  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#0284c7';
  ctx.lineWidth = 1.6 * invZoom;
  for (const [hx, hy] of handlePts) {
    ctx.fillRect(hx - hs, hy - hs, hs * 2, hs * 2);
    ctx.strokeRect(hx - hs, hy - hs, hs * 2, hs * 2);
  }

  ctx.restore();
}
