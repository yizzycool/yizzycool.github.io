'use client';

import clsx from 'clsx';
import { FileCode, ImageIcon } from 'lucide-react';
import { useState } from 'react';
import imageUtils from '@/utils/image-utils';
import Image from 'next/image';
import { Textarea } from '@headlessui/react';
import HeaderBlock from '../../components/header-block';
import FilePicker from '@/components/common/file-picker';
import CopyAction from '@/components/common/action-button/copy';
import ImageInfoTag from '../components/ImageInfoTag';
import ErrorDialog from '@/components/common/dialog/error';
import _isNull from 'lodash/isNull';
import _isEmpty from 'lodash/isEmpty';
import _size from 'lodash/size';

type ImageInfo = {
  image: HTMLImageElement | null;
  width: number;
  height: number;
  error: boolean;
  blob: Blob | null;
};

const DefaultImageInfo: ImageInfo = {
  image: null,
  width: 0,
  height: 0,
  error: false,
  blob: null,
};

export default function ImageToBase64() {
  const [base64, setBase64] = useState<string>('');
  const [imageInfo, setImageInfo] = useState<ImageInfo>(DefaultImageInfo);

  const transferToBase64 = async (file: File) => {
    if (_isNull(file)) return;
    setImageInfo(DefaultImageInfo);
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

      <div className="mt-8 sm:mt-16" />

      {/* File Picker */}
      <FilePicker type="image" onFileChange={onFileChange} />

      {/* Image Preview */}
      {!!imageInfo.image && (
        <div className="mt-16 grid w-full grid-cols-1 gap-8 duration-500 animate-in fade-in slide-in-from-bottom-4 lg:grid-cols-2">
          <div className="flex-1">
            <div className="mb-3 flex items-center font-semibold">
              <ImageIcon className="mr-2" size={16} />
              Image Preview
            </div>
            <div
              className={clsx(
                'relative flex h-[300px] w-full flex-col items-center rounded-lg border p-4',
                'border-neutral-200 dark:border-neutral-700',
                'bg-white dark:bg-neutral-800'
              )}
            >
              {!imageInfo.error && !_isNull(imageInfo.image) && (
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
              <div className="flex items-center font-semibold">
                <FileCode className="mr-2" size={16} />
                Base64 Output
              </div>
              <CopyAction content={base64} />
            </div>
            <Textarea
              className={clsx(
                'h-[300px] w-full rounded-lg border px-4 py-3',
                'resize-none font-mono text-sm leading-relaxed outline-none',
                'border-neutral-200 dark:border-neutral-700',
                'bg-white dark:bg-neutral-800',
                'text-neutral-700 dark:text-neutral-200',
                'placeholder-neutral-400 dark:placeholder-neutral-500',
                'focus:border-transparent focus:ring-2 focus:ring-blue-500'
              )}
              value={base64}
              readOnly
            />
            {/* Char count block */}
            <div className="mt-3 w-full text-right text-xs text-neutral-400 dark:text-neutral-600">
              {_size(base64)} chars
            </div>
          </div>
        </div>
      )}

      {/* Error dialog */}
      <ErrorDialog
        open={imageInfo.error}
        onClose={() => setImageInfo(DefaultImageInfo)}
        errorString="Uploaded image is not supported now. Please choose another image and try again."
      />
    </>
  );
}
