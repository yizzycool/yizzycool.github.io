'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { FileCode, ImageIcon, SlidersHorizontal } from 'lucide-react';
import { isNull } from 'lodash';

import { CopyAction, DeleteAction } from '@/components/shared/action-button';
import { FilePicker } from '@/components/ui/file-picker';
import { Selector } from '@/components/ui/selector';
import { Slider } from '@/components/ui/slider';
import { Tabs } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import useToolHotkeys, { TOOL_HOTKEYS } from '@/hooks/tools/use-tool-hotkeys';
import imageUtils from '@/utils/image-utils';
import toast from '@/utils/toast';

import HeaderBlock from '../../common/header-block';
import LabelBar from '../../common/label-bar';
import SectionGap from '../../common/section-gap';
import ImagePreviewStage from '../image-preview-stage';

type OutputFormat = 'raw' | 'html' | 'css';
type OptimizeFormat = 'original' | 'image/webp' | 'image/jpeg' | 'image/png';

const OUTPUT_FORMAT_TABS: OutputFormat[] = ['raw', 'html', 'css'];

const OUTPUT_FORMAT_LABELS: Record<OutputFormat, string> = {
  raw: 'Raw String',
  html: 'HTML <img>',
  css: 'CSS url()',
};

const OPTIMIZE_FORMAT_OPTIONS = [
  { label: 'Original File', value: 'original' },
  { label: 'WebP (Smallest)', value: 'image/webp' },
  { label: 'JPEG', value: 'image/jpeg' },
  { label: 'PNG', value: 'image/png' },
];

const MAX_WIDTH_OPTIONS = [
  { label: 'Original Size', value: '0' },
  { label: 'Max 1920px', value: '1920' },
  { label: 'Max 1280px', value: '1280' },
  { label: 'Max 800px', value: '800' },
  { label: 'Max 512px', value: '512' },
];

type ImageInfo = {
  image: HTMLImageElement | null;
  width: number;
  height: number;
  error: boolean;
  blob: Blob | null;
  originalBytes: number;
  fileName: string;
  mimeType: string;
};

const defaultImageInfo: ImageInfo = {
  image: null,
  width: 0,
  height: 0,
  error: false,
  blob: null,
  originalBytes: 0,
  fileName: '',
  mimeType: '',
};

export default function ImageToBase64() {
  const [base64, setBase64] = useState<string>('');
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('raw');
  const [optimizeFormat, setOptimizeFormat] =
    useState<OptimizeFormat>('original');
  const [maxWidth, setMaxWidth] = useState<number>(0);
  const [quality, setQuality] = useState<number>(0.85);
  const [imageInfo, setImageInfo] = useState<ImageInfo>(defaultImageInfo);

  const sourceFileRef = useRef<File | null>(null);
  const sourceImageRef = useRef<HTMLImageElement | null>(null);

  const encodeWithSettings = useCallback(
    async (
      file: File,
      image: HTMLImageElement,
      nextFormat: OptimizeFormat,
      nextMaxWidth: number,
      nextQuality: number
    ) => {
      const shouldTransform =
        nextFormat !== 'original' ||
        (nextMaxWidth > 0 && image.width > nextMaxWidth);

      if (!shouldTransform) {
        const encoded = await imageUtils.blobToBase64(file);
        setBase64(encoded);
        setImageInfo({
          image,
          width: image.width,
          height: image.height,
          error: false,
          blob: file,
          originalBytes: file.size,
          fileName: file.name,
          mimeType: file.type || 'image/png',
        });
        return;
      }

      const targetW =
        nextMaxWidth > 0 && image.width > nextMaxWidth
          ? nextMaxWidth
          : image.width;
      const targetH = Math.max(
        1,
        Math.round((image.height * targetW) / Math.max(1, image.width))
      );

      const canvas = document.createElement('canvas');
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const mime =
        nextFormat === 'original' ? file.type || 'image/png' : nextFormat;
      if (mime === 'image/jpeg') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, targetW, targetH);
      }
      ctx.drawImage(image, 0, 0, targetW, targetH);

      const encoded = canvas.toDataURL(mime, nextQuality);
      const blob = await (await fetch(encoded)).blob();
      const previewImg = await imageUtils.newImageFromBase64(encoded);

      setBase64(encoded);
      setImageInfo({
        image: previewImg,
        width: targetW,
        height: targetH,
        error: false,
        blob,
        originalBytes: file.size,
        fileName: file.name,
        mimeType: mime,
      });
    },
    []
  );

  const transferToBase64 = async (file: File) => {
    if (isNull(file)) return;
    setImageInfo(defaultImageInfo);
    try {
      const image = await imageUtils.newImageFromBlob(file);
      sourceFileRef.current = file;
      sourceImageRef.current = image;
      await encodeWithSettings(file, image, optimizeFormat, maxWidth, quality);
      toast.success('Image converted to Base64 successfully');
    } catch {
      sourceFileRef.current = null;
      sourceImageRef.current = null;
      setBase64('');
      setImageInfo({
        ...defaultImageInfo,
        error: true,
      });
      toast.error(
        'Uploaded image is not supported. Please choose another image and try again.'
      );
    }
  };

  const reEncodeIfLoaded = (
    nextFormat: OptimizeFormat,
    nextMaxWidth: number,
    nextQuality: number
  ) => {
    const file = sourceFileRef.current;
    const image = sourceImageRef.current;
    if (!file || !image) return;
    void encodeWithSettings(file, image, nextFormat, nextMaxWidth, nextQuality);
  };

  const handleClear = () => {
    sourceFileRef.current = null;
    sourceImageRef.current = null;
    setBase64('');
    setImageInfo(defaultImageInfo);
  };

  const formattedOutput = useMemo(() => {
    if (!base64) return '';
    if (outputFormat === 'html') {
      const safeAlt = (imageInfo.fileName || 'image').replace(/"/g, '&quot;');
      return `<img src="${base64}" alt="${safeAlt}" width="${imageInfo.width}" height="${imageInfo.height}" />`;
    }
    if (outputFormat === 'css') {
      return `background-image: url('${base64}');`;
    }
    return base64;
  }, [
    base64,
    imageInfo.fileName,
    imageInfo.height,
    imageInfo.width,
    outputFormat,
  ]);

  const savingsPercent =
    imageInfo.originalBytes > 0 && imageInfo.blob
      ? Math.round(
          ((imageInfo.originalBytes - imageInfo.blob.size) /
            imageInfo.originalBytes) *
            100
        )
      : 0;

  useToolHotkeys({
    onCopy: async () => {
      if (!formattedOutput) return;
      try {
        await navigator.clipboard.writeText(formattedOutput);
        toast.success('Copied output to clipboard');
      } catch {
        // Ignore clipboard error
      }
    },
    onClear: handleClear,
  });

  return (
    <>
      <HeaderBlock
        customShortcuts={[
          { ...TOOL_HOTKEYS.copy, label: 'Copy Active Output' },
          TOOL_HOTKEYS.clear,
          TOOL_HOTKEYS.help,
        ]}
      />

      <SectionGap />

      <FilePicker onFileChange={transferToBase64} />

      <SectionGap size="sm" />

      {/* Pre-Encode Optimization Strip */}
      <div className="space-y-3 rounded-xl border border-neutral-200/80 bg-white/70 p-4 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-900/40">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            <SlidersHorizontal className="h-3.5 w-3.5 text-sky-500" />
            <span>Optimize Before Encoding (Optional)</span>
          </span>

          {imageInfo.blob && savingsPercent > 0 && (
            <span className="rounded-full border border-emerald-200/80 bg-emerald-50/90 px-2.5 py-0.5 font-mono text-[11px] font-semibold text-emerald-700 dark:border-emerald-800/70 dark:bg-emerald-950/40 dark:text-emerald-300">
              -{savingsPercent}% smaller payload
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="space-y-1">
            <span className="block text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
              Target Format
            </span>
            <Selector
              size="sm"
              options={OPTIMIZE_FORMAT_OPTIONS}
              value={optimizeFormat}
              onChange={(val) => {
                const next = val as OptimizeFormat;
                setOptimizeFormat(next);
                reEncodeIfLoaded(next, maxWidth, quality);
              }}
            />
          </div>

          <div className="space-y-1">
            <span className="block text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
              Max Width
            </span>
            <Selector
              size="sm"
              options={MAX_WIDTH_OPTIONS}
              value={String(maxWidth)}
              onChange={(val) => {
                const next = Number(val);
                setMaxWidth(next);
                reEncodeIfLoaded(optimizeFormat, next, quality);
              }}
            />
          </div>

          {(optimizeFormat === 'image/webp' ||
            optimizeFormat === 'image/jpeg') && (
            <div className="flex items-end">
              <div className="w-full">
                <Slider
                  title="Quality"
                  min={0.5}
                  max={1}
                  step={0.05}
                  value={quality}
                  showValueBadge
                  onChange={(e) => {
                    const next = parseFloat(e.target.value);
                    setQuality(next);
                    reEncodeIfLoaded(optimizeFormat, maxWidth, next);
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <SectionGap />

      {/* 50/50 Split Media Asset Inspector */}
      <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start">
        <div className="flex flex-col">
          <LabelBar label="Media Preview" icon={ImageIcon}>
            <DeleteAction onClick={handleClear} disabled={!base64} />
          </LabelBar>

          <ImagePreviewStage
            imageSrc={!imageInfo.error ? (imageInfo.image?.src ?? null) : null}
            alt={imageInfo.fileName || 'Uploaded image preview'}
            width={imageInfo.width}
            height={imageInfo.height}
            originalBytes={imageInfo.blob?.size ?? 0}
            base64Bytes={base64.length}
            mimeType={imageInfo.mimeType}
            emptyText="Upload an image above to inspect transparency & overhead"
          />
        </div>

        <div className="flex flex-col">
          <LabelBar label="Encoded Output" icon={FileCode}>
            <div className="flex flex-wrap items-center gap-2">
              <Tabs<OutputFormat>
                tabs={OUTPUT_FORMAT_TABS}
                activeTab={outputFormat}
                onChange={setOutputFormat}
                tabLabels={OUTPUT_FORMAT_LABELS}
                variant="segment"
                size="xs"
                rounded="md"
                className="p-0.5"
                tabClassName="px-2 py-0.5"
              />
              <CopyAction
                content={formattedOutput}
                disabled={!formattedOutput}
                successToast="Output copied to clipboard"
              />
            </div>
          </LabelBar>

          <Textarea
            value={formattedOutput}
            readOnly
            rows={13}
            placeholder="Base64 Data URI, HTML <img> snippet, or CSS url() output will appear here..."
            className="min-h-[320px] font-mono text-xs"
          />

          <div className="mt-2.5 flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
            <span>Format: {OUTPUT_FORMAT_LABELS[outputFormat]}</span>
            <span className="font-mono tabular-nums">
              {formattedOutput.length.toLocaleString()} chars
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
