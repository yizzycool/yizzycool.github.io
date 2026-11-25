'use client';

import { useCallback, useMemo, useState } from 'react';
import { get, isNull, map } from 'lodash';

import HeaderBlock from '@/components/tools/common/header-block';
import SectionGap from '@/components/tools/common/section-gap';
import toast from '@/utils/toast';

import CompatibilityBanner from '../compatibility-banner';
import DarkroomInspector from '../darkroom-inspector';
import { DETECTION_SHORTCUTS } from '../data/detection-shortcuts';
import { UNSUPPORTED_API_TYPES } from '../data/unsupported-types';
import useBarcodeDetector from '../hooks/use-barcode-detector';
import useCommonFunction from '../hooks/use-common-function';
import SystemChecking from '../system-checking';
import { createBarcodeSamples } from '../utils/sample-presets';

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
  const {
    hasCheckedApiStatus,
    isApiSupported,
    usingJsFallback,
    isProcessing,
    detect,
  } = useBarcodeDetector();

  const {
    param,
    results,
    tab,
    setTab,
    resultRef,
    canvasRef,
    isEmpty,
    isDemoResult,
    processImage,
    loadSamplePreset,
    processVideo,
    processWebcam,
    flipWebcam,
    onCanvasDraw,
    onClear,
  } = useCommonFunction({ detect });

  const [ratio, setRatio] = useState(1);
  const [isSampleLoading, setIsSampleLoading] = useState(false);

  const samples = useMemo(() => createBarcodeSamples(), []);
  const sampleOptions = useMemo(
    () => samples.map(({ id, label }) => ({ id, label })),
    [samples]
  );

  const handleSelectSample = useCallback(
    async (sampleId: string) => {
      const target = samples.find((item) => item.id === sampleId);
      if (!target) return;

      setIsSampleLoading(true);
      try {
        const file = await target.buildFile();
        await loadSamplePreset(file, target.demoResults);
      } catch {
        toast.error('Failed to prepare sample image');
      } finally {
        setIsSampleLoading(false);
      }
    },
    [samples, loadSamplePreset]
  );

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

      {!hasCheckedApiStatus ? (
        <SystemChecking />
      ) : !isApiSupported ? (
        <CompatibilityBanner
          apiType={UNSUPPORTED_API_TYPES.webApiBarcodeDetector}
          usingJsFallback={usingJsFallback}
          onTrySample={
            samples[0]
              ? () => void handleSelectSample(samples[0].id)
              : undefined
          }
        />
      ) : null}

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
        samples={sampleOptions}
        onSelectSample={(id) => void handleSelectSample(id)}
        isSampleLoading={isSampleLoading}
        isDemoResult={isDemoResult}
        enableBarcodeActions
      />
    </>
  );
}
