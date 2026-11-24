function canvasToPngFile(
  canvas: HTMLCanvasElement,
  filename: string
): Promise<File> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Failed to encode decoded image as PNG.'));
        return;
      }
      const nextName = filename.replace(/\.(heic|heif|tif|tiff)$/i, '.png');
      resolve(new File([blob], nextName, { type: 'image/png' }));
    }, 'image/png');
  });
}

/**
 * Dynamically decode `.heic` / `.heif` or `.tif` / `.tiff` files into browser-native PNG Files.
 * Non-specialized image formats are returned immediately untouched with zero dynamic imports.
 */
export async function decodeSpecialImageFile(file: File): Promise<File> {
  const lower = file.name.toLowerCase();

  if (
    lower.endsWith('.heic') ||
    lower.endsWith('.heif') ||
    file.type === 'image/heic' ||
    file.type === 'image/heif'
  ) {
    const heicModule = await import('heic2any');
    const heic2any = heicModule.default ?? heicModule;
    const output = await heic2any({
      blob: file,
      toType: 'image/png',
      quality: 1,
    });
    const pngBlob = Array.isArray(output) ? output[0] : output;
    if (!pngBlob) {
      throw new Error('Failed to decode HEIC/HEIF image.');
    }
    const nextName = file.name.replace(/\.(heic|heif)$/i, '.png');
    return new File([pngBlob], nextName, { type: 'image/png' });
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
    if (!ctx) throw new Error('Canvas 2D context unavailable.');

    const imgData = new ImageData(new Uint8ClampedArray(rgba), width, height);
    ctx.putImageData(imgData, 0, 0);
    return canvasToPngFile(canvas, file.name);
  }

  return file;
}
