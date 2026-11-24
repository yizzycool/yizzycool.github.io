import * as fabric from 'fabric';

import { FABRIC_OBJECT_CONTROLS_STYLE } from '../constants';

export type PenAnchor = {
  x: number;
  y: number;
  handleIn: { x: number; y: number };
  handleOut: { x: number; y: number };
};

const NODE_EDITING_FLAG = '_isNodeEditing' as const;

/**
 * Build an SVG path string (`M`, `C`, `L`, `Z`) from Bezier Pen anchors.
 */
export function buildSvgPathFromAnchors(
  anchors: PenAnchor[],
  closed: boolean
): string {
  if (anchors.length === 0) return '';
  if (anchors.length === 1) {
    return `M ${anchors[0].x.toFixed(1)} ${anchors[0].y.toFixed(1)}`;
  }

  const parts: string[] = [
    `M ${anchors[0].x.toFixed(1)} ${anchors[0].y.toFixed(1)}`,
  ];

  const count = closed ? anchors.length : anchors.length - 1;
  for (let i = 0; i < count; i++) {
    const a = anchors[i];
    const b = anchors[(i + 1) % anchors.length];

    const hasOut =
      Math.abs(a.handleOut.x - a.x) > 0.5 ||
      Math.abs(a.handleOut.y - a.y) > 0.5;
    const hasIn =
      Math.abs(b.handleIn.x - b.x) > 0.5 || Math.abs(b.handleIn.y - b.y) > 0.5;

    if (hasOut || hasIn) {
      parts.push(
        `C ${a.handleOut.x.toFixed(1)} ${a.handleOut.y.toFixed(1)}, ${b.handleIn.x.toFixed(1)} ${b.handleIn.y.toFixed(1)}, ${b.x.toFixed(1)} ${b.y.toFixed(1)}`
      );
    } else {
      parts.push(`L ${b.x.toFixed(1)} ${b.y.toFixed(1)}`);
    }
  }

  if (closed && anchors.length >= 3) {
    parts.push('Z');
  }
  return parts.join(' ');
}

/**
 * Draw active Pen Tool preview segments, anchor squares, and Bezier handle tangents
 * onto the lower canvas context (zoom-invariant line widths).
 */
export function renderPenOverlay(
  ctx: CanvasRenderingContext2D,
  canvas: fabric.Canvas,
  anchors: PenAnchor[],
  hoverPt: { x: number; y: number } | null
): void {
  if (anchors.length === 0) return;
  const v = canvas.viewportTransform || [1, 0, 0, 1, 0, 0];
  const zoom = v[0] || 1;
  const invZoom = 1 / zoom;

  ctx.save();
  ctx.transform(v[0], v[1], v[2], v[3], v[4], v[5]);

  // 1. Committed segments
  const committedPath = buildSvgPathFromAnchors(anchors, false);
  if (committedPath && anchors.length > 1) {
    const path2d = new Path2D(committedPath);
    ctx.strokeStyle = '#0ea5e9';
    ctx.lineWidth = 2 * invZoom;
    ctx.stroke(path2d);
  }

  // 2. Rubberband preview to cursor
  if (hoverPt && anchors.length >= 1) {
    const last = anchors[anchors.length - 1];
    ctx.save();
    ctx.setLineDash([5 * invZoom, 4 * invZoom]);
    ctx.strokeStyle = 'rgba(14, 165, 233, 0.72)';
    ctx.lineWidth = 1.5 * invZoom;
    ctx.beginPath();
    ctx.moveTo(last.x, last.y);
    const hasOut =
      Math.abs(last.handleOut.x - last.x) > 0.5 ||
      Math.abs(last.handleOut.y - last.y) > 0.5;
    if (hasOut) {
      ctx.quadraticCurveTo(
        last.handleOut.x,
        last.handleOut.y,
        hoverPt.x,
        hoverPt.y
      );
    } else {
      ctx.lineTo(hoverPt.x, hoverPt.y);
    }
    ctx.stroke();
    ctx.restore();
  }

  // 3. Control handles & Anchor squares
  const boxHalf = 4.5 * invZoom;
  const handleR = 3.2 * invZoom;
  for (let i = 0; i < anchors.length; i++) {
    const a = anchors[i];

    // Draw handle tangents if stretched
    for (const h of [a.handleIn, a.handleOut]) {
      if (Math.hypot(h.x - a.x, h.y - a.y) > 1) {
        ctx.strokeStyle = 'rgba(14, 165, 233, 0.8)';
        ctx.lineWidth = 1.2 * invZoom;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(h.x, h.y);
        ctx.stroke();

        ctx.fillStyle = '#0ea5e9';
        ctx.beginPath();
        ctx.arc(h.x, h.y, handleR, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.fillStyle = i === 0 ? '#10b981' : '#ffffff';
    ctx.strokeStyle = i === 0 ? '#059669' : '#0ea5e9';
    ctx.lineWidth = 1.6 * invZoom;
    ctx.fillRect(a.x - boxHalf, a.y - boxHalf, boxHalf * 2, boxHalf * 2);
    ctx.strokeRect(a.x - boxHalf, a.y - boxHalf, boxHalf * 2, boxHalf * 2);
  }

  ctx.restore();
}

export function isPathInNodeEditMode(obj: fabric.FabricObject): boolean {
  return Boolean(
    (obj as unknown as Record<string, unknown>)[NODE_EDITING_FLAG]
  );
}

function getCommandEndpointIndices(cmdType: string): {
  anchorX?: number;
  anchorY?: number;
  handles: Array<[number, number]>;
} {
  if (cmdType === 'M' || cmdType === 'L') {
    return { anchorX: 1, anchorY: 2, handles: [] };
  }
  if (cmdType === 'Q') {
    return { anchorX: 3, anchorY: 4, handles: [[1, 2]] };
  }
  if (cmdType === 'C') {
    return {
      anchorX: 5,
      anchorY: 6,
      handles: [
        [1, 2],
        [3, 4],
      ],
    };
  }
  return { handles: [] };
}

function createPathCoordControl(
  cmdIdx: number,
  xIdx: number,
  yIdx: number,
  isHandle: boolean
): fabric.Control {
  return new fabric.Control({
    actionName: 'modifyPath',
    cursorStyle: 'pointer',
    positionHandler: (_dim, _finalMatrix, fabricObject) => {
      const pathObj = fabricObject as fabric.Path;
      const cmd = pathObj.path[cmdIdx];
      const px = (cmd?.[xIdx] as number) ?? 0;
      const py = (cmd?.[yIdx] as number) ?? 0;
      const localPt = new fabric.Point(
        px - pathObj.pathOffset.x,
        py - pathObj.pathOffset.y
      );
      const canvas = pathObj.canvas;
      const vpt = canvas?.viewportTransform || [1, 0, 0, 1, 0, 0];
      const matrix = fabric.util.multiplyTransformMatrices(
        vpt,
        pathObj.calcTransformMatrix()
      );
      return localPt.transform(matrix);
    },
    actionHandler: (_eventData, transform, x, y) => {
      const pathObj = transform.target as fabric.Path;
      const cmd = pathObj.path[cmdIdx];
      if (!cmd) return false;

      const inv = fabric.util.invertTransform(pathObj.calcTransformMatrix());
      const local = new fabric.Point(x, y).transform(inv);
      cmd[xIdx] = local.x + pathObj.pathOffset.x;
      cmd[yIdx] = local.y + pathObj.pathOffset.y;

      pathObj.setBoundingBox(true);
      pathObj.set({ dirty: true });
      pathObj.setCoords();
      return true;
    },
    render: (ctx, left, top) => {
      ctx.save();
      ctx.fillStyle = isHandle ? '#38bdf8' : '#ffffff';
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 1.6;
      if (isHandle) {
        ctx.beginPath();
        ctx.arc(left, top, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else {
        ctx.fillRect(left - 5, top - 5, 10, 10);
        ctx.strokeRect(left - 5, top - 5, 10, 10);
      }
      ctx.restore();
    },
  });
}

/**
 * Install per-anchor and Bezier-handle interactive controls onto a selected `fabric.Path`.
 */
export function enablePathNodeEditing(pathObj: fabric.Path): void {
  const controls: Record<string, fabric.Control> = {};

  pathObj.path.forEach((cmd, idx) => {
    const type = String(cmd[0]);
    const spec = getCommandEndpointIndices(type);

    spec.handles.forEach(([hx, hy], hIdx) => {
      controls[`h_${idx}_${hIdx}`] = createPathCoordControl(idx, hx, hy, true);
    });

    if (spec.anchorX !== undefined && spec.anchorY !== undefined) {
      controls[`p_${idx}`] = createPathCoordControl(
        idx,
        spec.anchorX,
        spec.anchorY,
        false
      );
    }
  });

  (pathObj as unknown as Record<string, unknown>)[NODE_EDITING_FLAG] = true;
  pathObj.set({
    hasBorders: false,
    controls,
  });
  pathObj.setCoords();
}

/**
 * Restore standard transform bounding-box controls on a `fabric.Path`.
 */
export function disablePathNodeEditing(pathObj: fabric.Path): void {
  (pathObj as unknown as Record<string, unknown>)[NODE_EDITING_FLAG] = false;
  pathObj.set({
    hasBorders: true,
    controls: fabric.controlsUtils.createObjectDefaultControls(),
    ...FABRIC_OBJECT_CONTROLS_STYLE,
  });
  pathObj.setCoords();
}
