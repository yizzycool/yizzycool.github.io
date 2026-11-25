'use client';

import { useCallback, useState, useSyncExternalStore } from 'react';

import useApiCommon from './use-api-common';

function getImageDataFromSource(
  image: HTMLImageElement | HTMLCanvasElement
): ImageData | null {
  if (image instanceof HTMLCanvasElement) {
    const ctx = image.getContext('2d', { willReadFrequently: true });
    if (!ctx || image.width === 0 || image.height === 0) return null;
    return ctx.getImageData(0, 0, image.width, image.height);
  }

  const width = image.naturalWidth || image.width;
  const height = image.naturalHeight || image.height;
  if (width === 0 || height === 0) return null;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return null;

  ctx.drawImage(image, 0, 0, width, height);
  return ctx.getImageData(0, 0, width, height);
}

export default function useBarcodeDetector() {
  const [detector] = useState<BarcodeDetectorInstance | null>(() => {
    if (typeof window === 'undefined' || !window.BarcodeDetector) return null;
    try {
      return new window.BarcodeDetector();
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

  const detect = useCallback(
    async (
      image: HTMLImageElement | HTMLCanvasElement
    ): Promise<BarcodeDetectionResults | null> => {
      try {
        if (detector) {
          setIsProcessing(true);
          const nativeResults = await detector.detect(image);
          setIsProcessing(false);
          return nativeResults;
        }

        // Pure-JS QR fallback for Safari, Firefox, and Linux/Windows Chrome
        setIsProcessing(true);
        const imageData = getImageDataFromSource(image);
        if (!imageData) {
          setIsProcessing(false);
          return [];
        }

        const { default: jsQR } = await import('jsqr');
        const qr = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'attemptBoth',
        });
        setIsProcessing(false);

        if (!qr || !qr.data) {
          return [];
        }

        const points = [
          qr.location.topLeftCorner,
          qr.location.topRightCorner,
          qr.location.bottomRightCorner,
          qr.location.bottomLeftCorner,
        ];
        const minX = Math.min(...points.map((p) => p.x));
        const maxX = Math.max(...points.map((p) => p.x));
        const minY = Math.min(...points.map((p) => p.y));
        const maxY = Math.max(...points.map((p) => p.y));

        return [
          {
            format: 'qr_code',
            rawValue: qr.data,
            boundingBox: {
              x: minX,
              y: minY,
              left: minX,
              top: minY,
              right: maxX,
              bottom: maxY,
              width: Math.max(0, maxX - minX),
              height: Math.max(0, maxY - minY),
            },
            cornerPoints: points.map((p) => ({ x: p.x, y: p.y })),
          },
        ];
      } catch (_e) {
        setError(
          'Barcode detection failed! Please check the image format and try again.'
        );
        setIsProcessing(false);
        return null;
      }
    },
    [detector, setError, setIsProcessing]
  );

  return {
    hasCheckedApiStatus,
    isApiSupported,
    usingJsFallback: isApiSupported === false,
    isProcessing,
    detect,
  };
}

function subscribe() {
  return () => {};
}

function getSnapshot() {
  return typeof window !== 'undefined' && 'BarcodeDetector' in window;
}

function getServerSnapshot() {
  return null;
}
