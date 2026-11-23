import type * as fabric from 'fabric';

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

  // Merge spans for every candidate sharing the snapped coordinate
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
 * Compute magnetic alignment deltas (dx, dy) and visual guide lines for a moving object
 * against canvas bounds/center and other objects on the canvas.
 */
export function computeSnapAdjustment(
  moving: SnapBounds,
  targets: SnapBounds[],
  canvasSize: { width: number; height: number },
  threshold: number
): SnapResult {
  const verticalCandidates: CandidateLine[] = [
    { position: 0, start: 0, end: canvasSize.height },
    { position: canvasSize.width / 2, start: 0, end: canvasSize.height },
    { position: canvasSize.width, start: 0, end: canvasSize.height },
  ];

  const horizontalCandidates: CandidateLine[] = [
    { position: 0, start: 0, end: canvasSize.width },
    { position: canvasSize.height / 2, start: 0, end: canvasSize.width },
    { position: canvasSize.height, start: 0, end: canvasSize.width },
  ];

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
 * Draw active alignment snap guide hairlines onto the Fabric canvas context.
 */
export function drawSnapGuides(
  ctx: CanvasRenderingContext2D,
  guides: SnapGuideLine[],
  canvas: fabric.Canvas
): void {
  if (guides.length === 0) return;

  const v = canvas.viewportTransform || [1, 0, 0, 1, 0, 0];
  const displayScale = (canvas.get('_scale') as number | undefined) || 1;
  const lineWidth = Math.max(0.75, 1.25 / displayScale);
  const dashLength = 5 / displayScale;
  const gapLength = 4 / displayScale;

  ctx.save();
  ctx.transform(v[0], v[1], v[2], v[3], v[4], v[5]);
  ctx.strokeStyle = '#0ea5e9';
  ctx.lineWidth = lineWidth;
  ctx.setLineDash([dashLength, gapLength]);

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
