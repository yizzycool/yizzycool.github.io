'use client';

import { Square, Trash2 } from 'lucide-react';
import { useMemo } from 'react';
import useCommonFunction from '../hooks/use-common-function';
import useFaceDetector from '../hooks/use-face-detector';
import { UnsupportedApiTypes } from '../data/unsupported-types';
import LoadingSkeleton from '../components/loading-skeleton';
import HeaderBlock from '../../components/header-block';
import Empty from '../components/empty';
import BoundingBox from '../components/bounding-box';
import FlipCamera from '../components/flip-camera';
import UnsupportedCard from '../components/unsupported-card';
import SectionGap from '../../components/section-gap';
import Snackbar from '@/components/common/snackbar';
import Tip from '../components/tip';
import Card from '@/components/common/card';
import Tabs from '../components/tabs';
import Button from '@/components/common/button';
import ResultCanvas from '../components/result-canvas';
import DetectionResult from '../components/detection-result';
import RawData from '../components/raw-data';
import _isNull from 'lodash/isNull';
import _map from 'lodash/map';
import _fromPairs from 'lodash/fromPairs';

export default function FaceDetectorApi() {
  const {
    hasCheckedApiStatus,
    isApiSupported,
    isProcessing,
    error,
    detect,
    resetError,
  } = useFaceDetector();

  const {
    param,
    // setParam,
    results,
    // setResults,
    tab,
    setTab,
    resultRef,
    canvasRef,
    isEmpty,
    processImage,
    processVideo,
    processWebcam,
    flipWebcam,
    onCanvasDraw,
    onClear,
  } = useCommonFunction({ detect });

  const transformedResults = useMemo(() => {
    if (_isNull(results) || !resultRef?.current) return [];
    const { clientWidth } = resultRef.current as HTMLDivElement;
    const { width } = canvasRef.current as HTMLCanvasElement;
    const ratio = clientWidth / width;
    return _map(results as FaceDetectionResults, (result, idx) => {
      const { boundingBox, landmarks } = result;
      return {
        ...result,
        label: `Person ${idx + 1}`,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [results]);

  return (
    <>
      <HeaderBlock />

      <SectionGap />

      {!hasCheckedApiStatus ? (
        <LoadingSkeleton />
      ) : !isApiSupported ? (
        <UnsupportedCard apiType={UnsupportedApiTypes.webApiFaceDetector} />
      ) : (
        <>
          <Tip />

          <SectionGap size="sm" />

          <Card>
            <div className="flex items-center justify-between">
              <Tabs tab={tab} setTab={setTab} />
              {!!param.type && (
                <Button
                  variant="error"
                  size="xs"
                  icon={param.type === 'webcam' ? Square : Trash2}
                  iconStrokeWidth={param.type === 'webcam' ? 4 : 2}
                  onClick={onClear}
                >
                  {param.type === 'webcam' ? 'Stop' : 'Clear'}
                </Button>
              )}
            </div>
            {isEmpty ? (
              <Empty
                tab={tab}
                processImage={processImage}
                processVideo={processVideo}
                processWebcam={processWebcam}
              />
            ) : (
              <div className="py-8">
                <div ref={resultRef} className="relative mx-auto h-fit w-fit">
                  <ResultCanvas
                    canvasRef={canvasRef}
                    param={param}
                    onCanvasDraw={onCanvasDraw}
                  />
                  <BoundingBox results={transformedResults} />
                  {param.type === 'webcam' && (
                    <FlipCamera onClick={flipWebcam} />
                  )}
                </div>
              </div>
            )}
          </Card>

          <SectionGap size="sm" />

          <DetectionResult
            results={transformedResults}
            isProcessing={isProcessing}
          />

          <SectionGap size="sm" />

          <RawData results={results} />
        </>
      )}

      <Snackbar variant="error" open={error} onClose={resetError} />
    </>
  );
}
