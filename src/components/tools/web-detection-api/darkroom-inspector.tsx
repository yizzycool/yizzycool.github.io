'use client';

import type { ReactNode, RefObject } from 'react';
import type { Param, WebDetectionFileType } from './result-canvas';
import type { TransformedResults } from './types';
import type { SamplePresetOption } from './utils/sample-presets';

import {
  Braces,
  Grid2x2,
  Image as ImageIcon,
  ListChecks,
  Moon,
  Square,
  Trash2,
  Video,
  Webcam,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs } from '@/components/ui/tabs';
import { cn } from '@/utils/cn';

import BoundingBox from './bounding-box';
import DetectionResult from './detection-result';
import Empty from './empty';
import FlipCamera from './flip-camera';
import RawData from './raw-data';
import ResultCanvas from './result-canvas';
import SamplePresetBar from './sample-preset-bar';

type InspectorTab = 'extracted' | 'raw';
type StageSurface = 'darkroom' | 'checkerboard';

const TAB_LIST: Array<WebDetectionFileType> = ['image', 'video', 'webcam'];

const TAB_LABELS: Record<WebDetectionFileType, string> = {
  '': '',
  image: 'Image',
  video: 'Video',
  webcam: 'Webcam',
};

const TAB_ICONS: Record<WebDetectionFileType, typeof ImageIcon> = {
  '': ImageIcon,
  image: ImageIcon,
  video: Video,
  webcam: Webcam,
};

const INSPECTOR_TABS: InspectorTab[] = ['extracted', 'raw'];

const INSPECTOR_LABELS: Record<InspectorTab, string> = {
  extracted: 'Extracted Data',
  raw: 'Raw JSON',
};

const INSPECTOR_ICONS: Record<InspectorTab, typeof ListChecks> = {
  extracted: ListChecks,
  raw: Braces,
};

type Props = {
  tab: WebDetectionFileType;
  setTab: (tab: WebDetectionFileType) => void;
  param: Param;
  isEmpty: boolean;
  isProcessing: boolean;
  results: TransformedResults;
  rawResults:
    | FaceDetectionResults
    | BarcodeDetectionResults
    | TextDetectionResults
    | null;
  resultRef: RefObject<HTMLDivElement | null>;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  processImage: (file: File | undefined) => void;
  processVideo: (file: File | undefined) => void;
  processWebcam: () => void;
  flipWebcam: () => void;
  onCanvasDraw: (canvas: HTMLCanvasElement) => Promise<void>;
  onClear: () => void;
  onRatioChange: (ratio: number) => void;
  samples?: SamplePresetOption[];
  onSelectSample?: (sampleId: string) => void;
  isSampleLoading?: boolean;
  isDemoResult?: boolean;
  enableBarcodeActions?: boolean;
  inspectorActions?: ReactNode;
};

export default function DarkroomInspector({
  tab,
  setTab,
  param,
  isEmpty,
  isProcessing,
  results,
  rawResults,
  resultRef,
  canvasRef,
  processImage,
  processVideo,
  processWebcam,
  flipWebcam,
  onCanvasDraw,
  onClear,
  onRatioChange,
  samples,
  onSelectSample,
  isSampleLoading = false,
  isDemoResult = false,
  enableBarcodeActions = false,
  inspectorActions,
}: Props) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [inspectorTab, setInspectorTab] = useState<InspectorTab>('extracted');
  const [stageSurface, setStageSurface] = useState<StageSurface>('darkroom');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (isEmpty || !canvas || typeof ResizeObserver === 'undefined') return;

    const observer = new ResizeObserver(() => {
      if (canvas.width > 0 && canvas.clientWidth > 0) {
        onRatioChange(canvas.clientWidth / canvas.width);
      }
    });

    observer.observe(canvas);
    return () => observer.disconnect();
  }, [canvasRef, isEmpty, onRatioChange]);

  const handleCanvasDraw = useCallback(
    async (canvas: HTMLCanvasElement) => {
      await onCanvasDraw(canvas);
      if (canvas.width > 0 && canvas.clientWidth > 0) {
        onRatioChange(canvas.clientWidth / canvas.width);
      }
    },
    [onCanvasDraw, onRatioChange]
  );

  const renderInspectorBadge = (currentTab: InspectorTab): ReactNode => {
    if (currentTab !== 'extracted' || results.length === 0) return null;
    return (
      <span className="rounded-full bg-black/[0.06] px-1.5 py-px text-[10px] font-semibold tabular-nums leading-tight dark:bg-white/[0.09]">
        {results.length}
      </span>
    );
  };

  return (
    <div className="w-full text-left">
      {/* Top Mode & Stage Controls */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <Tabs
          tabs={TAB_LIST}
          tabLabels={TAB_LABELS}
          tabIcons={TAB_ICONS}
          activeTab={tab}
          variant="segment"
          size="sm"
          rounded="lg"
          onChange={(nextTab) => setTab(nextTab as WebDetectionFileType)}
        />

        {!!param.type && (
          <div className="flex flex-wrap items-center gap-2">
            {isDemoResult && (
              <Badge variant="amber" size="xs">
                Sample Demo
              </Badge>
            )}

            <Badge
              variant={results.length > 0 ? 'primary' : 'neutral'}
              size="xs"
            >
              {results.length} {results.length === 1 ? 'Match' : 'Matches'}
            </Badge>

            <Button
              variant="outline"
              size="xs"
              rounded="lg"
              icon={stageSurface === 'darkroom' ? Grid2x2 : Moon}
              onClick={() =>
                setStageSurface((prev) =>
                  prev === 'darkroom' ? 'checkerboard' : 'darkroom'
                )
              }
              title="Toggle stage backdrop between Darkroom and Checkerboard"
            >
              {stageSurface === 'darkroom' ? 'Checkerboard' : 'Darkroom'}
            </Button>

            <Button
              variant="error"
              size="xs"
              icon={param.type === 'webcam' ? Square : Trash2}
              iconStrokeWidth={param.type === 'webcam' ? 4 : 2}
              onClick={onClear}
            >
              {param.type === 'webcam' ? 'Stop' : 'Clear'}
            </Button>
          </div>
        )}
      </div>

      {isEmpty ? (
        <>
          <Empty
            tab={tab}
            processImage={processImage}
            processVideo={processVideo}
            processWebcam={processWebcam}
          />
          {tab === 'image' &&
            samples &&
            samples.length > 0 &&
            onSelectSample && (
              <SamplePresetBar
                samples={samples}
                onSelectSample={onSelectSample}
                isLoading={isSampleLoading}
              />
            )}
        </>
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 lg:items-start">
          {/* Left 7 Cols: Darkroom Media Stage */}
          <div
            className={cn(
              'flex min-h-[340px] items-center justify-center overflow-hidden rounded-2xl border p-4 shadow-inner sm:p-6 lg:col-span-7',
              'border-neutral-800/90 bg-neutral-950'
            )}
            style={
              stageSurface === 'checkerboard'
                ? {
                    backgroundImage:
                      'linear-gradient(45deg, #1f2937 25%, transparent 25%), linear-gradient(-45deg, #1f2937 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #1f2937 75%), linear-gradient(-45deg, transparent 75%, #1f2937 75%)',
                    backgroundSize: '20px 20px',
                    backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
                  }
                : undefined
            }
          >
            <div ref={resultRef} className="relative mx-auto h-fit w-fit">
              <ResultCanvas
                canvasRef={canvasRef}
                param={param}
                onCanvasDraw={handleCanvasDraw}
              />
              <BoundingBox
                results={results}
                activeIndex={activeIndex}
                onHoverIndex={setActiveIndex}
              />
              {param.type === 'webcam' && <FlipCamera onClick={flipWebcam} />}
            </div>
          </div>

          {/* Right 5 Cols: Sticky Inspector Sidebar */}
          <aside className="space-y-3 rounded-2xl border border-neutral-200/80 bg-white/80 p-4 shadow-sm backdrop-blur-md lg:sticky lg:top-24 lg:col-span-5 dark:border-neutral-800 dark:bg-neutral-900/65">
            <Tabs<InspectorTab>
              tabs={INSPECTOR_TABS}
              activeTab={inspectorTab}
              tabLabels={INSPECTOR_LABELS}
              tabIcons={INSPECTOR_ICONS}
              tabBadges={renderInspectorBadge}
              onChange={setInspectorTab}
              size="xs"
              rounded="lg"
              variant="segment"
              fullWidth
            />

            {inspectorTab === 'extracted' ? (
              <DetectionResult
                results={results}
                isProcessing={isProcessing}
                activeIndex={activeIndex}
                onHoverIndex={setActiveIndex}
                enableBarcodeActions={enableBarcodeActions}
                compact
              />
            ) : (
              <RawData results={rawResults} compact />
            )}

            {results.length > 0 && inspectorActions && (
              <div className="border-t border-neutral-200/70 pt-3 dark:border-neutral-800/80">
                {inspectorActions}
              </div>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}
