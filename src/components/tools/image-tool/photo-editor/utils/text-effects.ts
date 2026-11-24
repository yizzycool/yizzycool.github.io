import type { ExtendedFabricObject, TextCurveKind } from '../types/studio';

import * as fabric from 'fabric';

function buildTextCurveSvg(
  textWidth: number,
  kind: Exclude<TextCurveKind, 'none'>,
  strength: number
): string {
  const w = Math.max(180, textWidth);
  const halfW = w / 2;
  const amp =
    (Math.max(5, Math.min(100, strength)) / 100) * Math.min(w * 0.48, 220);

  if (kind === 'arc-up') {
    return `M ${-halfW} ${amp * 0.45} Q 0 ${-amp} ${halfW} ${amp * 0.45}`;
  }
  if (kind === 'arc-down') {
    return `M ${-halfW} ${-amp * 0.45} Q 0 ${amp} ${halfW} ${-amp * 0.45}`;
  }
  if (kind === 'wave') {
    const qW = w / 4;
    return `M ${-halfW} 0 Q ${-qW} ${-amp * 0.85} 0 0 Q ${qW} ${amp * 0.85} ${halfW} 0`;
  }

  // Circle ring path
  const r = Math.max(
    70,
    (w / (2 * Math.PI)) * (140 / Math.max(25, strength + 40))
  );
  return `M 0 ${-r} A ${r} ${r} 0 1 1 -0.01 ${-r} Z`;
}

/**
 * Attach or remove a Fabric v7 vector curve `path` on a Textbox/IText object.
 */
export function applyTextCurvePath(
  textObj: fabric.Textbox | fabric.IText,
  kind: TextCurveKind,
  strength = 45
): void {
  const ext = textObj as ExtendedFabricObject;
  ext._textCurveKind = kind;
  ext._textCurveStrength = strength;

  if (kind === 'none') {
    textObj.set({ path: undefined });
    textObj.initDimensions();
    textObj.setCoords();
    return;
  }

  const rawWidth = Math.max(textObj.width || 240, 180);
  const pathStr = buildTextCurveSvg(rawWidth, kind, strength);
  const pathObj = new fabric.Path(pathStr, {
    visible: false,
    fill: '',
    stroke: '',
  });

  textObj.set({
    path: pathObj,
    pathAlign: 'center',
    pathSide: 'left',
  });
  textObj.setPathInfo();
  textObj.initDimensions();
  textObj.setCoords();
}

/**
 * Load a local `.ttf`, `.otf`, or `.woff2` font file into `document.fonts` via the FontFace API.
 */
export async function loadLocalFontFile(
  file: File
): Promise<{ family: string; buffer: ArrayBuffer }> {
  const cleanName = file.name
    .replace(/\.[^.]+$/, '')
    .replace(/[^a-zA-Z0-9 _-]/g, '')
    .trim();
  const family = cleanName || `CustomFont_${Date.now()}`;
  const buffer = await file.arrayBuffer();

  const fontFace = new FontFace(family, buffer);
  const loaded = await fontFace.load();
  document.fonts.add(loaded);
  await document.fonts.ready;

  return { family, buffer };
}

/**
 * Convert a selected Textbox/IText layer into an editable vector `fabric.Path` outline via opentype.js.
 */
export async function convertTextToOutlinePath(
  textObj: fabric.Textbox | fabric.IText,
  fontBuffer: ArrayBuffer
): Promise<fabric.Path> {
  const opentypeModule = await import('opentype.js');
  const opentype = opentypeModule.default ?? opentypeModule;
  const font = opentype.parse(fontBuffer);

  const textStr = textObj.text || 'Text';
  const fontSize = textObj.fontSize || 42;
  const lineHeightFactor = textObj.lineHeight || 1.2;
  const lines = textStr.split(/\r?\n/);

  const combined = new opentype.Path();
  let y = fontSize;
  for (const line of lines) {
    const linePath = font.getPath(line, 0, y, fontSize);
    combined.extend(linePath);
    y += fontSize * lineHeightFactor;
  }

  const svgPath = combined.toPathData(2);
  if (!svgPath) {
    throw new Error('Selected text produced an empty outline path.');
  }

  const pathObj = new fabric.Path(svgPath, {
    left: textObj.left ?? 0,
    top: textObj.top ?? 0,
    originX: textObj.originX ?? 'center',
    originY: textObj.originY ?? 'center',
    scaleX: textObj.scaleX ?? 1,
    scaleY: textObj.scaleY ?? 1,
    angle: textObj.angle ?? 0,
    fill: typeof textObj.fill === 'string' ? textObj.fill : '#111827',
    stroke: typeof textObj.stroke === 'string' ? textObj.stroke : '',
    strokeWidth: textObj.strokeWidth ?? 0,
    opacity: textObj.opacity ?? 1,
    globalCompositeOperation: textObj.globalCompositeOperation ?? 'source-over',
  });
  pathObj.setCoords();

  return pathObj;
}
