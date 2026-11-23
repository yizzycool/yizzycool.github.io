'use client';

import { useMemo, useState } from 'react';
import { FileCode, ImageIcon } from 'lucide-react';
import { isNull } from 'lodash';

import { CopyAction, DeleteAction } from '@/components/shared/action-button';
import { FilePicker } from '@/components/ui/file-picker';
import { PillTabs } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import useToolHotkeys, { TOOL_HOTKEYS } from '@/hooks/tools/use-tool-hotkeys';
import imageUtils from '@/utils/image-utils';
import toast from '@/utils/toast';

import HeaderBlock from '../../common/header-block';
import LabelBar from '../../common/label-bar';
import SectionGap from '../../common/section-gap';
import ImagePreviewStage from '../image-preview-stage';

type OutputFormat = 'raw' | 'html' | 'css';

const OUTPUT_FORMAT_TABS: OutputFormat[] = ['raw', 'html', 'css'];

const OUTPUT_FORMAT_LABELS: Record<OutputFormat, string> = {
  raw: 'Raw String',
  html: 'HTML <img>',
  css: 'CSS url()',
};

type ImageInfo = {
  image: HTMLImageElement | null;
  width: number;
  height: number;
  error: boolean;
  blob: Blob | null;
  fileName: string;
  mimeType: string;
};

const defaultImageInfo: ImageInfo = {
  image: null,
  width: 0,
  height: 0,
  error: false,
  blob: null,
  fileName: '',
  mimeType: '',
};

export default function ImageToBase64() {
  const [base64, setBase64] = useState<string>('');
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('raw');
  const [imageInfo, setImageInfo] = useState<ImageInfo>(defaultImageInfo);

  const transferToBase64 = async (file: File) => {
    if (isNull(file)) return;
    setImageInfo(defaultImageInfo);
    try {
      const encoded = await imageUtils.blobToBase64(file);
      const image = await imageUtils.newImageFromBlob(file);
      const { width, height } = image;
      setBase64(encoded);
      setImageInfo({
        image,
        width,
        height,
        error: false,
        blob: file,
        fileName: file.name,
        mimeType: file.type || 'image/png',
      });
      toast.success('Image converted to Base64 successfully');
    } catch (e) {
      console.log('[ERROR] convert image:', e);
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

  const handleClear = () => {
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

  useToolHotkeys({
    onCopy: async () => {
      if (!formattedOutput) return;
      try {
        await navigator.clipboard.writeText(formattedOutput);
        toast.success('Copied output to clipboard');
      } catch (_e) {
        // ignore clipboard error
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
              <PillTabs<OutputFormat>
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
