import type * as fabric from 'fabric';
import type { UserGuide } from '../types/studio';

export type SnapGuideLine = {
  orientation: 'vertical' | 'horizontal';
  position: number;
  start: number;
  end: number;
};

export type SnapBounds = {
  left: number;
  top: number;
  width: number;
  height: number;
};

export type SnapResult = {
  dx: number;
  dy: number;
  guides: SnapGuideLine[];
};

type CandidateLine = {
  position: number;
  start: number;
  end: number;
};

function findBestAxisSnap(
  movingStart: number,
  movingLength: number,
  movingCrossStart: number,
  movingCrossEnd: number,
  candidates: CandidateLine[],
  threshold: number,
  orientation: 'vertical' | 'horizontal'
): { delta: number; guides: SnapGuideLine[] } {
  const anchors = [
    movingStart,
    movingStart + movingLength / 2,
    movingStart + movingLength,
  ];

  let bestDiff = Infinity;
  let bestDelta = 0;
  let matchedPosition: number | null = null;

  for (const anchor of anchors) {
    for (const candidate of candidates) {
      const diff = Math.abs(candidate.position - anchor);
      if (diff <= threshold && diff < bestDiff) {
        bestDiff = diff;
        bestDelta = candidate.position - anchor;
        matchedPosition = candidate.position;
      }
    }
  }

  if (matchedPosition === null) {
    return { delta: 0, guides: [] };
  }

  let minSpan = movingCrossStart;
  let maxSpan = movingCrossEnd;

  for (const candidate of candidates) {
    if (Math.abs(candidate.position - matchedPosition) <= 0.5) {
      minSpan = Math.min(minSpan, candidate.start);
      maxSpan = Math.max(maxSpan, candidate.end);
    }
  }

  return {
    delta: bestDelta,
    guides: [
      {
        orientation,
        position: matchedPosition,
        start: minSpan,
        end: maxSpan,
      },
    ],
  };
}

/**
 * Compute magnetic alignment deltas (dx, dy) and guide lines in artboard coordinates.
 */
export function computeSnapAdjustment(
  moving: SnapBounds,
  targets: SnapBounds[],
  artboardSize: { width: number; height: number },
  threshold: number,
  userGuides: UserGuide[] = []
): SnapResult {
  const verticalCandidates: CandidateLine[] = [
    { position: 0, start: 0, end: artboardSize.height },
    { position: artboardSize.width / 2, start: 0, end: artboardSize.height },
    { position: artboardSize.width, start: 0, end: artboardSize.height },
  ];

  const horizontalCandidates: CandidateLine[] = [
    { position: 0, start: 0, end: artboardSize.width },
    { position: artboardSize.height / 2, start: 0, end: artboardSize.width },
    { position: artboardSize.height, start: 0, end: artboardSize.width },
  ];

  for (const guide of userGuides) {
    if (guide.orientation === 'v') {
      verticalCandidates.push({
        position: guide.position,
        start: 0,
        end: artboardSize.height,
      });
    } else {
      horizontalCandidates.push({
        position: guide.position,
        start: 0,
        end: artboardSize.width,
      });
    }
  }

  for (const target of targets) {
    const tRight = target.left + target.width;
    const tBottom = target.top + target.height;

    verticalCandidates.push(
      { position: target.left, start: target.top, end: tBottom },
      {
        position: target.left + target.width / 2,
        start: target.top,
        end: tBottom,
      },
      { position: tRight, start: target.top, end: tBottom }
    );

    horizontalCandidates.push(
      { position: target.top, start: target.left, end: tRight },
      {
        position: target.top + target.height / 2,
        start: target.left,
        end: tRight,
      },
      { position: tBottom, start: target.left, end: tRight }
    );
  }

  const snapX = findBestAxisSnap(
    moving.left,
    moving.width,
    moving.top,
    moving.top + moving.height,
    verticalCandidates,
    threshold,
    'vertical'
  );

  const snapY = findBestAxisSnap(
    moving.top,
    moving.height,
    moving.left,
    moving.left + moving.width,
    horizontalCandidates,
    threshold,
    'horizontal'
  );

  return {
    dx: snapX.delta,
    dy: snapY.delta,
    guides: [...snapX.guides, ...snapY.guides],
  };
}

/**
 * Draw zoom-invariant alignment snap guidelines onto the canvas context.
 */
export function drawSnapGuides(
  ctx: CanvasRenderingContext2D,
  guides: SnapGuideLine[],
  canvas: fabric.Canvas
): void {
  if (guides.length === 0) return;

  const v = canvas.viewportTransform || [1, 0, 0, 1, 0, 0];
  const zoom = v[0] || 1;
  const lineWidth = Math.max(0.75, 1.5 / zoom);

  ctx.save();
  ctx.transform(v[0], v[1], v[2], v[3], v[4], v[5]);
  ctx.strokeStyle = '#f43f5e';
  ctx.lineWidth = lineWidth;

  for (const guide of guides) {
    ctx.beginPath();
    if (guide.orientation === 'vertical') {
      ctx.moveTo(guide.position, guide.start);
      ctx.lineTo(guide.position, guide.end);
    } else {
      ctx.moveTo(guide.start, guide.position);
      ctx.lineTo(guide.end, guide.position);
    }
    ctx.stroke();
  }

  ctx.restore();
}
