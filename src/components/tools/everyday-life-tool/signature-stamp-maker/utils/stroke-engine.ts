import type { BoundingBox, ExportScale, Stroke, StrokePoint } from '../types';

import {
  LOGICAL_CANVAS_HEIGHT,
  LOGICAL_CANVAS_WIDTH,
  TRIM_PADDING,
} from '../constants';

interface Point2D {
  x: number;
  y: number;
}

function dist(a: Point2D, b: Point2D): number {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

/**
 * Exponential moving-average smoothing to remove trackpad/touch micro-jitter
 * while preserving the exact anchor endpoints.
 */
export function smoothPoints(
  points: StrokePoint[],
  smoothing: number
): StrokePoint[] {
  if (points.length <= 2 || smoothing <= 0) return points;

  const clamped = Math.max(0, Math.min(100, smoothing)) / 100;
  const alpha = Math.max(0.18, 1 - clamped * 0.72);

  const result: StrokePoint[] = [{ ...points[0] }];
  let prev = points[0];

  for (let i = 1; i < points.length - 1; i++) {
    const cur = points[i];
    const next: StrokePoint = {
      x: prev.x + alpha * (cur.x - prev.x),
      y: prev.y + alpha * (cur.y - prev.y),
      t: cur.t,
      pressure: prev.pressure + alpha * (cur.pressure - prev.pressure),
    };
    result.push(next);
    prev = next;
  }

  result.push({ ...points[points.length - 1] });
  return result;
}

function buildDotPolygon(center: Point2D, radius: number): Point2D[] {
  const steps = 12;
  const ring: Point2D[] = [];
  for (let i = 0; i < steps; i++) {
    const angle = (i / steps) * Math.PI * 2;
    ring.push({
      x: center.x + Math.cos(angle) * radius,
      y: center.y + Math.sin(angle) * radius,
    });
  }
  return ring;
}

/**
 * Generates a variable-width ribbon outline polygon simulating fountain-pen
 * pressure and velocity tapering.
 */
export function buildStrokeOutline(stroke: Stroke): Point2D[] {
  const raw = smoothPoints(stroke.points, stroke.smoothing);
  if (raw.length === 0) return [];

  if (raw.length === 1) {
    return buildDotPolygon(raw[0], Math.max(1.5, stroke.baseWidth * 0.55));
  }

  const pts: StrokePoint[] = [raw[0]];
  for (let i = 1; i < raw.length; i++) {
    if (dist(pts[pts.length - 1], raw[i]) >= 1.2 || i === raw.length - 1) {
      pts.push(raw[i]);
    }
  }

  if (pts.length === 1) {
    return buildDotPolygon(pts[0], Math.max(1.5, stroke.baseWidth * 0.55));
  }

  const radii: number[] = [];
  let prevRadius = stroke.baseWidth * 0.55;

  for (let i = 0; i < pts.length; i++) {
    const p = pts[i];
    const prev = pts[Math.max(0, i - 1)];
    const d = dist(prev, p);
    const dt = Math.max(1, p.t - prev.t);
    const velocity = d / dt;

    const velocityFactor = Math.max(
      0.45,
      Math.min(1.15, 1.15 - velocity * 0.25)
    );
    const hasNativePressure = p.pressure > 0 && p.pressure !== 0.5;
    const pressureFactor = hasNativePressure
      ? 0.45 + p.pressure * 0.85
      : velocityFactor;

    let taperFactor = 1;
    if (i === 0) taperFactor = 0.72;
    else if (i === pts.length - 1) taperFactor = 0.42;
    else if (i === pts.length - 2 && pts.length > 3) taperFactor = 0.7;

    const targetRadius = Math.max(
      0.85,
      stroke.baseWidth * 0.55 * pressureFactor * taperFactor
    );
    const smoothedRadius = prevRadius * 0.55 + targetRadius * 0.45;
    radii.push(smoothedRadius);
    prevRadius = smoothedRadius;
  }

  const leftEdge: Point2D[] = [];
  const rightEdge: Point2D[] = [];

  for (let i = 0; i < pts.length; i++) {
    const prev = pts[Math.max(0, i - 1)];
    const next = pts[Math.min(pts.length - 1, i + 1)];
    let dx = next.x - prev.x;
    let dy = next.y - prev.y;
    const len = Math.hypot(dx, dy) || 1;
    dx /= len;
    dy /= len;

    const nx = -dy;
    const ny = dx;
    const r = radii[i];

    leftEdge.push({ x: pts[i].x + nx * r, y: pts[i].y + ny * r });
    rightEdge.push({ x: pts[i].x - nx * r, y: pts[i].y - ny * r });
  }

  const startCap: Point2D[] = [];
  const first = pts[0];
  const second = pts[1];
  const startAngle = Math.atan2(first.y - second.y, first.x - second.x);
  const r0 = radii[0];
  for (let step = 1; step <= 3; step++) {
    const a = startAngle - Math.PI / 2 + (step / 4) * Math.PI;
    startCap.push({
      x: first.x + Math.cos(a) * r0,
      y: first.y + Math.sin(a) * r0,
    });
  }

  const endCap: Point2D[] = [];
  const last = pts[pts.length - 1];
  const prevLast = pts[pts.length - 2];
  const endAngle = Math.atan2(last.y - prevLast.y, last.x - prevLast.x);
  const rN = radii[radii.length - 1];
  for (let step = 1; step <= 3; step++) {
    const a = endAngle - Math.PI / 2 + (step / 4) * Math.PI;
    endCap.push({
      x: last.x + Math.cos(a) * rN,
      y: last.y + Math.sin(a) * rN,
    });
  }

  return [...leftEdge, ...endCap, ...rightEdge.reverse(), ...startCap];
}

export function outlineToSvgPath(
  outline: Point2D[],
  offsetX = 0,
  offsetY = 0
): string {
  if (outline.length < 3) return '';

  const shifted = outline.map((pt) => ({
    x: Number((pt.x - offsetX).toFixed(2)),
    y: Number((pt.y - offsetY).toFixed(2)),
  }));

  const parts: string[] = [];
  const firstMid = {
    x: ((shifted[shifted.length - 1].x + shifted[0].x) / 2).toFixed(2),
    y: ((shifted[shifted.length - 1].y + shifted[0].y) / 2).toFixed(2),
  };
  parts.push(`M ${firstMid.x} ${firstMid.y}`);

  for (let i = 0; i < shifted.length; i++) {
    const current = shifted[i];
    const next = shifted[(i + 1) % shifted.length];
    const midX = ((current.x + next.x) / 2).toFixed(2);
    const midY = ((current.y + next.y) / 2).toFixed(2);
    parts.push(`Q ${current.x} ${current.y} ${midX} ${midY}`);
  }

  parts.push('Z');
  return parts.join(' ');
}

export function renderStrokeToContext(
  ctx: CanvasRenderingContext2D,
  stroke: Stroke
): void {
  const outline = buildStrokeOutline(stroke);
  if (outline.length < 3) return;

  ctx.save();
  ctx.fillStyle = stroke.color;
  ctx.beginPath();

  const last = outline[outline.length - 1];
  const first = outline[0];
  ctx.moveTo((last.x + first.x) / 2, (last.y + first.y) / 2);

  for (let i = 0; i < outline.length; i++) {
    const cur = outline[i];
    const next = outline[(i + 1) % outline.length];
    ctx.quadraticCurveTo(
      cur.x,
      cur.y,
      (cur.x + next.x) / 2,
      (cur.y + next.y) / 2
    );
  }

  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

export function computeStrokesBounds(strokes: Stroke[]): BoundingBox | null {
  if (strokes.length === 0) return null;

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const stroke of strokes) {
    const outline = buildStrokeOutline(stroke);
    for (const pt of outline) {
      if (pt.x < minX) minX = pt.x;
      if (pt.y < minY) minY = pt.y;
      if (pt.x > maxX) maxX = pt.x;
      if (pt.y > maxY) maxY = pt.y;
    }
  }

  if (!Number.isFinite(minX)) return null;

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: Math.max(1, maxX - minX),
    height: Math.max(1, maxY - minY),
  };
}

export function getSignatureExportBox(
  strokes: Stroke[],
  trimWhitespace: boolean
): { x: number; y: number; width: number; height: number } {
  if (!trimWhitespace || strokes.length === 0) {
    return {
      x: 0,
      y: 0,
      width: LOGICAL_CANVAS_WIDTH,
      height: LOGICAL_CANVAS_HEIGHT,
    };
  }

  const bounds = computeStrokesBounds(strokes);
  if (!bounds) {
    return {
      x: 0,
      y: 0,
      width: LOGICAL_CANVAS_WIDTH,
      height: LOGICAL_CANVAS_HEIGHT,
    };
  }

  const x = Math.max(0, Math.floor(bounds.minX - TRIM_PADDING));
  const y = Math.max(0, Math.floor(bounds.minY - TRIM_PADDING));
  const maxRight = Math.min(
    LOGICAL_CANVAS_WIDTH,
    Math.ceil(bounds.maxX + TRIM_PADDING)
  );
  const maxBottom = Math.min(
    LOGICAL_CANVAS_HEIGHT,
    Math.ceil(bounds.maxY + TRIM_PADDING)
  );

  return {
    x,
    y,
    width: Math.max(24, maxRight - x),
    height: Math.max(24, maxBottom - y),
  };
}

export function exportSignatureToSvg(
  strokes: Stroke[],
  options: { trimWhitespace: boolean }
): { svg: string; width: number; height: number } {
  const box = getSignatureExportBox(strokes, options.trimWhitespace);

  const pathElements = strokes
    .map((stroke) => {
      const outline = buildStrokeOutline(stroke);
      const d = outlineToSvgPath(outline, box.x, box.y);
      if (!d) return '';
      return `  <path d="${d}" fill="${stroke.color}" />`;
    })
    .filter(Boolean)
    .join('\n');

  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${box.width}" height="${box.height}" viewBox="0 0 ${box.width} ${box.height}" fill="none">`,
    pathElements,
    '</svg>',
  ].join('\n');

  return { svg, width: box.width, height: box.height };
}

export function exportSignatureToPngBlob(
  strokes: Stroke[],
  options: { trimWhitespace: boolean; scale: ExportScale }
): Promise<{ blob: Blob; width: number; height: number } | null> {
  return new Promise((resolve) => {
    if (typeof document === 'undefined' || strokes.length === 0) {
      resolve(null);
      return;
    }

    const box = getSignatureExportBox(strokes, options.trimWhitespace);
    const width = Math.round(box.width * options.scale);
    const height = Math.round(box.height * options.scale);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      resolve(null);
      return;
    }

    ctx.scale(options.scale, options.scale);
    ctx.translate(-box.x, -box.y);

    for (const stroke of strokes) {
      renderStrokeToContext(ctx, stroke);
    }

    canvas.toBlob((blob) => {
      if (!blob) {
        resolve(null);
        return;
      }
      resolve({ blob, width, height });
    }, 'image/png');
  });
}
