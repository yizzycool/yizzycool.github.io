'use client';

import { useState, useEffect } from 'react';
import _isNull from 'lodash/isNull';

const useWebcam = () => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState('user');

  useEffect(() => {
    if (!stream) return;
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  const startCamera = async (facingMode = 'user') => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode },
        audio: false,
      });
      setStream(stream);
      setFacingMode(facingMode);
      return stream;
    } catch (e) {
      console.log('Error accessing webcam:', e);
    }
  };

  const stopCamera = () => {
    stream?.getTracks().forEach((track) => track.stop());
    setStream(null);
  };

  const flipCamera = async () => {
    stopCamera();
    return startCamera(facingMode === 'user' ? 'environment' : 'user');
  };

  return {
    isCameraOpened: !_isNull(stream),
    startCamera,
    stopCamera,
    flipCamera,
  };
};

export default useWebcam;
