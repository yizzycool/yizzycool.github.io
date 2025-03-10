'use client';

import { useMemo, useRef, useState } from 'react';
import useBarcodeDetector from '../hooks/use-barcode-detector';
import useWebcam from '../hooks/use-webcam';
import { Dot } from 'lucide-react';
import Title from '../../components/title';
import Unsupported from '../../components/unsupported';
import LoadingSkeleton from '../components/loading-skeleton';
import Empty from '../components/empty';
import Result, { Param } from '../components/result';
import BoundingBox from '../components/bounding-box';
import _isNull from 'lodash/isNull';
import _map from 'lodash/map';
import _fromPairs from 'lodash/fromPairs';
import _isEmpty from 'lodash/isEmpty';

export default function BarcodeDetectorApi() {
  const [param, setParam] = useState<Param>({
    type: '',
    blob: null,
    stream: null,
  });
  const [results, setResults] = useState<BarcodeDetectionResults | null>(null);

  const resultRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const { isSupported, isPartialUnsupported, detect } = useBarcodeDetector();

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
      const { boundingBox, cornerPoints } = result;
      return {
        ...result,
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
        cornerPoints: _map(cornerPoints, ({ x, y }) => {
          return {
            x: x * ratio,
            y: y * ratio,
          };
        }),
      };
    });
  }, [results]);

  return (
    <div className="mx-auto max-w-screen-2xl pt-[68px] text-center">
      <Title>Barcode Detector</Title>
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

              <div className="mb-4 mt-10 text-lg font-bold">
                Detected barcode values
              </div>
              {_isEmpty(transformedResults) ? (
                'No Result'
              ) : (
                <div className="m-auto w-fit text-left">
                  {_map(transformedResults, ({ rawValue }, idx) => (
                    <div key={idx} className="flex items-center">
                      <Dot className="mr-2" />
                      {rawValue}
                    </div>
                  ))}
                </div>
              )}
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
