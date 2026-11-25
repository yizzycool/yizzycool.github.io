export type FaceRedactionMode = 'blur' | 'pixelate';

/**
 * Render a redacted copy of `sourceCanvas` with every detected face obscured
 * using either an elliptical blur or pixel mosaic block filter.
 */
export function renderRedactedFaceCanvas(
  sourceCanvas: HTMLCanvasElement,
  faces: FaceDetectionResults,
  mode: FaceRedactionMode
): HTMLCanvasElement {
  const output = document.createElement('canvas');
  output.width = sourceCanvas.width;
  output.height = sourceCanvas.height;

  const ctx = output.getContext('2d');
  if (!ctx) return output;

  ctx.drawImage(sourceCanvas, 0, 0);

  for (const face of faces) {
    const { x, y, width, height } = face.boundingBox;
    if (width <= 0 || height <= 0) continue;

    const padX = width * 0.08;
    const padY = height * 0.1;
    const rx = Math.max(0, x - padX);
    const ry = Math.max(0, y - padY);
    const rw = Math.min(output.width - rx, width + padX * 2);
    const rh = Math.min(output.height - ry, height + padY * 2);

    if (rw <= 1 || rh <= 1) continue;

    ctx.save();
    ctx.beginPath();
    ctx.ellipse(rx + rw / 2, ry + rh / 2, rw / 2, rh / 2, 0, 0, Math.PI * 2);
    ctx.clip();

    if (mode === 'pixelate') {
      const blocksX = Math.max(5, Math.round(rw / 14));
      const blocksY = Math.max(5, Math.round(rh / 14));
      const mini = document.createElement('canvas');
      mini.width = blocksX;
      mini.height = blocksY;
      const miniCtx = mini.getContext('2d');

      if (miniCtx) {
        miniCtx.drawImage(sourceCanvas, rx, ry, rw, rh, 0, 0, blocksX, blocksY);
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(mini, 0, 0, blocksX, blocksY, rx, ry, rw, rh);
      }
    } else if (typeof ctx.filter === 'string') {
      const blurRadius = Math.max(12, Math.round(Math.min(rw, rh) * 0.14));
      ctx.filter = `blur(${blurRadius}px)`;
      ctx.drawImage(
        sourceCanvas,
        Math.max(0, rx - blurRadius),
        Math.max(0, ry - blurRadius),
        Math.min(output.width, rw + blurRadius * 2),
        Math.min(output.height, rh + blurRadius * 2),
        Math.max(0, rx - blurRadius),
        Math.max(0, ry - blurRadius),
        Math.min(output.width, rw + blurRadius * 2),
        Math.min(output.height, rh + blurRadius * 2)
      );
    } else {
      const targetCtx = ctx as CanvasRenderingContext2D;
      const mini = document.createElement('canvas');
      mini.width = 8;
      mini.height = 8;
      const miniCtx = mini.getContext('2d');
      if (miniCtx) {
        miniCtx.drawImage(sourceCanvas, rx, ry, rw, rh, 0, 0, 8, 8);
        targetCtx.imageSmoothingEnabled = true;
        targetCtx.drawImage(mini, 0, 0, 8, 8, rx, ry, rw, rh);
      }
    }

    ctx.restore();
  }

  return output;
}

/**
 * Export a canvas element to a PNG Blob promise.
 */
export function canvasToBlob(
  canvas: HTMLCanvasElement,
  type = 'image/png'
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('Failed to export canvas image'));
      }
    }, type);
  });
}
