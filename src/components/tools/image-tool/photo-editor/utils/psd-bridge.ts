import type {
  BlendMode,
  DocumentConfig,
  ExtendedFabricObject,
} from '../types/studio';

import * as fabric from 'fabric';

import { FABRIC_OBJECT_CONTROLS_STYLE } from '../constants';
import { generateUid, stampLayerMeta } from './fabric-layer-mapper';

const PSD_TO_CANVAS_BLEND: Record<string, BlendMode> = {
  normal: 'source-over',
  multiply: 'multiply',
  screen: 'screen',
  overlay: 'overlay',
  darken: 'darken',
  lighten: 'lighten',
  'color dodge': 'color-dodge',
  'color burn': 'color-burn',
  'hard light': 'hard-light',
  'soft light': 'soft-light',
  difference: 'difference',
  exclusion: 'exclusion',
  hue: 'hue',
  saturation: 'saturation',
  color: 'color',
  luminosity: 'luminosity',
};

const CANVAS_TO_PSD_BLEND: Record<BlendMode, string> = {
  'source-over': 'normal',
  multiply: 'multiply',
  screen: 'screen',
  overlay: 'overlay',
  darken: 'darken',
  lighten: 'lighten',
  'color-dodge': 'color dodge',
  'color-burn': 'color burn',
  'hard-light': 'hard light',
  'soft-light': 'soft light',
  difference: 'difference',
  exclusion: 'exclusion',
  hue: 'hue',
  saturation: 'saturation',
  color: 'color',
  luminosity: 'luminosity',
};

function htmlCanvasToBlob(canvasEl: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvasEl.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Failed to encode PSD layer bitmap.'));
    }, 'image/png');
  });
}

function rgbColorToHex(color: unknown): string {
  if (!color || typeof color !== 'object') return '#111827';
  const rec = color as Record<string, unknown>;
  let r = 0;
  let g = 0;
  let b = 0;
  if (
    typeof rec.r === 'number' &&
    typeof rec.g === 'number' &&
    typeof rec.b === 'number'
  ) {
    r = rec.r;
    g = rec.g;
    b = rec.b;
  } else if (
    typeof rec.fr === 'number' &&
    typeof rec.fg === 'number' &&
    typeof rec.fb === 'number'
  ) {
    r = rec.fr * 255;
    g = rec.fg * 255;
    b = rec.fb * 255;
  } else {
    return '#111827';
  }
  const cr = Math.max(0, Math.min(255, Math.round(r)));
  const cg = Math.max(0, Math.min(255, Math.round(g)));
  const cb = Math.max(0, Math.min(255, Math.round(b)));
  return `#${cr.toString(16).padStart(2, '0')}${cg.toString(16).padStart(2, '0')}${cb.toString(16).padStart(2, '0')}`;
}

/**
 * Parse a Photoshop `.psd` file via dynamically imported `ag-psd` into Fabric layers.
 */
export async function importPsdToCanvas(
  file: File,
  canvas: fabric.Canvas,
  registerAssetBlob: (assetId: string, blob: Blob) => string
): Promise<{ width: number; height: number; layerCount: number }> {
  const { readPsd } = await import('ag-psd');
  const buffer = await file.arrayBuffer();
  const psd = readPsd(buffer);

  const docWidth = Math.max(32, psd.width || 1280);
  const docHeight = Math.max(32, psd.height || 720);
  let importedCount = 0;

  const walkLayer = async (
    layer: NonNullable<typeof psd.children>[number],
    prefix = ''
  ) => {
    if (layer.children && layer.children.length > 0) {
      const nextPrefix = layer.name ? `${prefix}${layer.name}/` : prefix;
      for (const child of layer.children) {
        await walkLayer(child, nextPrefix);
      }
      return;
    }

    const blendMode =
      PSD_TO_CANVAS_BLEND[layer.blendMode || 'normal'] ?? 'source-over';
    const opacity = typeof layer.opacity === 'number' ? layer.opacity : 1;
    const visible = !layer.hidden;
    const layerName = `${prefix}${layer.name || 'PSD Layer'}`;

    if (layer.text?.text) {
      const left = layer.left ?? 80;
      const top = layer.top ?? 80;
      const width = Math.max(120, (layer.right ?? left + 260) - left);
      const fontSize = Math.round(
        layer.text.style?.fontSize ??
          layer.text.styleRuns?.[0]?.style?.fontSize ??
          36
      );
      const fill = rgbColorToHex(
        layer.text.style?.fillColor ??
          layer.text.styleRuns?.[0]?.style?.fillColor
      );

      const textObj = new fabric.Textbox(layer.text.text, {
        left,
        top,
        originX: 'left',
        originY: 'top',
        width,
        fontSize,
        fill,
        opacity,
        visible,
        globalCompositeOperation: blendMode,
        ...FABRIC_OBJECT_CONTROLS_STYLE,
      });
      stampLayerMeta(textObj, { kind: 'text', name: layerName });
      canvas.add(textObj);
      importedCount += 1;
      return;
    }

    if (layer.canvas && layer.canvas.width > 0 && layer.canvas.height > 0) {
      const blob = await htmlCanvasToBlob(layer.canvas);
      const assetId = generateUid('asset');
      const url = registerAssetBlob(assetId, blob);
      const img = await fabric.FabricImage.fromURL(url, {
        crossOrigin: 'anonymous',
      });

      const left = layer.left ?? 0;
      const top = layer.top ?? 0;
      img.set({
        left: left + layer.canvas.width / 2,
        top: top + layer.canvas.height / 2,
        originX: 'center',
        originY: 'center',
        opacity,
        visible,
        globalCompositeOperation: blendMode,
        ...FABRIC_OBJECT_CONTROLS_STYLE,
      });
      stampLayerMeta(img, {
        kind: 'image',
        name: layerName,
        assetId,
      });
      canvas.add(img);
      importedCount += 1;
    }
  };

  if (psd.children && psd.children.length > 0) {
    for (const child of psd.children) {
      await walkLayer(child);
    }
  } else if (psd.canvas) {
    const blob = await htmlCanvasToBlob(psd.canvas);
    const assetId = generateUid('asset');
    const url = registerAssetBlob(assetId, blob);
    const img = await fabric.FabricImage.fromURL(url, {
      crossOrigin: 'anonymous',
    });
    img.set({
      left: docWidth / 2,
      top: docHeight / 2,
      originX: 'center',
      originY: 'center',
      ...FABRIC_OBJECT_CONTROLS_STYLE,
    });
    stampLayerMeta(img, {
      kind: 'image',
      name: file.name.replace(/\.psd$/i, ''),
      assetId,
    });
    canvas.add(img);
    importedCount = 1;
  }

  return { width: docWidth, height: docHeight, layerCount: importedCount };
}

async function renderObjectToLayerCanvas(
  obj: fabric.FabricObject,
  docWidth: number,
  docHeight: number
): Promise<{ canvasEl: HTMLCanvasElement; left: number; top: number }> {
  const off = new fabric.StaticCanvas(undefined, {
    width: docWidth,
    height: docHeight,
  });

  const cloned = await obj.clone();
  cloned.set({
    visible: true,
    opacity: 1,
    globalCompositeOperation: 'source-over',
  });
  off.add(cloned);
  off.renderAll();

  const result = document.createElement('canvas');
  result.width = docWidth;
  result.height = docHeight;
  const ctx = result.getContext('2d');
  if (ctx) {
    ctx.drawImage(off.lowerCanvasEl, 0, 0);
  }
  off.dispose();

  return { canvasEl: result, left: 0, top: 0 };
}

/**
 * Export the current Fabric Studio layers and composite image into a Photoshop `.psd` file via `ag-psd`.
 */
export async function exportCanvasToPsdBlob(
  canvas: fabric.Canvas,
  docConfig: DocumentConfig
): Promise<Blob> {
  const { writePsd } = await import('ag-psd');
  const { width, height } = docConfig;

  const compCanvas = document.createElement('canvas');
  compCanvas.width = width;
  compCanvas.height = height;
  const compCtx = compCanvas.getContext('2d');

  const prevVpt = [
    ...(canvas.viewportTransform || [1, 0, 0, 1, 0, 0]),
  ] as fabric.TMat2D;
  canvas.discardActiveObject();
  canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
  const compEl = canvas.toCanvasElement(1, {
    left: 0,
    top: 0,
    width,
    height,
  });
  canvas.setViewportTransform(prevVpt);
  canvas.requestRenderAll();

  if (compCtx) {
    if (docConfig.backgroundType === 'color') {
      compCtx.save();
      compCtx.globalAlpha = docConfig.backgroundOpacity;
      compCtx.fillStyle = docConfig.backgroundColor;
      compCtx.fillRect(0, 0, width, height);
      compCtx.restore();
    }
    compCtx.drawImage(compEl, 0, 0);
  }

  const children: Array<{
    name: string;
    left: number;
    top: number;
    opacity: number;
    hidden: boolean;
    blendMode:
      | 'normal'
      | 'multiply'
      | 'screen'
      | 'overlay'
      | 'darken'
      | 'lighten'
      | 'color dodge'
      | 'color burn'
      | 'hard light'
      | 'soft light'
      | 'difference'
      | 'exclusion'
      | 'hue'
      | 'saturation'
      | 'color'
      | 'luminosity';
    canvas: HTMLCanvasElement;
    text?: { text: string; style: { fontSize: number } };
  }> = [];

  for (const obj of canvas.getObjects()) {
    const ext = obj as ExtendedFabricObject;
    const { canvasEl, left, top } = await renderObjectToLayerCanvas(
      obj,
      width,
      height
    );
    const blendKey =
      (obj.globalCompositeOperation as BlendMode) || 'source-over';
    const psdBlend = (CANVAS_TO_PSD_BLEND[blendKey] || 'normal') as
      | 'normal'
      | 'multiply';

    const entry: (typeof children)[number] = {
      name: ext._layerName || 'Layer',
      left,
      top,
      opacity: obj.opacity ?? 1,
      hidden: obj.visible === false,
      blendMode: psdBlend,
      canvas: canvasEl,
    };

    if (obj instanceof fabric.Textbox || obj instanceof fabric.IText) {
      entry.text = {
        text: obj.text || '',
        style: {
          fontSize: obj.fontSize || 32,
        },
      };
    }
    children.push(entry);
  }

  const buffer = writePsd({
    width,
    height,
    canvas: compCanvas,
    children,
  });

  return new Blob([buffer], { type: 'application/octet-stream' });
}
