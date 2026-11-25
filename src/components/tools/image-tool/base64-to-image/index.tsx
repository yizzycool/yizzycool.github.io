'use client';

import type { ChangeEvent } from 'react';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Layers, View, WandSparkles } from 'lucide-react';
import { isEmpty, isNull } from 'lodash';

import {
  CopyAction,
  DeleteAction,
  DownloadAction,
  PasteAction,
} from '@/components/shared/action-button';
import { Button } from '@/components/ui/button';
import { ConfirmDialog, useConfirmDialog } from '@/components/ui/dialog';
import { ErrorMessage } from '@/components/ui/error-message';
import { Textarea } from '@/components/ui/textarea';
import { ToolKeys, ToolUrls } from '@/data/tools';
import { useToolsDB } from '@/hooks/tools/use-tools-db';
import useToolHotkeys, { TOOL_HOTKEYS } from '@/hooks/tools/use-tool-hotkeys';
import imageUtils from '@/utils/image-utils';
import toast from '@/utils/toast';

import HeaderBlock from '../../common/header-block';
import LabelBar from '../../common/label-bar';
import SectionGap from '../../common/section-gap';
import Base64ModeSwitcher from '../base64-mode-switcher';
import ImagePreviewStage from '../image-preview-stage';
import { writeStudioHandoff } from '../studio-handoff';

type ImageInfo = {
  blob: Blob | null;
  image: HTMLImageElement | null;
  width: number;
  height: number;
  mimeType: string;
};

const defaultImageInfo: ImageInfo = {
  blob: null,
  image: null,
  width: 0,
  height: 0,
  mimeType: '',
};

const DATA_URI_PREFIX = /^data:(image\/[a-z0-9.+-]+);base64,/i;

export default function Base64ToImage() {
  const router = useRouter();
  const { isSupported: isDbSupported, setValue: dbSetValue } = useToolsDB();

  const [base64, setBase64] = useState<string>('');
  const [decodeError, setDecodeError] = useState<string | null>(null);
  const [imageInfo, setImageInfo] = useState<ImageInfo>(defaultImageInfo);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const {
    isOpen: isConfirmOpen,
    confirm,
    dialogProps: confirmDialogProps,
  } = useConfirmDialog();

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const transferToImage = async (rawInput: string | undefined = base64) => {
    if (isNull(rawInput)) return;
    const trimmed = rawInput.trim();
    if (isEmpty(trimmed)) {
      setImageInfo(defaultImageInfo);
      setDecodeError(null);
      return;
    }

    try {
      const matched = trimmed.match(DATA_URI_PREFIX);
      const mimeType = matched ? matched[1].toLowerCase() : 'image/png';
      const transformedBase64 = matched
        ? trimmed
        : `data:image/png;base64,${trimmed}`;

      const image = await imageUtils.newImageFromBase64(transformedBase64);
      const { width, height } = image;
      const canvasType =
        mimeType === 'image/jpeg' || mimeType === 'image/webp'
          ? mimeType
          : 'image/png';
      const blob = await imageUtils.imageToBlob(image, canvasType);

      setImageInfo({ image, width, height, blob, mimeType });
      setDecodeError(null);
    } catch {
      setImageInfo(defaultImageInfo);
      setDecodeError(
        'Could not decode Base64 input into a valid image. Verify the Data URI or raw Base64 payload.'
      );
    }
  };

  const scheduleDecode = (nextValue: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => transferToImage(nextValue), 350);
  };

  const onBase64StringChanged = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const base64String = event.target.value;
    setBase64(base64String);
    scheduleDecode(base64String);
  };

  const onPasteBase64 = (value: string) => {
    setBase64(value);
    scheduleDecode(value);
  };

  const onClearBase64 = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setBase64('');
    setImageInfo(defaultImageInfo);
    setDecodeError(null);
  };

  const handleSendToStudio = async (
    target: 'pic-merge-studio' | 'photo-editor'
  ) => {
    if (!imageInfo.blob) return;
    if (!isDbSupported) {
      toast.error('IndexedDB is unavailable in this browser session');
      return;
    }

    await writeStudioHandoff(dbSetValue, target, {
      version: 1,
      createdAt: Date.now(),
      source: target === 'photo-editor' ? 'pic-merge-studio' : 'photo-editor',
      mode: target === 'pic-merge-studio' ? 'append' : 'replace',
      width: Math.max(100, imageInfo.width || 1080),
      height: Math.max(100, imageInfo.height || 1080),
      items: [{ name: 'decoded-image.png', blob: imageInfo.blob }],
    });

    const targetUrl =
      target === 'photo-editor'
        ? ToolUrls[ToolKeys.photoEditorStudio] ||
          '/tools/image-tool/photo-editor'
        : ToolUrls[ToolKeys.picMergeStudio] ||
          '/tools/image-tool/pic-merge-studio';
    router.push(`${targetUrl}?handoff=1`);
  };

  const requestSendToStudio = (target: 'pic-merge-studio' | 'photo-editor') => {
    if (!imageInfo.blob) return;
    const isPicMerge = target === 'pic-merge-studio';
    void confirm({
      title: isPicMerge
        ? 'Add Image to PicMerge Studio'
        : 'Open Image in Photo Editor Studio',
      message: isPicMerge
        ? 'Add this decoded image into your PicMerge Studio collage? Your existing PicMerge draft will be preserved.'
        : 'Open this decoded image in Photo Editor Studio for layers, filters, and cutouts? This will replace the current Photo Editor canvas.',
      confirmText: isPicMerge ? 'Add to PicMerge' : 'Open in Photo Editor',
      cancelText: 'Cancel',
      confirmVariant: 'primary',
      onConfirm: () => {
        void handleSendToStudio(target);
      },
    });
  };

  useToolHotkeys(
    {
      onPaste: async () => {
        try {
          const clipText = await navigator.clipboard.readText();
          onPasteBase64(clipText);
        } catch {
          // Ignore clipboard errors
        }
      },
      onClear: onClearBase64,
    },
    { target: textareaRef, enabled: !isConfirmOpen }
  );

  return (
    <>
      <HeaderBlock
        customShortcuts={[
          TOOL_HOTKEYS.paste,
          TOOL_HOTKEYS.clear,
          TOOL_HOTKEYS.help,
        ]}
      />

      <SectionGap />

      <Base64ModeSwitcher active="base64-to-image" />

      <SectionGap size="sm" />

      {/* 50/50 Split Media Asset Inspector */}
      <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start">
        <div className="flex flex-col">
          <LabelBar
            label="Base64 Input"
            icon={FileText}
            htmlFor="base64-textarea"
          >
            <PasteAction onClick={onPasteBase64} />
            <DeleteAction onClick={onClearBase64} disabled={isEmpty(base64)} />
          </LabelBar>

          <Textarea
            ref={textareaRef}
            id="base64-textarea"
            value={base64}
            onChange={onBase64StringChanged}
            rows={13}
            placeholder="Paste your Base64 string or Data URI here (e.g. data:image/png;base64,...)"
            className="min-h-[320px] font-mono text-xs"
          />

          <div className="mt-2.5 flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
            <span>Supports PNG, JPEG, WebP, GIF, and SVG Data URIs</span>
            <span className="font-mono tabular-nums">
              {base64.length.toLocaleString()} chars
            </span>
          </div>

          <ErrorMessage message={decodeError} className="mt-3" />
        </div>

        <div className="flex flex-col">
          <LabelBar label="Media Preview" icon={View}>
            <div className="flex flex-wrap items-center gap-2">
              <CopyAction content={imageInfo.blob} />
              <DownloadAction
                blob={imageInfo.blob}
                disabled={!imageInfo.image}
                filename="converted_image"
              />
            </div>
          </LabelBar>

          <ImagePreviewStage
            imageSrc={imageInfo.image?.src ?? null}
            alt="Decoded Base64 image preview"
            width={imageInfo.width}
            height={imageInfo.height}
            originalBytes={imageInfo.blob?.size ?? 0}
            base64Bytes={base64.trim().length}
            mimeType={imageInfo.mimeType}
            emptyText="Decoded image will appear here with grid/light/dark preview"
          />

          {imageInfo.blob && (
            <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
              <Button
                variant="secondary"
                size="xs"
                bordered
                icon={Layers}
                onClick={() => requestSendToStudio('pic-merge-studio')}
              >
                Add to PicMerge
              </Button>
              <Button
                variant="secondary"
                size="xs"
                bordered
                icon={WandSparkles}
                onClick={() => requestSendToStudio('photo-editor')}
                className="text-sky-600 dark:text-sky-400"
              >
                Edit in Photo Editor
              </Button>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog {...confirmDialogProps} />
    </>
  );
}
