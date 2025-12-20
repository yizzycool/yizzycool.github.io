'use client';

import clsx from 'clsx';
import type { ChangeEvent } from 'react';
import { useRef, useState } from 'react';
import imageUtils from '@/utils/image-utils';
import Image from 'next/image';
import { FileText, ImageIcon, View } from 'lucide-react';
import HeaderBlock from '../../components/header-block';
import DeleteAction from '@/components/common/action-button/delete';
import Textarea from '@/components/common/textarea';
import PasteAction from '@/components/common/action-button/paste';
import DownloadAction from '@/components/common/action-button/download';
import CopyAction from '@/components/common/action-button/copy';
import ImageInfoTag from '../components/ImageInfoTag';
import SectionGap from '../../components/section-gap';
import _isNull from 'lodash/isNull';
import _isEmpty from 'lodash/isEmpty';
import _size from 'lodash/size';

type ImageInfo = {
  blob: Blob | null;
  image: HTMLImageElement | null;
  width: number;
  height: number;
};

const DefaultImageInfo: ImageInfo = {
  blob: null,
  image: null,
  width: 0,
  height: 0,
};

export default function Base64ToImage() {
  const [base64, setBase64] = useState<string>('');
  const [imageInfo, setImageInfo] = useState<ImageInfo>(DefaultImageInfo);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const transferToImage = async (base64String: string | undefined = base64) => {
    if (_isNull(base64String)) return;
    if (_isEmpty(base64String)) {
      setImageInfo(DefaultImageInfo);
      return;
    }
    try {
      const prefix = /^data:image\/[a-z]+;base64,/;
      // If string does not start with 'data...', add prefix to it.
      const transformedBase64 = prefix.test(base64String)
        ? base64String
        : `data:image/png;base64,${base64String}`;
      const image = await imageUtils.newImageFromBase64(transformedBase64);
      const { width, height } = image;
      const type = imageUtils.parseTypeFromBase64(transformedBase64);
      const blob = await imageUtils.imageToBlob(image, type || 'image/png');
      setImageInfo({ image, width, height, blob });
    } catch (_e) {
      console.log('An error occurred while converting image');
      setImageInfo(DefaultImageInfo);
    }
  };

  const onBase64StringChanged = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const base64String = event.target.value;
    setBase64(base64String);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => transferToImage(base64String), 500);
  };

  const onPasteBase64 = (value: string) => {
    setBase64(value as string);
    timerRef.current = setTimeout(() => transferToImage(value as string), 500);
  };

  const onClearBase64 = () => {
    transferToImage('');
    setBase64('');
  };

  return (
    <>
      <HeaderBlock />

      <SectionGap />

      {/* Textarea block */}
      <div className="mb-3 flex flex-col-reverse items-center justify-between gap-2 sm:flex-row">
        <label
          htmlFor="base64-textarea"
          className="block flex items-center self-start font-semibold sm:self-auto"
        >
          <FileText className="mr-2 inline-block" size={16} />
          Paste Base64 string below
        </label>
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <PasteAction onClick={onPasteBase64} />
          <DeleteAction onClick={onClearBase64} disabled={_isEmpty(base64)} />
        </div>
      </div>
      <Textarea
        id="base64-textarea"
        value={base64}
        onChange={onBase64StringChanged}
        rows={10}
        placeholder="Paste your Base64 string here (e.g. data:image/png;base64,...)"
        autoFocus
      />
      {/* Char count block */}
      <div className="mt-3 w-full text-right text-xs text-neutral-400 dark:text-neutral-600">
        {_size(base64)} chars
      </div>

      <SectionGap />

      {/* Image block */}
      <div className="mb-4 flex flex-col-reverse items-center justify-between gap-2 sm:flex-row">
        <div className="self-start font-semibold sm:self-auto">
          <View className="mr-2 inline-block" size={16} />
          Image Preview
        </div>
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <CopyAction content={imageInfo.blob} />
          <DownloadAction
            blob={imageInfo.blob}
            disabled={!imageInfo.image}
            filename={`converted_${Date.now()}`}
          />
        </div>
      </div>
      <div
        className={clsx(
          'relative flex h-[300px] w-full flex-col items-center rounded-lg p-4',
          'border border-neutral-200 dark:border-neutral-700',
          'backgrop-blur',
          'bg-white/80 dark:bg-neutral-900/80'
        )}
      >
        {_isNull(imageInfo.image) ? (
          <div className="m-auto text-center text-lg font-bold text-neutral-500">
            <ImageIcon className="mx-auto mb-4 block" size={40} />
            <div>Image will be displayed here</div>
          </div>
        ) : (
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
    </>
  );
}
