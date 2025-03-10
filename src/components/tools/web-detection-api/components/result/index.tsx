'use client';

import { useEffect, useRef } from 'react';

export type Param = {
  type: string;
  blob: File | null;
  stream: MediaStream | null | undefined;
};

export default function ImageResult({
  canvasRef,
  param,
  onCanvasDraw,
}: {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  param: Param;
  onCanvasDraw: (canvas: HTMLCanvasElement) => Promise<void>;
}) {
  const { type, blob, stream } = param;

  const imageRef = useRef<HTMLImageElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamVideoRef = useRef<HTMLVideoElement | null>(null);

  const requestIdRef = useRef<number | null>(null);

  // Clear requestIdRef before unmount
  useEffect(() => {
    return () => {
      if (requestIdRef.current) {
        cancelAnimationFrame(requestIdRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const resetRefs = () => {
      if (imageRef?.current) imageRef.current.src = '';
      if (videoRef?.current) videoRef.current.src = '';
      if (streamVideoRef?.current) streamVideoRef.current.srcObject = null;
    };

    if (type === 'image' && blob) {
      if (!imageRef?.current) return;
      resetRefs();
      imageRef.current.src = URL.createObjectURL(blob);
    } else if (type === 'video' && blob) {
      if (!videoRef?.current) return;
      resetRefs();
      videoRef.current.src = URL.createObjectURL(blob);
    } else if (type === 'webcam' && stream) {
      if (!streamVideoRef?.current) return;
      resetRefs();
      streamVideoRef.current.srcObject = stream;
    } else {
      if (requestIdRef.current) {
        cancelAnimationFrame(requestIdRef.current);
        requestIdRef.current = null;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [param]);

  const onImageLoad = () => {
    if (!imageRef.current) return;
    if (requestIdRef.current) {
      cancelAnimationFrame(requestIdRef.current);
      requestIdRef.current = null;
    }
    drawImageOnCanvas(imageRef.current);
  };

  const onVideoCanPlayThrough = () => {
    if (!videoRef.current) return;
    if (requestIdRef.current) {
      cancelAnimationFrame(requestIdRef.current);
      requestIdRef.current = null;
    }
    drawVideoOnCanvas(videoRef.current);
  };

  const onStreamVideoCanPlayThrough = () => {
    if (!streamVideoRef.current) return;
    if (requestIdRef.current) {
      cancelAnimationFrame(requestIdRef.current);
      requestIdRef.current = null;
    }
    drawStreamVideoOnCanvas(streamVideoRef.current);
  };

  const drawImageOnCanvas = (element: HTMLImageElement) => {
    const width = element.naturalWidth;
    const height = element.naturalHeight;
    const canvas = canvasRef.current as HTMLCanvasElement;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(element, 0, 0);
    onCanvasDraw(canvas);
  };

  const drawVideoOnCanvas = (element: HTMLVideoElement) => {
    const width = element.videoWidth;
    const height = element.videoHeight;
    const canvas = canvasRef.current as HTMLCanvasElement;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    ctx.drawImage(element, 0, 0);
    onCanvasDraw(canvas);
    requestIdRef.current = requestAnimationFrame(() =>
      drawVideoOnCanvas(element)
    );
  };

  const drawStreamVideoOnCanvas = (element: HTMLVideoElement) => {
    const width = element.videoWidth;
    const height = element.videoHeight;
    const canvas = canvasRef.current as HTMLCanvasElement;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    ctx.save();
    ctx.scale(-1, 1);
    ctx.drawImage(element, -width, 0);
    ctx.restore();
    onCanvasDraw(canvas);
    requestIdRef.current = requestAnimationFrame(() =>
      drawStreamVideoOnCanvas(element)
    );
  };

  return (
    <>
      <canvas ref={canvasRef} className="max-h-96 w-fit" />
      <img
        ref={imageRef}
        className="absolute left-0 top-0 -z-10 opacity-0"
        onLoad={onImageLoad}
        alt="hidden image"
      />
      <video
        ref={videoRef}
        className="absolute left-0 top-0 -z-10 max-h-full max-w-full opacity-0"
        onCanPlayThrough={onVideoCanPlayThrough}
        autoPlay
        loop
      />
      <video
        ref={streamVideoRef}
        className="absolute left-0 top-0 -z-10 max-h-full max-w-full opacity-0"
        onCanPlayThrough={onStreamVideoCanPlayThrough}
        autoPlay
        loop
      />
    </>
  );
}
