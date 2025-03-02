'use client';

import { useEffect, useState } from 'react';
import {
  FaceDetectionResults,
  FaceDetectorInstance,
  WindowDetector,
} from '../types/types';

export default function useFaceDetector({ createInstance = true } = {}) {
  const [isSupported, setIsSupported] = useState<boolean | null>(null);
  const [isPartialUnsupported, setIsPartialUnsupported] = useState<
    boolean | null
  >(null);
  const [detector, setDetector] = useState<FaceDetectorInstance | null>(null);

  useEffect(() => {
    checkCapability();
  }, []);

  useEffect(() => {
    if (!isSupported || !createInstance) return;
    initLanguageDetector();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSupported]);

  // To check if language detector is supported
  const checkCapability = () => {
    const _window = window as unknown as WindowDetector;
    setIsSupported(!!_window.FaceDetector);
  };

  const initLanguageDetector = async () => {
    const _window = window as unknown as WindowDetector;
    if (_window.FaceDetector) {
      try {
        const detector = await new _window.FaceDetector();
        setDetector(detector);
        setIsPartialUnsupported(false);
      } catch (_e) {
        setIsPartialUnsupported(true);
      }
    }
  };

  const detect = async (
    image: HTMLImageElement | HTMLCanvasElement
  ): Promise<FaceDetectionResults | null> => {
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
