import type * as fabric from 'fabric';

/**
 * Paint block mosaic pixelation onto regions covered by non-transparent pixels
 * in `strokesCanvas`, returning a lossless PNG Blob at the image's natural resolution.
 */
export async function applyMosaicBrushToImageBlob(
  img: fabric.FabricImage,
  strokesCanvas: HTMLCanvasElement,
  blockSize = 18
): Promise<Blob | null> {
  const el = img.getElement?.() as CanvasImageSource | undefined;
  if (!el) return null;

  const w = Math.max(1, Math.round(img.width || strokesCanvas.width));
  const h = Math.max(1, Math.round(img.height || strokesCanvas.height));

  const outCanvas = document.createElement('canvas');
  outCanvas.width = w;
  outCanvas.height = h;
  const oCtx = outCanvas.getContext('2d');
  if (!oCtx) return null;
  oCtx.drawImage(el, 0, 0, w, h);

  const safeBlock = Math.max(6, Math.min(48, Math.round(blockSize)));
  const tinyW = Math.max(1, Math.round(w / safeBlock));
  const tinyH = Math.max(1, Math.round(h / safeBlock));

  const pixelCanvas = document.createElement('canvas');
  pixelCanvas.width = tinyW;
  pixelCanvas.height = tinyH;
  const pCtx = pixelCanvas.getContext('2d');
  if (!pCtx) return null;
  pCtx.drawImage(outCanvas, 0, 0, tinyW, tinyH);

  const mosaicLayer = document.createElement('canvas');
  mosaicLayer.width = w;
  mosaicLayer.height = h;
  const mCtx = mosaicLayer.getContext('2d');
  if (!mCtx) return null;

  // Draw brush mask first, then composite pixelated image inside painted strokes
  mCtx.drawImage(strokesCanvas, 0, 0, w, h);
  mCtx.globalCompositeOperation = 'source-in';
  mCtx.imageSmoothingEnabled = false;
  mCtx.drawImage(pixelCanvas, 0, 0, w, h);

  oCtx.drawImage(mosaicLayer, 0, 0, w, h);

  return new Promise<Blob | null>((resolve) => {
    outCanvas.toBlob((blob) => resolve(blob), 'image/png');
  });
}
