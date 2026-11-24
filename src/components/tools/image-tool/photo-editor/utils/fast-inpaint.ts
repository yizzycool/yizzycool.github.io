export type InpaintRoi = {
  x: number;
  y: number;
  size: number;
};

/**
 * Compute a padded square ROI covering all painted strokes in `maskCanvas`,
 * and prepare resized RGB + binary mask buffers at `targetSize x targetSize` (e.g. 512 for LaMa).
 */
export function extractInpaintRoi(
  sourceEl: HTMLImageElement | HTMLCanvasElement,
  maskCanvas: HTMLCanvasElement,
  targetSize = 512
): {
  roi: InpaintRoi;
  imageRgba: Uint8ClampedArray;
  maskGray: Uint8Array;
} | null {
  const natW = maskCanvas.width;
  const natH = maskCanvas.height;
  const mCtx = maskCanvas.getContext('2d', { willReadFrequently: true });
  if (!mCtx) return null;

  const mData = mCtx.getImageData(0, 0, natW, natH).data;
  let minX = natW;
  let minY = natH;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < natH; y++) {
    for (let x = 0; x < natW; x++) {
      if (mData[(y * natW + x) * 4 + 3] > 20) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (maxX < minX || maxY < minY) return null;

  const boxW = maxX - minX + 1;
  const boxH = maxY - minY + 1;
  const maxSide = Math.min(
    Math.max(natW, natH),
    Math.max(256, Math.round(Math.max(boxW, boxH) * 1.9))
  );
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;

  const rx = Math.max(
    0,
    Math.min(Math.max(0, natW - maxSide), Math.round(cx - maxSide / 2))
  );
  const ry = Math.max(
    0,
    Math.min(Math.max(0, natH - maxSide), Math.round(cy - maxSide / 2))
  );
  const roiSize = Math.max(
    64,
    Math.min(maxSide, Math.min(natW - rx, natH - ry))
  );

  const imgCanvas = document.createElement('canvas');
  imgCanvas.width = targetSize;
  imgCanvas.height = targetSize;
  const iCtx = imgCanvas.getContext('2d', { willReadFrequently: true });
  if (!iCtx) return null;
  iCtx.drawImage(
    sourceEl,
    rx,
    ry,
    roiSize,
    roiSize,
    0,
    0,
    targetSize,
    targetSize
  );

  const maskSmall = document.createElement('canvas');
  maskSmall.width = targetSize;
  maskSmall.height = targetSize;
  const msCtx = maskSmall.getContext('2d', { willReadFrequently: true });
  if (!msCtx) return null;
  msCtx.drawImage(
    maskCanvas,
    rx,
    ry,
    roiSize,
    roiSize,
    0,
    0,
    targetSize,
    targetSize
  );

  const maskPx = msCtx.getImageData(0, 0, targetSize, targetSize).data;
  const maskGray = new Uint8Array(targetSize * targetSize);
  for (let i = 0; i < maskGray.length; i++) {
    maskGray[i] = maskPx[i * 4 + 3] > 20 ? 255 : 0;
  }

  return {
    roi: { x: rx, y: ry, size: roiSize },
    imageRgba: iCtx.getImageData(0, 0, targetSize, targetSize).data,
    maskGray,
  };
}

/**
 * Blend a 512x512 inpainted ROI patch cleanly back onto the full-resolution image with feathered edges.
 */
export async function compositeInpaintRoiToBlob(
  sourceEl: HTMLImageElement | HTMLCanvasElement,
  maskCanvas: HTMLCanvasElement,
  roi: InpaintRoi,
  inpaintedRgba: Uint8ClampedArray,
  inpaintedSize: number
): Promise<Blob> {
  const natW = maskCanvas.width;
  const natH = maskCanvas.height;

  const outCanvas = document.createElement('canvas');
  outCanvas.width = natW;
  outCanvas.height = natH;
  const outCtx = outCanvas.getContext('2d');
  if (!outCtx) throw new Error('Canvas 2D context unavailable.');
  outCtx.drawImage(sourceEl, 0, 0, natW, natH);

  // Put inpainted ROI onto offscreen canvas
  const patchCanvas = document.createElement('canvas');
  patchCanvas.width = inpaintedSize;
  patchCanvas.height = inpaintedSize;
  const pCtx = patchCanvas.getContext('2d');
  if (!pCtx) throw new Error('Patch canvas context unavailable.');
  const imgData = pCtx.createImageData(inpaintedSize, inpaintedSize);
  imgData.data.set(inpaintedRgba);
  pCtx.putImageData(imgData, 0, 0);

  // Feathered mask cutout so only the brushed strokes get replaced seamlessly
  const featheredMask = document.createElement('canvas');
  featheredMask.width = roi.size;
  featheredMask.height = roi.size;
  const fmCtx = featheredMask.getContext('2d');
  if (fmCtx) {
    fmCtx.filter = 'blur(4px)';
    fmCtx.drawImage(
      maskCanvas,
      roi.x,
      roi.y,
      roi.size,
      roi.size,
      0,
      0,
      roi.size,
      roi.size
    );
    fmCtx.filter = 'none';
  }

  const maskedPatch = document.createElement('canvas');
  maskedPatch.width = roi.size;
  maskedPatch.height = roi.size;
  const mpCtx = maskedPatch.getContext('2d');
  if (mpCtx) {
    mpCtx.drawImage(patchCanvas, 0, 0, roi.size, roi.size);
    mpCtx.globalCompositeOperation = 'destination-in';
    mpCtx.drawImage(featheredMask, 0, 0);
  }

  outCtx.drawImage(maskedPatch, roi.x, roi.y, roi.size, roi.size);

  const blob = await new Promise<Blob | null>((resolve) =>
    outCanvas.toBlob(resolve, 'image/png')
  );
  if (!blob) throw new Error('Failed to encode inpainted image.');
  return blob;
}

/**
 * Zero-download instant inward harmonic diffusion inpainter for rapid spot removal
 * before or alongside downloading the full 198 MB LaMa model.
 */
export async function runFastPatchInpaintBlob(
  sourceEl: HTMLImageElement | HTMLCanvasElement,
  maskCanvas: HTMLCanvasElement
): Promise<Blob | null> {
  const extracted = extractInpaintRoi(sourceEl, maskCanvas, 320);
  if (!extracted) return null;

  const size = 320;
  const { roi, imageRgba, maskGray } = extracted;
  const buf = new Float32Array(size * size * 3);
  const fixed = new Uint8Array(size * size);

  for (let i = 0; i < size * size; i++) {
    fixed[i] = maskGray[i] === 0 ? 1 : 0;
    buf[i * 3] = imageRgba[i * 4];
    buf[i * 3 + 1] = imageRgba[i * 4 + 1];
    buf[i * 3 + 2] = imageRgba[i * 4 + 2];
  }

  // Initialize masked pixels with local average of unmasked neighbors
  let avgR = 0;
  let avgG = 0;
  let avgB = 0;
  let count = 0;
  for (let i = 0; i < size * size; i++) {
    if (fixed[i]) {
      avgR += buf[i * 3];
      avgG += buf[i * 3 + 1];
      avgB += buf[i * 3 + 2];
      count++;
    }
  }
  if (count > 0) {
    avgR /= count;
    avgG /= count;
    avgB /= count;
  }
  for (let i = 0; i < size * size; i++) {
    if (!fixed[i]) {
      buf[i * 3] = avgR;
      buf[i * 3 + 1] = avgG;
      buf[i * 3 + 2] = avgB;
    }
  }

  // Iterative multi-neighbor harmonic diffusion
  const nextBuf = new Float32Array(buf);
  for (let iter = 0; iter < 48; iter++) {
    for (let y = 1; y < size - 1; y++) {
      for (let x = 1; x < size - 1; x++) {
        const idx = y * size + x;
        if (fixed[idx]) continue;

        const up = (y - 1) * size + x;
        const down = (y + 1) * size + x;
        const left = idx - 1;
        const right = idx + 1;

        nextBuf[idx * 3] =
          (buf[up * 3] + buf[down * 3] + buf[left * 3] + buf[right * 3]) * 0.25;
        nextBuf[idx * 3 + 1] =
          (buf[up * 3 + 1] +
            buf[down * 3 + 1] +
            buf[left * 3 + 1] +
            buf[right * 3 + 1]) *
          0.25;
        nextBuf[idx * 3 + 2] =
          (buf[up * 3 + 2] +
            buf[down * 3 + 2] +
            buf[left * 3 + 2] +
            buf[right * 3 + 2]) *
          0.25;
      }
    }
    buf.set(nextBuf);
  }

  const outRgba = new Uint8ClampedArray(size * size * 4);
  for (let i = 0; i < size * size; i++) {
    const jitter = fixed[i] ? 0 : (((i * 2654435761) % 7) - 3) * 0.9;
    outRgba[i * 4] = Math.max(
      0,
      Math.min(255, Math.round(buf[i * 3] + jitter))
    );
    outRgba[i * 4 + 1] = Math.max(
      0,
      Math.min(255, Math.round(buf[i * 3 + 1] + jitter))
    );
    outRgba[i * 4 + 2] = Math.max(
      0,
      Math.min(255, Math.round(buf[i * 3 + 2] + jitter))
    );
    outRgba[i * 4 + 3] = 255;
  }

  return compositeInpaintRoiToBlob(sourceEl, maskCanvas, roi, outRgba, size);
}
