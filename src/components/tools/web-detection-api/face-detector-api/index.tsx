'use client';

import { useMemo, useRef, useState } from 'react';
import useFaceDetector from '../hooks/use-face-detector';
import useWebcam from '../hooks/use-webcam';
import Title from '../../components/title';
import Unsupported from '../../components/unsupported';
import LoadingSkeleton from '../components/loading-skeleton';
import Empty from '../components/empty';
import Result, { Param } from '../components/result';
import BoundingBox from '../components/bounding-box';
import _isNull from 'lodash/isNull';
import _map from 'lodash/map';
import _fromPairs from 'lodash/fromPairs';

export default function FaceDetectorApi() {
  const [param, setParam] = useState<Param>({
    type: '',
    blob: null,
    stream: null,
  });
  const [results, setResults] = useState<FaceDetectionResults | null>(null);

  const resultRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const { isSupported, isPartialUnsupported, detect } = useFaceDetector();

  const isLoading =
    _isNull(isSupported) || (isSupported && _isNull(isPartialUnsupported));

  const { startCamera, stopCamera } = useWebcam();

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
    stopCamera();
    const stream = await startCamera();
    setParam({ type: 'webcam', blob: null, stream: stream });
  };

  const onCanvasDraw = async (canvas: HTMLCanvasElement) => {
    setResults(null);
    const results = await detect(canvas);
    setResults(results);
  };

  const isAnyResult = !!param.type;

  const transformedResults = useMemo(() => {
    if (_isNull(results)) return [];
    const { clientWidth } = resultRef.current as HTMLDivElement;
    const { width } = canvasRef.current as HTMLCanvasElement;
    const ratio = clientWidth / width;
    return _map(results, (result) => {
      const { boundingBox, landmarks } = result;
      return {
        boundingBox: {
          bottom: boundingBox.bottom * ratio,
          height: boundingBox.height * ratio,
          left: boundingBox.left * ratio,
          right: boundingBox.right * ratio,
          top: boundingBox.top * ratio,
          width: boundingBox.width * ratio,
          x: boundingBox.x * ratio,
          y: boundingBox.y * ratio,
        },
        landmarks: _map(landmarks, (landmark) => {
          return {
            ...landmark,
            locations: _map(landmark.locations, ({ x, y }) => ({
              x: x * ratio,
              y: y * ratio,
            })),
          };
        }),
      };
    });
  }, [results]);

  return (
    <div className="mx-auto max-w-screen-2xl pt-[68px] text-center">
      <Title>Face Detector</Title>
      {/* <SupportTable /> */}
      {isLoading ? (
        <LoadingSkeleton />
      ) : !isSupported ? (
        <Unsupported type="unsupported" />
      ) : isPartialUnsupported ? (
        <Unsupported type="partialUnsupported" />
      ) : (
        <>
          {isAnyResult && (
            <div className="mt-10 px-5">
              <div className="mb-4 text-lg font-bold">Detected Results</div>
              <div ref={resultRef} className="relative mx-auto w-fit">
                <Result
                  canvasRef={canvasRef}
                  param={param}
                  onCanvasDraw={onCanvasDraw}
                />
                <BoundingBox results={transformedResults} />
              </div>
            </div>
          )}
          <Empty
            isEmpty={!isAnyResult}
            processImage={processImage}
            processVideo={processVideo}
            processWebcam={processWebcam}
          />
        </>
      )}
    </div>
  );
}
