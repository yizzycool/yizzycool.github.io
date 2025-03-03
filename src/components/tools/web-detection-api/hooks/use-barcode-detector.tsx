'use client';

import { useEffect, useState } from 'react';
import {
  BarcodeDetectionResults,
  BarcodeDetectorInstance,
  WindowDetector,
} from '../types/types';

export default function useBarcodeDetector({ createInstance = true } = {}) {
  const [isSupported, setIsSupported] = useState<boolean | null>(null);
  const [isPartialUnsupported, setIsPartialUnsupported] = useState<
    boolean | null
  >(null);
  const [detector, setDetector] = useState<BarcodeDetectorInstance | null>(
    null
  );

  useEffect(() => {
    checkCapability();
  }, []);

  useEffect(() => {
    if (!isSupported || !createInstance) return;
    initBarcodeDetector();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSupported]);

  // To check if barcode detector is supported
  const checkCapability = () => {
    const _window = window as unknown as WindowDetector;
    setIsSupported(!!_window.BarcodeDetector);
  };

  const initBarcodeDetector = async () => {
    const _window = window as unknown as WindowDetector;
    if (_window.BarcodeDetector) {
      try {
        const detector = await new _window.BarcodeDetector();
        setDetector(detector);
        setIsPartialUnsupported(false);
      } catch (_e) {
        setIsPartialUnsupported(true);
      }
    }
  };

  const detect = async (
    image: HTMLImageElement | HTMLCanvasElement
  ): Promise<BarcodeDetectionResults | null> => {
    if (!detector) return null;
    const results = await detector.detect(image);
    return results;
  };

  return {
    isSupported,
    isPartialUnsupported,
    detect,
  };
}
