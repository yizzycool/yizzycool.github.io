'use client';

import { useEffect, useState } from 'react';

export default function useTextDetector({ createInstance = true } = {}) {
  const [isSupported, setIsSupported] = useState<boolean | null>(null);
  const [isPartialUnsupported, setIsPartialUnsupported] = useState<
    boolean | null
  >(null);
  const [detector, setDetector] = useState<TextDetectorInstance | null>(null);

  useEffect(() => {
    checkCapability();
  }, []);

  useEffect(() => {
    if (!isSupported || !createInstance) return;
    initTextDetector();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSupported]);

  // To check if text detector is supported
  const checkCapability = () => {
    setIsSupported(!!window.TextDetector);
  };

  const initTextDetector = async () => {
    if (window.TextDetector) {
      try {
        const detector = await new window.TextDetector();
        setDetector(detector);
        setIsPartialUnsupported(false);
      } catch (_e) {
        setIsPartialUnsupported(true);
      }
    }
  };

  const detect = async (
    image: HTMLImageElement | HTMLCanvasElement
  ): Promise<TextDetectionResults | null> => {
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
