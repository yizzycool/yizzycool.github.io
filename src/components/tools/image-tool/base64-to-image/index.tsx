'use client';

import type { ChangeEvent } from 'react';

import { useEffect, useRef, useState } from 'react';
import { FileText, View } from 'lucide-react';
import { isEmpty, isNull } from 'lodash';

import {
  CopyAction,
  DeleteAction,
  DownloadAction,
  PasteAction,
} from '@/components/shared/action-button';
import { ErrorMessage } from '@/components/ui/error-message';
import { Textarea } from '@/components/ui/textarea';
import useToolHotkeys, { TOOL_HOTKEYS } from '@/hooks/tools/use-tool-hotkeys';
import imageUtils from '@/utils/image-utils';

import HeaderBlock from '../../common/header-block';
import LabelBar from '../../common/label-bar';
import SectionGap from '../../common/section-gap';
import ImagePreviewStage from '../image-preview-stage';

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
  const [base64, setBase64] = useState<string>('');
  const [decodeError, setDecodeError] = useState<string | null>(null);
  const [imageInfo, setImageInfo] = useState<ImageInfo>(defaultImageInfo);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

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
    } catch (_e) {
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

  useToolHotkeys(
    {
      onPaste: async () => {
        try {
          const clipText = await navigator.clipboard.readText();
          onPasteBase64(clipText);
        } catch (_e) {
          // ignore
        }
      },
      onClear: onClearBase64,
    },
    { target: textareaRef }
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
            <div className="flex items-center gap-2">
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
        </div>
      </div>
    </>
  );
}
