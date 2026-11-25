'use client';

import type Tesseract from 'tesseract.js';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';

import useApiCommon from './use-api-common';

export type OcrLanguage = 'eng' | 'chi_tra' | 'eng+chi_tra';

function makeBox(
  x0: number,
  y0: number,
  x1: number,
  y1: number
): DetectedBoundingBox {
  return {
    x: x0,
    y: y0,
    left: x0,
    top: y0,
    right: x1,
    bottom: y1,
    width: Math.max(0, x1 - x0),
    height: Math.max(0, y1 - y0),
  };
}

function mapPageToTextResults(
  page: Tesseract.Page,
  fallbackWidth: number,
  fallbackHeight: number
): TextDetectionResults {
  const lineResults: TextDetectionResults = [];

  for (const block of page.blocks ?? []) {
    for (const paragraph of block.paragraphs ?? []) {
      for (const line of paragraph.lines ?? []) {
        const cleaned = line.text.replace(/\s+/g, ' ').trim();
        if (!cleaned) continue;

        const { x0, y0, x1, y1 } = line.bbox;
        lineResults.push({
          rawValue: cleaned,
          boundingBox: makeBox(x0, y0, x1, y1),
          cornerPoints: [
            { x: x0, y: y0 },
            { x: x1, y: y0 },
            { x: x1, y: y1 },
            { x: x0, y: y1 },
          ],
        });
      }
    }
  }

  if (lineResults.length > 0) {
    return lineResults;
  }

  const fullText = page.text?.trim();
  if (!fullText) {
    return [];
  }

  return [
    {
      rawValue: fullText,
      boundingBox: makeBox(0, 0, fallbackWidth, fallbackHeight),
      cornerPoints: [
        { x: 0, y: 0 },
        { x: fallbackWidth, y: 0 },
        { x: fallbackWidth, y: fallbackHeight },
        { x: 0, y: fallbackHeight },
      ],
    },
  ];
}

export default function useTextDetector() {
  const [detector] = useState<TextDetectorInstance | null>(() => {
    if (typeof window === 'undefined' || !window.TextDetector) return null;
    try {
      return new window.TextDetector();
    } catch (_e) {
      return null;
    }
  });

  const isApiSupported = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  const { setError, isProcessing, setIsProcessing, hasCheckedApiStatus } =
    useApiCommon({ isApiSupported });

  const [ocrLang, setOcrLangState] = useState<OcrLanguage>('eng');
  const [nativeReturnedEmpty, setNativeReturnedEmpty] = useState(false);
  const [ocrProgress, setOcrProgress] = useState<number | null>(null);
  const [ocrStatus, setOcrStatus] = useState('');

  const ocrLangRef = useRef<OcrLanguage>('eng');
  const workerRef = useRef<Tesseract.Worker | null>(null);
  const workerLangRef = useRef<OcrLanguage | null>(null);
  const nativeEmptyRef = useRef(false);
  const isBusyRef = useRef(false);

  useEffect(() => {
    return () => {
      void workerRef.current?.terminate();
      workerRef.current = null;
    };
  }, []);

  const setOcrLang = useCallback((nextLang: OcrLanguage) => {
    ocrLangRef.current = nextLang;
    setOcrLangState(nextLang);
  }, []);

  const ensureWorker = useCallback(async (lang: OcrLanguage) => {
    const { createWorker, OEM } = await import('tesseract.js');

    if (!workerRef.current) {
      workerRef.current = await createWorker(lang, OEM.LSTM_ONLY, {
        logger: (msg) => {
          if (typeof msg.progress === 'number') {
            setOcrProgress(msg.progress);
          }
          if (msg.status) {
            setOcrStatus(msg.status);
          }
        },
      });
      workerLangRef.current = lang;
      return workerRef.current;
    }

    if (workerLangRef.current !== lang) {
      await workerRef.current.reinitialize(lang);
      workerLangRef.current = lang;
    }

    return workerRef.current;
  }, []);

  const detect = useCallback(
    async (
      image: HTMLImageElement | HTMLCanvasElement
    ): Promise<TextDetectionResults | null> => {
      if (isBusyRef.current) return null;
      isBusyRef.current = true;

      try {
        // 1. Try native Shape Detection API if present and not known to omit rawValue
        if (detector && !nativeEmptyRef.current) {
          setIsProcessing(true);
          const nativeResults = await detector.detect(image);
          const hasReadableText = nativeResults.some((item) =>
            Boolean(item.rawValue && item.rawValue.trim().length > 0)
          );

          if (hasReadableText) {
            setIsProcessing(false);
            return nativeResults;
          }

          // macOS CoreImage CIDetectorTypeText locates boxes without OCR text; fall back to Tesseract.js
          nativeEmptyRef.current = true;
          setNativeReturnedEmpty(true);
        }

        // 2. Client-side Tesseract.js WASM OCR fallback
        setIsProcessing(true);
        setOcrProgress(0);
        setOcrStatus('Loading OCR engine...');

        const worker = await ensureWorker(ocrLangRef.current);
        const result = await worker.recognize(
          image,
          {},
          { text: true, blocks: true }
        );

        const width =
          image instanceof HTMLCanvasElement
            ? image.width
            : image.naturalWidth || image.width;
        const height =
          image instanceof HTMLCanvasElement
            ? image.height
            : image.naturalHeight || image.height;

        return mapPageToTextResults(result.data, width, height);
      } catch (_e) {
        setError('Text detection failed! Please try again with another image.');
        return null;
      } finally {
        isBusyRef.current = false;
        setIsProcessing(false);
        setOcrProgress(null);
        setOcrStatus('');
      }
    },
    [detector, ensureWorker, setError, setIsProcessing]
  );

  return {
    hasCheckedApiStatus,
    isApiSupported,
    usingOcrFallback: isApiSupported === false || nativeReturnedEmpty,
    isProcessing,
    ocrLang,
    setOcrLang,
    ocrProgress,
    ocrStatus,
    detect,
  };
}

function subscribe() {
  return () => {};
}

function getSnapshot() {
  return typeof window !== 'undefined' && 'TextDetector' in window;
}

function getServerSnapshot() {
  return null;
}
