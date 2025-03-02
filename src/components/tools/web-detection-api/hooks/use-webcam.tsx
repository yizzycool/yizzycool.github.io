'use client';

import { useState, useEffect } from 'react';

const useWebcam = () => {
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    if (!stream) return;
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
      setStream(stream);
      return stream;
    } catch (err) {
      console.error('Error accessing webcam:', err);
    }
  };

  const stopCamera = () => {
    stream?.getTracks().forEach((track) => track.stop());
    setStream(null);
  };

  return { startCamera, stopCamera };
};

export default useWebcam;
