'use client';

import { useMemo, useState } from 'react';
import { isNull, map } from 'lodash';

import HeaderBlock from '../../common/header-block';
import SectionGap from '../../common/section-gap';
import DarkroomInspector from '../darkroom-inspector';
import { DETECTION_SHORTCUTS } from '../data/detection-shortcuts';
import { UNSUPPORTED_API_TYPES } from '../data/unsupported-types';
import DetectionTabs from '../detection-tabs';
import useCommonFunction from '../hooks/use-common-function';
import useTextDetector from '../hooks/use-text-detector';
import SystemChecking from '../system-checking';
import UnsupportedCard from '../unsupported-card';

export default function TextDetectorApi() {
  const { hasCheckedApiStatus, isApiSupported, isProcessing, detect } =
    useTextDetector();

  const {
    param,
    results,
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
        cornerPoints: map(cornerPoints, ({ x, y }) => ({
          x: x * ratio,
          y: y * ratio,
        })),
      };
    });
  }, [results, ratio]);

  return (
    <>
      <HeaderBlock customShortcuts={DETECTION_SHORTCUTS} />

      <SectionGap />

      {/* Status Modal */}
      {!hasCheckedApiStatus ? (
        <SystemChecking />
      ) : !isApiSupported ? (
        <UnsupportedCard apiType={UNSUPPORTED_API_TYPES.webApiTextDetector} />
      ) : null}

      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <DetectionTabs />
      </div>

      <SectionGap size="sm" />

      <DarkroomInspector
        tab={tab}
        setTab={setTab}
        param={param}
        isEmpty={isEmpty}
        isProcessing={isProcessing}
        results={transformedResults}
        rawResults={results}
        resultRef={resultRef}
        canvasRef={canvasRef}
        processImage={processImage}
        processVideo={processVideo}
        processWebcam={processWebcam}
        flipWebcam={flipWebcam}
        onCanvasDraw={onCanvasDraw}
        onClear={onClear}
        onRatioChange={setRatio}
      />
    </>
  );
}
