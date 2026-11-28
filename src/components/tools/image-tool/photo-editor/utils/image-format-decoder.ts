function canvasToImageFile(
  canvas: HTMLCanvasElement,
  filename: string,
  mime: 'image/png' | 'image/jpeg',
  quality?: number
): Promise<File> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        canvas.width = 0;
        canvas.height = 0;
        if (!blob) {
          reject(new Error('Failed to encode decoded image.'));
          return;
        }
        const ext = mime === 'image/jpeg' ? '.jpg' : '.png';
        const nextName = filename.replace(/\.(heic|heif|tif|tiff)$/i, ext);
        resolve(new File([blob], nextName, { type: mime }));
      },
      mime,
      quality
    );
  });
}

async function resizeCanvasIfNeeded(
  source: CanvasImageSource & { width: number; height: number },
  maxEdge?: number
): Promise<HTMLCanvasElement> {
  const longest = Math.max(source.width, source.height);
  const scale =
    maxEdge && maxEdge > 0 && longest > maxEdge ? maxEdge / longest : 1;
  const w = Math.max(1, Math.round(source.width * scale));
  const h = Math.max(1, Math.round(source.height * scale));
  const out = document.createElement('canvas');
  out.width = w;
  out.height = h;
  const ctx = out.getContext('2d');
  if (!ctx) {
    out.width = 0;
    out.height = 0;
    throw new Error('Canvas 2D context unavailable.');
  }
  ctx.drawImage(source, 0, 0, w, h);
  return out;
}

/**
 * Dynamically decode `.heic` / `.heif` or `.tif` / `.tiff` files into browser-native image Files.
 * Uses hardware createImageBitmap first for HEIC to avoid WASM OOM on mobile, then falls back cleanly.
 */
export async function decodeSpecialImageFile(
  file: File,
  options?: { maxEdge?: number }
): Promise<File> {
  const lower = file.name.toLowerCase();

  if (
    lower.endsWith('.heic') ||
    lower.endsWith('.heif') ||
    file.type === 'image/heic' ||
    file.type === 'image/heif'
  ) {
    if (typeof createImageBitmap === 'function') {
      try {
        const bitmap = await createImageBitmap(file);
        try {
          const scaled = await resizeCanvasIfNeeded(bitmap, options?.maxEdge);
          return await canvasToImageFile(scaled, file.name, 'image/jpeg', 0.92);
        } finally {
          bitmap.close();
        }
      } catch {
        // Fallback to WASM decoder when browser lacks native HEIC support
      }
    }

    const heicModule = await import('heic2any');
    const heic2any = heicModule.default ?? heicModule;
    const output = await heic2any({
      blob: file,
      toType: 'image/jpeg',
      quality: 0.92,
    });
    const jpegBlob = Array.isArray(output) ? output[0] : output;
    if (!jpegBlob) {
      throw new Error('Failed to decode HEIC/HEIF image.');
    }
    const nextName = file.name.replace(/\.(heic|heif)$/i, '.jpg');
    return new File([jpegBlob], nextName, { type: 'image/jpeg' });
  }

  if (
    lower.endsWith('.tif') ||
    lower.endsWith('.tiff') ||
    file.type === 'image/tiff'
  ) {
    const utifModule = await import('utif2');
    const UTIF = utifModule.default ?? utifModule;
    const buffer = await file.arrayBuffer();
    const ifds = UTIF.decode(buffer);
    if (!ifds || ifds.length === 0) {
      throw new Error('No image frames found inside TIFF file.');
    }

    const first = ifds[0];
    UTIF.decodeImage(buffer, first);
    const rgba = UTIF.toRGBA8(first);
    const width = first.width;
    const height = first.height;
    if (!width || !height) {
      throw new Error('Invalid TIFF dimensions.');
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      canvas.width = 0;
      canvas.height = 0;
      throw new Error('Canvas 2D context unavailable.');
    }

    const imgData = new ImageData(new Uint8ClampedArray(rgba), width, height);
    ctx.putImageData(imgData, 0, 0);

    if (options?.maxEdge && Math.max(width, height) > options.maxEdge) {
      try {
        const scaled = await resizeCanvasIfNeeded(canvas, options.maxEdge);
        canvas.width = 0;
        canvas.height = 0;
        return await canvasToImageFile(scaled, file.name, 'image/png');
      } catch (err) {
        canvas.width = 0;
        canvas.height = 0;
        throw err;
      }
    }

    return canvasToImageFile(canvas, file.name, 'image/png');
  }

  return file;
}
