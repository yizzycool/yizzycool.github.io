'use client';

import type { FaceRedactionMode } from '../utils/face-privacy';

import { Download, EyeOff, Grid, WandSparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import { isNull, map } from 'lodash';

import HeaderBlock from '@/components/tools/common/header-block';
import SectionGap from '@/components/tools/common/section-gap';
import { writeStudioHandoff } from '@/components/tools/image-tool/studio-handoff';
import { Button } from '@/components/ui/button';
import { ConfirmDialog, useConfirmDialog } from '@/components/ui/dialog';
import { Tabs } from '@/components/ui/tabs';
import { useToolsDB } from '@/hooks/tools/use-tools-db';
import toast from '@/utils/toast';

import CompatibilityBanner from '../compatibility-banner';
import DarkroomInspector from '../darkroom-inspector';
import { DETECTION_SHORTCUTS } from '../data/detection-shortcuts';
import { UNSUPPORTED_API_TYPES } from '../data/unsupported-types';
import useCommonFunction from '../hooks/use-common-function';
import useFaceDetector from '../hooks/use-face-detector';
import SystemChecking from '../system-checking';
import { canvasToBlob, renderRedactedFaceCanvas } from '../utils/face-privacy';
import { createFaceSamples } from '../utils/sample-presets';

const REDACTION_MODES: FaceRedactionMode[] = ['blur', 'pixelate'];

const REDACTION_LABELS: Record<FaceRedactionMode, string> = {
  blur: 'Gaussian Blur',
  pixelate: 'Pixel Mosaic',
};

const REDACTION_ICONS: Record<FaceRedactionMode, typeof EyeOff> = {
  blur: EyeOff,
  pixelate: Grid,
};

export default function FaceDetectorApi() {
  const router = useRouter();
  const { isSupported: isDbSupported, setValue } = useToolsDB();
  const { confirm, dialogProps } = useConfirmDialog();

  const { hasCheckedApiStatus, isApiSupported, isProcessing, detect } =
    useFaceDetector();

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
  const [redactionMode, setRedactionMode] = useState<FaceRedactionMode>('blur');
  const [isExporting, setIsExporting] = useState(false);

  const samples = useMemo(() => createFaceSamples(), []);
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
        toast.error('Failed to prepare sample portrait');
      } finally {
        setIsSampleLoading(false);
      }
    },
    [samples, loadSamplePreset]
  );

  const transformedResults = useMemo(() => {
    if (isNull(results)) return [];
    return map(results as FaceDetectionResults, (result, idx) => {
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
        landmarks: map(landmarks, (landmark) => ({
          ...landmark,
          locations: map(landmark.locations, ({ x, y }) => ({
            x: x * ratio,
            y: y * ratio,
          })),
        })),
      };
    });
  }, [results, ratio]);

  const buildRedactedBlob = async (): Promise<{
    blob: Blob;
    width: number;
    height: number;
  } | null> => {
    const canvas = canvasRef.current;
    const faceResults = results as FaceDetectionResults | null;
    if (!canvas || !faceResults || faceResults.length === 0) return null;

    const redacted = renderRedactedFaceCanvas(
      canvas,
      faceResults,
      redactionMode
    );
    const blob = await canvasToBlob(redacted, 'image/png');
    return { blob, width: redacted.width, height: redacted.height };
  };

  const handleDownloadRedacted = async () => {
    setIsExporting(true);
    try {
      const output = await buildRedactedBlob();
      if (!output) return;
      const url = URL.createObjectURL(output.blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `face-privacy-${redactionMode}.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      toast.success('Downloaded privacy-redacted PNG');
    } catch {
      toast.error('Failed to export redacted image');
    } finally {
      setIsExporting(false);
    }
  };

  const handleOpenInPhotoEditor = () => {
    confirm({
      title: 'Open in Photo Editor Studio?',
      message:
        'A privacy-redacted copy using your selected filter will be sent to Photo Editor Studio for further editing.',
      confirmText: 'Open Studio',
      cancelText: 'Stay Here',
      confirmVariant: 'primary',
      onConfirm: async () => {
        if (!isDbSupported) {
          toast.error('IndexedDB is unavailable in this browser session');
          return;
        }
        const output = await buildRedactedBlob();
        if (!output) return;

        await writeStudioHandoff(setValue, 'photo-editor', {
          version: 1,
          createdAt: Date.now(),
          source: 'photo-editor',
          mode: 'append',
          width: output.width,
          height: output.height,
          items: [
            {
              name: `face-redacted-${redactionMode}.png`,
              blob: output.blob,
            },
          ],
        });
        router.push('/tools/image-tool/photo-editor?handoff=1');
      },
    });
  };

  const inspectorActions =
    results && results.length > 0 ? (
      <div className="space-y-2.5">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Auto Privacy Shield
        </div>

        <Tabs<FaceRedactionMode>
          tabs={REDACTION_MODES}
          activeTab={redactionMode}
          tabLabels={REDACTION_LABELS}
          tabIcons={REDACTION_ICONS}
          onChange={setRedactionMode}
          size="xs"
          rounded="lg"
          variant="segment"
          fullWidth
        />

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <Button
            variant="primary"
            size="xs"
            rounded="lg"
            icon={Download}
            disabled={isExporting}
            onClick={() => void handleDownloadRedacted()}
          >
            Download Redacted PNG
          </Button>
          <Button
            variant="outline"
            size="xs"
            rounded="lg"
            icon={WandSparkles}
            onClick={handleOpenInPhotoEditor}
          >
            Edit in Photo Studio
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
      ) : !isApiSupported ? (
        <CompatibilityBanner
          apiType={UNSUPPORTED_API_TYPES.webApiFaceDetector}
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
        inspectorActions={inspectorActions}
      />

      <ConfirmDialog {...dialogProps} />
    </>
  );
}
