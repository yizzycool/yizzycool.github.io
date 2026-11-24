import type { ChromeAiActionId } from '../types/studio';

export type NativeAiCapabilities = {
  faceDetector: boolean;
  textDetector: boolean;
  chromeAiCopy: boolean;
};

export type DetectedFaceBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type DetectedTextBlock = {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

type RewriterGlobal = {
  availability?: (opts?: { outputLanguage?: string }) => Promise<string>;
  create?: (opts?: {
    tone?: string;
    length?: string;
    outputLanguage?: string;
  }) => Promise<{
    rewrite: (input: string) => Promise<string>;
    destroy?: () => void;
  }>;
};

type LanguageModelGlobal = {
  availability?: () => Promise<string>;
  create?: (opts?: {
    initialPrompts?: Array<{ role: string; content: string }>;
  }) => Promise<{
    prompt: (input: string) => Promise<string>;
    destroy?: () => void;
  }>;
};

/**
 * Probe zero-download Browser Shape Detection APIs & Chrome Built-in AI cleanly
 * with zero blocking prompts or implicit downloads.
 */
export async function probeNativeAiCapabilities(): Promise<NativeAiCapabilities> {
  if (typeof window === 'undefined') {
    return { faceDetector: false, textDetector: false, chromeAiCopy: false };
  }

  const faceDetector = 'FaceDetector' in window;
  const textDetector = 'TextDetector' in window;

  let chromeAiCopy = false;
  try {
    const win = window as unknown as {
      Rewriter?: RewriterGlobal;
      LanguageModel?: LanguageModelGlobal;
    };
    const rewriterStatus = await win.Rewriter?.availability?.();
    const lmStatus = await win.LanguageModel?.availability?.();
    chromeAiCopy =
      (rewriterStatus !== undefined && rewriterStatus !== 'unavailable') ||
      (lmStatus !== undefined && lmStatus !== 'unavailable');
  } catch {
    chromeAiCopy = false;
  }

  return { faceDetector, textDetector, chromeAiCopy };
}

export async function detectFacesOnImage(
  sourceEl: HTMLImageElement | HTMLCanvasElement
): Promise<DetectedFaceBox[]> {
  if (typeof window === 'undefined' || !('FaceDetector' in window)) {
    throw new Error(
      'Browser FaceDetector API is not available in this browser.'
    );
  }
  const detector = new window.FaceDetector();
  const faces = await detector.detect(sourceEl);
  return faces.map((f) => ({
    x: f.boundingBox.x,
    y: f.boundingBox.y,
    width: f.boundingBox.width,
    height: f.boundingBox.height,
  }));
}

/**
 * Generate a transparent overlay PNG containing pixelated privacy mosaics over all detected faces.
 */
export async function createFaceMosaicLayerBlob(
  sourceEl: HTMLImageElement | HTMLCanvasElement,
  faces: DetectedFaceBox[],
  blockSize = 18
): Promise<Blob | null> {
  if (faces.length === 0) return null;
  const w =
    sourceEl instanceof HTMLImageElement
      ? sourceEl.naturalWidth || sourceEl.width
      : sourceEl.width;
  const h =
    sourceEl instanceof HTMLImageElement
      ? sourceEl.naturalHeight || sourceEl.height
      : sourceEl.height;

  const srcCanvas = document.createElement('canvas');
  srcCanvas.width = w;
  srcCanvas.height = h;
  const sCtx = srcCanvas.getContext('2d', { willReadFrequently: true });
  if (!sCtx) return null;
  sCtx.drawImage(sourceEl, 0, 0, w, h);

  const outCanvas = document.createElement('canvas');
  outCanvas.width = w;
  outCanvas.height = h;
  const oCtx = outCanvas.getContext('2d');
  if (!oCtx) return null;

  const step = Math.max(6, blockSize);
  for (const box of faces) {
    const bx = Math.max(0, Math.floor(box.x));
    const by = Math.max(0, Math.floor(box.y));
    const bw = Math.min(w - bx, Math.ceil(box.width));
    const bh = Math.min(h - by, Math.ceil(box.height));
    if (bw < 4 || bh < 4) continue;

    for (let y = by; y < by + bh; y += step) {
      for (let x = bx; x < bx + bw; x += step) {
        const pw = Math.min(step, bx + bw - x);
        const ph = Math.min(step, by + bh - y);
        const sx = Math.min(w - 1, Math.floor(x + pw / 2));
        const sy = Math.min(h - 1, Math.floor(y + ph / 2));
        const px = sCtx.getImageData(sx, sy, 1, 1).data;
        oCtx.fillStyle = `rgba(${px[0]}, ${px[1]}, ${px[2]}, 1)`;
        oCtx.fillRect(x, y, pw, ph);
      }
    }
  }

  return new Promise<Blob | null>((resolve) =>
    outCanvas.toBlob(resolve, 'image/png')
  );
}

export async function detectTextBlocksOnImage(
  sourceEl: HTMLImageElement | HTMLCanvasElement
): Promise<DetectedTextBlock[]> {
  if (typeof window === 'undefined' || !('TextDetector' in window)) {
    throw new Error(
      'Browser TextDetector OCR API is not available in this browser.'
    );
  }
  const detector = new window.TextDetector();
  const blocks = await detector.detect(sourceEl);
  return blocks
    .filter((b) => Boolean(b.rawValue?.trim()))
    .map((b) => ({
      text: b.rawValue.trim(),
      x: b.boundingBox.x,
      y: b.boundingBox.y,
      width: b.boundingBox.width,
      height: b.boundingBox.height,
    }));
}

/**
 * Run Chrome Built-in AI copy generation / rewriting on a text layer string cleanly,
 * always destroying ephemeral model sessions in `finally`.
 */
export async function runChromeAiCopyAction(
  inputText: string,
  action: ChromeAiActionId
): Promise<string> {
  const text = inputText.trim() || 'Create a bold poster headline';
  const win = window as unknown as {
    Rewriter?: RewriterGlobal;
    LanguageModel?: LanguageModelGlobal;
  };

  if (action === 'shorter' && win.Rewriter?.create) {
    const status = await win.Rewriter.availability?.();
    if (status && status !== 'unavailable') {
      const rewriter = await win.Rewriter.create({ length: 'shorter' });
      try {
        return (await rewriter.rewrite(text)).trim();
      } finally {
        rewriter.destroy?.();
      }
    }
  }

  if (!win.LanguageModel?.create) {
    throw new Error(
      'Chrome Built-in Prompt AI is not available in this browser.'
    );
  }

  const promptMap: Record<ChromeAiActionId, string> = {
    headline: `Rewrite the following graphic design text into 1 punchy, high-impact poster headline (return only the rewritten text):\n\n${text}`,
    shorter: `Make the following poster text shorter and punchier (return only the shortened text):\n\n${text}`,
    translate: `If this text is Chinese, translate to natural English; if English, translate to Traditional Chinese (return only the translation):\n\n${text}`,
    grammar: `Fix spelling and grammar in this text cleanly while preserving tone (return only the corrected text):\n\n${text}`,
  };

  const session = await win.LanguageModel.create();
  try {
    const result = await session.prompt(promptMap[action]);
    return result.trim();
  } finally {
    session.destroy?.();
  }
}
