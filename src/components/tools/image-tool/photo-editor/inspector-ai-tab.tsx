'use client';

import type {
  AiBackendKind,
  AiCacheEntryStatus,
  AiModelKey,
  ChromeAiActionId,
  ChromeAiPreview,
  DepthMapData,
} from './types/studio';
import type { NativeAiCapabilities } from './utils/native-ai';

import {
  CheckCircle2,
  Cpu,
  Eraser,
  Layers,
  ScanFace,
  ScanText,
  Scissors,
  Sparkles,
  Trash2,
  Wand2,
  Zap,
} from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

import { AI_MODEL_CATALOG } from './constants';
import { probeNativeAiCapabilities } from './utils/native-ai';

type Props = {
  isImageSelected: boolean;
  isTextSelected: boolean;
  activeLayerId: string | null;
  activeDepthMap: DepthMapData | null;
  cacheStatus: Partial<Record<AiModelKey, AiCacheEntryStatus>>;
  totalCachedBytes: number;
  activeLoadedModel: AiModelKey | null;
  activeBackend: AiBackendKind | null;
  preferredBackend: AiBackendKind;
  chromeAiPreview: ChromeAiPreview | null;
  onRefreshCache: () => void;
  onRemoveBackground: (quality: 'fast' | 'hd') => void;
  onGenerateDepthMap: () => void;
  onApplyDepthBokeh: (focusDepth01: number, blurRadiusPx: number) => void;
  onApplyTextBehindSubject: (cutoff01: number) => void;
  onUpscale2x: () => void;
  onSelectMagicTool: (tool: 'magic-select' | 'magic-eraser') => void;
  onFacePrivacyMosaic: () => void;
  onSmartFaceCrop: () => void;
  onExtractTextOcr: () => void;
  onRunChromeAiCopy: (action: ChromeAiActionId) => void;
  onApplyChromeAiPreview: (mode: 'replace' | 'new') => void;
  onDiscardChromeAiPreview: () => void;
  onUnloadGpu: () => void;
  onRequestClearCache: () => void;
};

function renderCacheBadge(
  entry: AiCacheEntryStatus | undefined,
  estMb: number
) {
  if (entry?.cached) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
        <CheckCircle2 className="h-2.5 w-2.5" />
        Cached
      </span>
    );
  }
  return (
    <span className="rounded-full bg-neutral-100 px-1.5 py-0.5 font-mono text-[10px] text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
      ~{estMb.toFixed(0)} MB
    </span>
  );
}

/**
 * Right Inspector AI Tab implementing Iron Law A (strictly inspect cache on tab switch;
 * zero automatic downloads/loads) and transparent GPU VRAM & Cache status management.
 */
export default function InspectorAiTab({
  isImageSelected,
  isTextSelected,
  activeDepthMap,
  cacheStatus,
  totalCachedBytes,
  activeLoadedModel,
  activeBackend,
  preferredBackend,
  chromeAiPreview,
  onRefreshCache,
  onRemoveBackground,
  onGenerateDepthMap,
  onApplyDepthBokeh,
  onApplyTextBehindSubject,
  onUpscale2x,
  onSelectMagicTool,
  onFacePrivacyMosaic,
  onSmartFaceCrop,
  onExtractTextOcr,
  onRunChromeAiCopy,
  onApplyChromeAiPreview,
  onDiscardChromeAiPreview,
  onUnloadGpu,
  onRequestClearCache,
}: Props) {
  const [cutoutTier, setCutoutTier] = useState<'fast' | 'hd'>('fast');
  const [focusDepth, setFocusDepth] = useState(0.75);
  const [bokehBlur, setBokehBlur] = useState(14);
  const [depthCutoff, setDepthCutoff] = useState(0.48);
  const [nativeCaps, setNativeCaps] = useState<NativeAiCapabilities>({
    faceDetector: false,
    textDetector: false,
    chromeAiCopy: false,
  });

  useEffect(() => {
    onRefreshCache();
    let cancelled = false;
    void probeNativeAiCapabilities().then((caps) => {
      if (!cancelled) setNativeCaps(caps);
    });
    return () => {
      cancelled = true;
    };
  }, [onRefreshCache]);

  const cutoutKey: AiModelKey = cutoutTier === 'hd' ? 'rmbg-hd' : 'rmbg-fast';
  const totalMbLabel = (totalCachedBytes / (1024 * 1024)).toFixed(1);

  return (
    <div className="space-y-4">
      {/* Hardware Runtime Pill */}
      <div className="flex items-center justify-between rounded-xl border border-neutral-200/80 bg-neutral-50/80 px-3 py-2 text-[11px] dark:border-neutral-800/80 dark:bg-neutral-900/60">
        <span className="font-semibold text-neutral-600 dark:text-neutral-300">
          On-Device AI Engine
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-sky-500/15 px-2 py-0.5 font-mono text-[10px] font-bold text-sky-600 dark:text-sky-400">
          <Cpu className="h-3 w-3" />
          {preferredBackend === 'webgpu' ? 'WebGPU' : 'WASM'}
        </span>
      </div>

      {/* 1. AI Cutout (RMBG-1.4 Fast / ORMBG Studio HD) */}
      <div className="space-y-2.5 rounded-xl border border-neutral-200/80 p-3 dark:border-neutral-800/80">
        <div className="flex items-center justify-between">
          <Label className="text-[11px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300">
            Background Cutout
          </Label>
          {renderCacheBadge(
            cacheStatus[cutoutKey],
            AI_MODEL_CATALOG[cutoutKey].estimatedMb
          )}
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          <Button
            size="xs"
            variant={cutoutTier === 'fast' ? 'primary' : 'secondary'}
            bordered={cutoutTier !== 'fast'}
            onClick={() => setCutoutTier('fast')}
          >
            Fast (42 MB)
          </Button>
          <Button
            size="xs"
            variant={cutoutTier === 'hd' ? 'primary' : 'secondary'}
            bordered={cutoutTier !== 'hd'}
            onClick={() => setCutoutTier('hd')}
          >
            Studio HD (84 MB)
          </Button>
        </div>
        <Button
          size="xs"
          variant="primary"
          icon={Scissors}
          disabled={!isImageSelected}
          onClick={() => onRemoveBackground(cutoutTier)}
          className="w-full"
        >
          Remove Background (Mask)
        </Button>
      </div>

      {/* 2. Interactive Rail Shortcuts (Magic Select & Magic Eraser) */}
      <div className="grid grid-cols-2 gap-2">
        <Button
          size="xs"
          variant="secondary"
          bordered
          icon={Wand2}
          onClick={() => onSelectMagicTool('magic-select')}
          className="justify-center text-[11px]"
        >
          Magic Select (M)
        </Button>
        <Button
          size="xs"
          variant="secondary"
          bordered
          icon={Eraser}
          onClick={() => onSelectMagicTool('magic-eraser')}
          className="justify-center text-[11px]"
        >
          Magic Eraser (J)
        </Button>
      </div>

      {/* 3. 3D Depth Studio (Depth Anything V2) */}
      <div className="space-y-2.5 rounded-xl border border-neutral-200/80 p-3 dark:border-neutral-800/80">
        <div className="flex items-center justify-between">
          <Label className="text-[11px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300">
            3D Depth Studio
          </Label>
          {renderCacheBadge(
            cacheStatus['depth-v2'],
            AI_MODEL_CATALOG['depth-v2'].estimatedMb
          )}
        </div>

        <Button
          size="xs"
          variant="secondary"
          bordered
          icon={Layers}
          disabled={!isImageSelected}
          onClick={onGenerateDepthMap}
          className="w-full"
        >
          {activeDepthMap ? 'Recompute 3D Depth Map' : 'Estimate 3D Depth Map'}
        </Button>

        {activeDepthMap && (
          <div className="space-y-2.5 border-t border-neutral-200/70 pt-2.5 dark:border-neutral-800/70">
            <Slider
              title="Focal Plane (Near ↔ Far)"
              min={0}
              max={1}
              step={0.02}
              showValueBadge
              value={focusDepth}
              onChange={(e) => setFocusDepth(parseFloat(e.target.value))}
            />
            <Slider
              title="Bokeh Blur Radius"
              min={2}
              max={32}
              step={1}
              unit="px"
              showValueBadge
              value={bokehBlur}
              onChange={(e) => setBokehBlur(Number(e.target.value))}
            />
            <Button
              size="xs"
              variant="primary"
              onClick={() => onApplyDepthBokeh(focusDepth, bokehBlur)}
              className="w-full"
            >
              Render Portrait Bokeh
            </Button>

            <div className="border-t border-neutral-200/60 pt-2 dark:border-neutral-800/60">
              <Slider
                title="Foreground Cutoff"
                min={0.15}
                max={0.85}
                step={0.02}
                showValueBadge
                value={depthCutoff}
                onChange={(e) => setDepthCutoff(parseFloat(e.target.value))}
              />
              <Button
                size="xs"
                variant="secondary"
                bordered
                onClick={() => onApplyTextBehindSubject(depthCutoff)}
                className="mt-2 w-full"
              >
                Create Text Behind Subject
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* 4. Super-Resolution Upscale */}
      <div className="space-y-2 rounded-xl border border-neutral-200/80 p-3 dark:border-neutral-800/80">
        <div className="flex items-center justify-between">
          <Label className="text-[11px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300">
            2x Super-Resolution
          </Label>
          {renderCacheBadge(
            cacheStatus['upscale-2x'],
            AI_MODEL_CATALOG['upscale-2x'].estimatedMb
          )}
        </div>
        <Button
          size="xs"
          variant="secondary"
          bordered
          icon={Zap}
          disabled={!isImageSelected}
          onClick={onUpscale2x}
          className="w-full"
        >
          Upscale Image Layer 2x
        </Button>
      </div>

      {/* 5. Zero-Download Browser Native AI */}
      <div className="space-y-2.5 rounded-xl border border-neutral-200/80 p-3 dark:border-neutral-800/80">
        <div className="flex items-center justify-between">
          <Label className="text-[11px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300">
            Zero-Download Browser AI
          </Label>
          <span className="rounded-full bg-sky-500/10 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-sky-600 dark:text-sky-400">
            0 MB
          </span>
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          <Button
            size="xs"
            variant="secondary"
            bordered
            icon={ScanFace}
            disabled={!isImageSelected || !nativeCaps.faceDetector}
            onClick={onFacePrivacyMosaic}
            title={
              nativeCaps.faceDetector
                ? 'Auto pixelate detected faces'
                : 'FaceDetector API requires Chrome/Edge on desktop'
            }
            className="text-[11px]"
          >
            Face Mosaic
          </Button>
          <Button
            size="xs"
            variant="secondary"
            bordered
            icon={ScanFace}
            disabled={!isImageSelected || !nativeCaps.faceDetector}
            onClick={onSmartFaceCrop}
            title={
              nativeCaps.faceDetector
                ? 'Center canvas around detected faces'
                : 'FaceDetector API unavailable'
            }
            className="text-[11px]"
          >
            Face Crop
          </Button>
        </div>

        <Button
          size="xs"
          variant="secondary"
          bordered
          icon={ScanText}
          disabled={!isImageSelected || !nativeCaps.textDetector}
          onClick={onExtractTextOcr}
          title={
            nativeCaps.textDetector
              ? 'Detect text regions and create editable Text layers'
              : 'TextDetector API unavailable in this browser'
          }
          className="w-full"
        >
          OCR Text to Editable Layers
        </Button>

        {nativeCaps.chromeAiCopy && (
          <div className="space-y-2 border-t border-neutral-200/70 pt-2.5 dark:border-neutral-800/70">
            <div className="flex items-center justify-between text-[11px] font-semibold text-neutral-600 dark:text-neutral-300">
              <span>Chrome Built-in AI Copy</span>
              <Sparkles className="h-3 w-3 text-sky-500" />
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <Button
                size="xs"
                variant="secondary"
                bordered
                onClick={() => onRunChromeAiCopy('headline')}
                className="text-[10px]"
              >
                Poster Headline
              </Button>
              <Button
                size="xs"
                variant="secondary"
                bordered
                disabled={!isTextSelected}
                onClick={() => onRunChromeAiCopy('shorter')}
                className="text-[10px]"
              >
                Make Shorter
              </Button>
              <Button
                size="xs"
                variant="secondary"
                bordered
                disabled={!isTextSelected}
                onClick={() => onRunChromeAiCopy('translate')}
                className="text-[10px]"
              >
                EN ↔ 繁中
              </Button>
              <Button
                size="xs"
                variant="secondary"
                bordered
                disabled={!isTextSelected}
                onClick={() => onRunChromeAiCopy('grammar')}
                className="text-[10px]"
              >
                Fix Grammar
              </Button>
            </div>

            {chromeAiPreview && (
              <div className="space-y-2 rounded-lg border border-sky-300/70 bg-sky-50/70 p-2 text-xs dark:border-sky-800/70 dark:bg-sky-950/30">
                <div className="text-[10px] font-bold uppercase text-sky-600 dark:text-sky-400">
                  {chromeAiPreview.actionLabel}
                </div>
                <p className="text-[11px] leading-snug text-neutral-800 dark:text-neutral-200">
                  {chromeAiPreview.text}
                </p>
                <div className="flex gap-1.5">
                  {isTextSelected && (
                    <Button
                      size="xs"
                      variant="primary"
                      onClick={() => onApplyChromeAiPreview('replace')}
                      className="flex-1 text-[10px]"
                    >
                      Replace
                    </Button>
                  )}
                  <Button
                    size="xs"
                    variant="secondary"
                    bordered
                    onClick={() => onApplyChromeAiPreview('new')}
                    className="flex-1 text-[10px]"
                  >
                    New Layer
                  </Button>
                  <Button
                    size="xs"
                    variant="ghost"
                    onClick={onDiscardChromeAiPreview}
                    className="text-[10px]"
                  >
                    Discard
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 6. Transparent GPU VRAM & Local Cache Console (Iron Law C) */}
      <div className="space-y-2 rounded-xl border border-neutral-200/80 bg-neutral-50/70 p-3 dark:border-neutral-800/80 dark:bg-neutral-900/50">
        <Label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
          GPU &amp; Cache Status
        </Label>
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-neutral-500 dark:text-neutral-400">
            Active Slot (Max 1):
          </span>
          <span className="font-mono font-semibold text-neutral-700 dark:text-neutral-200">
            {activeLoadedModel
              ? `${AI_MODEL_CATALOG[activeLoadedModel].shortLabel} (${activeBackend?.toUpperCase()})`
              : 'Idle (0 VRAM)'}
          </span>
        </div>
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-neutral-500 dark:text-neutral-400">
            Browser Disk Cache:
          </span>
          <span className="font-mono font-semibold text-neutral-700 dark:text-neutral-200">
            {totalMbLabel} MB
          </span>
        </div>
        <div className="grid grid-cols-2 gap-1.5 pt-1">
          <Button
            size="xs"
            variant="secondary"
            bordered
            disabled={!activeLoadedModel}
            onClick={onUnloadGpu}
            className="text-[10px]"
          >
            Unload GPU
          </Button>
          <Button
            size="xs"
            variant="outline"
            icon={Trash2}
            disabled={totalCachedBytes === 0}
            onClick={onRequestClearCache}
            className="text-[10px] hover:text-red-500 dark:hover:text-red-400"
          >
            Clear Cache
          </Button>
        </div>
      </div>
    </div>
  );
}
