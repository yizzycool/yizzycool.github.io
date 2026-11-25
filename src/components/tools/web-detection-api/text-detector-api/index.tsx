'use client';

import type { OcrLanguage } from '../hooks/use-text-detector';

import { Languages, LoaderCircle, StickyNote, Type } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import { isNull, map } from 'lodash';

import HeaderBlock from '@/components/tools/common/header-block';
import SectionGap from '@/components/tools/common/section-gap';
import { writeTextHandoff } from '@/components/tools/common/text-handoff';
import { Button } from '@/components/ui/button';
import { PillTabs } from '@/components/ui/tabs';
import { useToolsDB } from '@/hooks/tools/use-tools-db';
import toast from '@/utils/toast';

import CompatibilityBanner from '../compatibility-banner';
import DarkroomInspector from '../darkroom-inspector';
import { DETECTION_SHORTCUTS } from '../data/detection-shortcuts';
import { UNSUPPORTED_API_TYPES } from '../data/unsupported-types';
import DetectionTabs from '../detection-tabs';
import useCommonFunction from '../hooks/use-common-function';
import useTextDetector from '../hooks/use-text-detector';
import SystemChecking from '../system-checking';
import { createTextSamples } from '../utils/sample-presets';

const OCR_LANGUAGES: OcrLanguage[] = ['eng', 'chi_tra', 'eng+chi_tra'];

const OCR_LANGUAGE_LABELS: Record<OcrLanguage, string> = {
  eng: 'English',
  chi_tra: 'Trad. Chinese',
  'eng+chi_tra': 'EN + Chinese',
};

export default function TextDetectorApi() {
  const router = useRouter();
  const { isSupported: isDbSupported, setValue } = useToolsDB();

  const {
    hasCheckedApiStatus,
    isApiSupported,
    usingOcrFallback,
    isProcessing,
    ocrLang,
    setOcrLang,
    ocrProgress,
    ocrStatus,
    detect,
  } = useTextDetector();

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
    rerunDetection,
    onClear,
  } = useCommonFunction({ detect });

  const [ratio, setRatio] = useState(1);
  const [isSampleLoading, setIsSampleLoading] = useState(false);

  const samples = useMemo(() => createTextSamples(), []);
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

  const handleOcrLangChange = (nextLang: OcrLanguage) => {
    setOcrLang(nextLang);
    if (!isEmpty && param.type === 'image') {
      void rerunDetection();
    }
  };

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

  const extractedText = useMemo(() => {
    if (isNull(results)) return '';
    return (results as TextDetectionResults)
      .map((item) => item.rawValue.trim())
      .filter(Boolean)
      .join('\n');
  }, [results]);

  const handleSendToNotes = async () => {
    if (!extractedText) return;
    if (!isDbSupported) {
      toast.error('IndexedDB is unavailable in this browser session');
      return;
    }

    await writeTextHandoff(setValue, 'markdown-notes', {
      version: 1,
      createdAt: Date.now(),
      title: 'OCR Extracted Text',
      text: extractedText,
      labels: ['OCR'],
    });
    router.push('/tools/everyday-life-tool/markdown-notes?handoff=1');
  };

  const handleSendToWordCounter = async () => {
    if (!extractedText) return;
    if (!isDbSupported) {
      toast.error('IndexedDB is unavailable in this browser session');
      return;
    }

    await writeTextHandoff(setValue, 'word-counter', {
      version: 1,
      createdAt: Date.now(),
      text: extractedText,
    });
    router.push('/tools/everyday-life-tool/word-counter?handoff=1');
  };

  const inspectorActions = extractedText ? (
    <div className="space-y-2">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
        Next Workflow
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="outline"
          size="xs"
          rounded="lg"
          icon={StickyNote}
          onClick={() => void handleSendToNotes()}
        >
          Send to Notes
        </Button>
        <Button
          variant="outline"
          size="xs"
          rounded="lg"
          icon={Type}
          onClick={() => void handleSendToWordCounter()}
        >
          Word Counter
        </Button>
      </div>
    </div>
  ) : null;

  return (
    <>
      <HeaderBlock customShortcuts={DETECTION_SHORTCUTS} />

      <SectionGap />

      {!hasCheckedApiStatus ? (
        <SystemChecking />
      ) : !isApiSupported || usingOcrFallback ? (
        <CompatibilityBanner
          apiType={UNSUPPORTED_API_TYPES.webApiTextDetector}
          usingOcrFallback={usingOcrFallback}
          onTrySample={
            samples[0]
              ? () => void handleSelectSample(samples[0].id)
              : undefined
          }
        />
      ) : null}

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <DetectionTabs />

        {(!isApiSupported || usingOcrFallback) && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-slate-400">
              <Languages size={13} className="text-sky-500" />
              <span>OCR Language:</span>
            </span>
            <PillTabs<OcrLanguage>
              tabs={OCR_LANGUAGES}
              activeTab={ocrLang}
              tabLabels={OCR_LANGUAGE_LABELS}
              onChange={handleOcrLangChange}
              size="xs"
              rounded="lg"
              variant="segment"
            />
          </div>
        )}
      </div>

      {isProcessing && ocrStatus && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-sky-200/80 bg-sky-50/75 px-3.5 py-2 text-xs text-sky-800 dark:border-sky-900/60 dark:bg-sky-950/35 dark:text-sky-200">
          <LoaderCircle size={14} className="shrink-0 animate-spin" />
          <span className="capitalize">{ocrStatus}</span>
          {ocrProgress !== null && (
            <span className="font-mono font-semibold tabular-nums">
              {Math.round(ocrProgress * 100)}%
            </span>
          )}
        </div>
      )}

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
        samples={sampleOptions}
        onSelectSample={(id) => void handleSelectSample(id)}
        isSampleLoading={isSampleLoading}
        isDemoResult={isDemoResult}
        inspectorActions={inspectorActions}
      />
    </>
  );
}
