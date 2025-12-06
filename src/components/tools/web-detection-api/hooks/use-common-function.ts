import { useRef, useState } from 'react';
import { Param, WebDetectionFileType } from '../components/result-canvas';
import useWebcam from './use-webcam';

type Props = {
  detect: (
    image: HTMLImageElement | HTMLCanvasElement
  ) => Promise<
    FaceDetectionResults | BarcodeDetectionResults | TextDetectionResults | null
  >;
};

export const defaultParam: Param = {
  type: '',
  blob: null,
  stream: null,
};

export default function useCommonFunction({ detect }: Props) {
  const [param, setParam] = useState<Param>(defaultParam);
  const [results, setResults] = useState<
    FaceDetectionResults | BarcodeDetectionResults | TextDetectionResults | null
  >(null);
  const [tab, setTab] = useState<WebDetectionFileType>('image');

  const resultRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const { isCameraOpened, startCamera, stopCamera, flipCamera } = useWebcam();

  const processImage = async (file: File | undefined) => {
    if (!file) return;
    stopCamera();
    setParam({ type: 'image', blob: file, stream: null });
  };

  const processVideo = async (file: File | undefined) => {
    if (!file) return;
    stopCamera();
    setParam({ type: 'video', blob: file, stream: null });
  };

  const processWebcam = async () => {
    if (isCameraOpened) {
      setParam(defaultParam);
      stopCamera();
    } else {
      stopCamera();
      const stream = await startCamera('environment');
      setParam({ type: 'webcam', blob: null, stream: stream });
    }
  };

  const flipWebcam = async () => {
    const stream = await flipCamera();
    setParam({ type: 'webcam', blob: null, stream: stream });
  };

  const onCanvasDraw = async (canvas: HTMLCanvasElement) => {
    setResults(null);
    const results = await detect(canvas);
    setResults(results);
  };

  const onClear = () => {
    if (param.type === 'webcam') {
      stopCamera();
    }
    setParam(defaultParam);
    setResults(null);
  };

  return {
    param,
    setParam,
    results,
    setResults,
    tab,
    setTab,
    resultRef,
    canvasRef,
    isEmpty: !param.type,
    processImage,
    processVideo,
    processWebcam,
    flipWebcam,
    onCanvasDraw,
    onClear,
  };
}
