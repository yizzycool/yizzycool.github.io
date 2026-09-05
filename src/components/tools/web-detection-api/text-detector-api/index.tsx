'use client';

import type { WebDetectionFileType } from '../result-canvas';

import { Square, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { isNull, map } from 'lodash';

import useCommonFunction from '../hooks/use-common-function';
import useTextDetector from '../hooks/use-text-detector';
import { UNSUPPORTED_API_TYPES } from '../data/unsupported-types';
import HeaderBlock from '../../common/header-block';
import SystemChecking from '../system-checking';
import Empty from '../empty';
import BoundingBox from '../bounding-box';
import FlipCamera from '../flip-camera';
import UnsupportedCard from '../unsupported-card';
import SectionGap from '../../common/section-gap';
import Tip from '../tip';
import { Card } from '@/components/ui/card';
import { Tabs } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import ResultCanvas from '../result-canvas';
import DetectionResult from '../detection-result';
import RawData from '../raw-data';

const TabList: Array<WebDetectionFileType> = ['image', 'video', 'webcam'];

export default function TextDetectorApi() {
  const { hasCheckedApiStatus, isApiSupported, isProcessing, detect } =
    useTextDetector();

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

  const [ratio, setRatio] = useState(1);

  useEffect(() => {
    if (isNull(results) || !resultRef.current || !canvasRef.current) return;
    const { clientWidth } = resultRef.current;
    const { width } = canvasRef.current;
    if (width > 0) {
      setRatio(clientWidth / width);
    }
  }, [results, resultRef, canvasRef]);

  const transformedResults = useMemo(() => {
    if (isNull(results)) return [];
    return map(results as TextDetectionResults, (result) => {
      const { boundingBox, cornerPoints, rawValue } = result;
      return {
        ...result,
        label: 'Detected Text',
        text: rawValue || 'unknown',
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
        cornerPoints: map(cornerPoints, ({ x, y }) => {
          return {
            x: x * ratio,
            y: y * ratio,
          };
        }),
      };
    });
  }, [results, ratio]);

  return (
    <>
      <HeaderBlock />

      <SectionGap />

      {/* Status Modal */}
      {!hasCheckedApiStatus ? (
        <SystemChecking />
      ) : !isApiSupported ? (
        <UnsupportedCard apiType={UNSUPPORTED_API_TYPES.webApiTextDetector} />
      ) : null}

      <Tip />

      <SectionGap size="sm" />

      <Card>
        <div className="flex items-center justify-between">
          <Tabs
            tabs={TabList}
            onChange={(tab) => setTab(tab as WebDetectionFileType)}
          />
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
              {param.type === 'webcam' && <FlipCamera onClick={flipWebcam} />}
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
  );
}
