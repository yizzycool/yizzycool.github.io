'use client';

import { useMemo, useState } from 'react';
import { get, isNull, map } from 'lodash';

import HeaderBlock from '../../common/header-block';
import SectionGap from '../../common/section-gap';
import DarkroomInspector from '../darkroom-inspector';
import { DETECTION_SHORTCUTS } from '../data/detection-shortcuts';
import { UNSUPPORTED_API_TYPES } from '../data/unsupported-types';
import DetectionTabs from '../detection-tabs';
import useBarcodeDetector from '../hooks/use-barcode-detector';
import useCommonFunction from '../hooks/use-common-function';
import SystemChecking from '../system-checking';
import UnsupportedCard from '../unsupported-card';

const ReadableMap = {
  aztec: 'Aztec Code',
  code_128: 'Code 128',
  code_39: 'Code 39',
  code_93: 'Code 93',
  codabar: 'Codabar',
  data_matrix: 'Data Matrix',
  ean_13: 'EAN-13',
  ean_8: 'EAN-8',
  itf: 'ITF (Interleaved 2 of 5)',
  pdf417: 'PDF417',
  qr_code: 'QR Code',
  upc_a: 'UPC-A',
  upc_e: 'UPC-E',
};

export default function BarcodeDetectorApi() {
  const { hasCheckedApiStatus, isApiSupported, isProcessing, detect } =
    useBarcodeDetector();

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
    return map(results as BarcodeDetectionResults, (result) => {
      const { boundingBox, cornerPoints, format, rawValue } = result;
      return {
        ...result,
        label: get(ReadableMap, format, format),
        text: rawValue,
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
        <UnsupportedCard
          apiType={UNSUPPORTED_API_TYPES.webApiBarcodeDetector}
        />
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
