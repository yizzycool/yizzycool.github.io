'use client';

import { useEffect, useState } from 'react';

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
    initFaceDetector();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSupported]);

  // To check if face detector is supported
  const checkCapability = () => {
    setIsSupported(!!window.FaceDetector);
  };

  const initFaceDetector = async () => {
    if (window.FaceDetector) {
      try {
        const detector = await new window.FaceDetector();
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
