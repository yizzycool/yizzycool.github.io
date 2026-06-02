'use client';

import { cn } from '@/utils/cn';
import { FileCode, ImageIcon } from 'lucide-react';
import { useState } from 'react';
import { isNull, size } from 'lodash';
import Image from 'next/image';
import { Textarea } from '@headlessui/react';

import imageUtils from '@/utils/image-utils';
import HeaderBlock from '../../header-block';
import FilePicker from '@/components/common/file-picker';
import CopyAction from '@/components/common/action-button/copy';
import ImageInfoTag from '../ImageInfoTag';
import SectionGap from '../../section-gap';
import Snackbar from '@/components/common/snackbar';
import Label from '@/components/common/label';

type ImageInfo = {
  image: HTMLImageElement | null;
  width: number;
  height: number;
  error: boolean;
  blob: Blob | null;
};

const defaultImageInfo: ImageInfo = {
  image: null,
  width: 0,
  height: 0,
  error: false,
  blob: null,
};

export default function ImageToBase64() {
  const [base64, setBase64] = useState<string>('');
  const [imageInfo, setImageInfo] = useState<ImageInfo>(defaultImageInfo);

  const transferToBase64 = async (file: File) => {
    if (isNull(file)) return;
    setImageInfo(defaultImageInfo);
    try {
      const base64 = await imageUtils.blobToBase64(file);
      const image = await imageUtils.newImageFromBlob(file);
      const { width, height } = image;
      setBase64(base64);
      setImageInfo({ image, width, height, error: false, blob: file });
    } catch (e) {
      console.log('[ERROR] convert image:', e);
      setImageInfo({
        image: null,
        width: 0,
        height: 0,
        error: true,
        blob: null,
      });
    }
  };

  const onFileChange = (file: File) => {
    transferToBase64(file);
  };

  return (
    <>
      <HeaderBlock />

      <SectionGap />

      {/* File Picker */}
      <FilePicker onFileChange={onFileChange} />

      <SectionGap />

      {/* Image Preview */}
      <div className="grid w-full grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="flex-1">
          <div className="mb-3 flex items-center font-semibold">
            <Label icon={ImageIcon}>Image Preview</Label>
          </div>
          <div
            className={cn(
              'relative flex h-[300px] w-full flex-col items-center rounded-lg border p-4',
              'border-neutral-200/80 dark:border-neutral-800/60',
              'backdrop-blur-md',
              'bg-white/40 dark:bg-neutral-900/40'
            )}
          >
            {!imageInfo.error && !isNull(imageInfo.image) && (
              <>
                <Image
                  width={0}
                  height={0}
                  className="h-full max-h-full w-full max-w-full object-contain"
                  src={imageInfo.image.src}
                  alt="result image"
                />
                <div className="absolute bottom-4 left-4 z-20 flex gap-2 overflow-hidden">
                  <ImageInfoTag
                    title=""
                    value={`${imageInfo.width} x ${imageInfo.height}`}
                  />
                  <ImageInfoTag
                    title="Sizes"
                    value={imageUtils.toHumanReadableSize(
                      imageInfo.blob?.size || 0
                    )}
                  />
                </div>
              </>
            )}
          </div>
        </div>
        <div className="flex-1">
          <div className="mb-3 flex items-center justify-between">
            <Label icon={FileCode}>Base64 Output</Label>
            <CopyAction content={base64} className="py-1" />
          </div>
          <Textarea
            className={cn(
              'h-[300px] w-full rounded-lg border px-4 py-3',
              'resize-none font-mono text-sm leading-relaxed outline-none',
              'border-neutral-200/80 dark:border-neutral-800/60',
              'backdrop-blur-md',
              'bg-white/40 dark:bg-neutral-900/40',
              'text-neutral-700 dark:text-neutral-200',
              'placeholder-neutral-400 dark:placeholder-neutral-500',
              'focus:border-transparent focus:ring-2 focus:ring-blue-500'
            )}
            value={base64}
            readOnly
          />
          {/* Char count block */}
          <div className="mt-3 w-full text-right text-xs text-neutral-400 dark:text-neutral-600">
            {size(base64)} chars
          </div>
        </div>
      </div>

      <Snackbar
        variant="error"
        open={imageInfo.error}
        onClose={() => setImageInfo(defaultImageInfo)}
        content="Uploaded image is not supported now. Please choose another image and try again."
      />
    </>
  );
}
