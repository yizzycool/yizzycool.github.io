'use client';

import { FileText, ImageIcon, View } from 'lucide-react';
import { useRef, useState } from 'react';
import { isNull, isEmpty, size } from 'lodash';
import Image from 'next/image';

import { cn } from '@/utils/cn';
import imageUtils from '@/utils/image-utils';
import HeaderBlock from '../../common/header-block';
import DeleteAction from '@/components/common/action-button/delete';
import Textarea from '@/components/common/textarea';
import PasteAction from '@/components/common/action-button/paste';
import DownloadAction from '@/components/common/action-button/download';
import CopyAction from '@/components/common/action-button/copy';
import ImageInfoTag from '../image-info-tag';
import SectionGap from '../../common/section-gap';
import LabelBar from '../../common/label-bar';

type ImageInfo = {
  blob: Blob | null;
  image: HTMLImageElement | null;
  width: number;
  height: number;
};

const defaultImageInfo: ImageInfo = {
  blob: null,
  image: null,
  width: 0,
  height: 0,
};

export default function Base64ToImage() {
  const [base64, setBase64] = useState<string>('');
  const [imageInfo, setImageInfo] = useState<ImageInfo>(defaultImageInfo);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const transferToImage = async (base64String: string | undefined = base64) => {
    if (isNull(base64String)) return;
    if (isEmpty(base64String)) {
      setImageInfo(defaultImageInfo);
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
      setImageInfo(defaultImageInfo);
    }
  };

  const onBase64StringChanged = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
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
      <LabelBar
        label="Paste Base64 string below"
        icon={FileText}
        htmlFor="base64-textarea"
      >
        <PasteAction onClick={onPasteBase64} />
        <DeleteAction onClick={onClearBase64} disabled={isEmpty(base64)} />
      </LabelBar>
      <Textarea
        id="base64-textarea"
        value={base64}
        onChange={onBase64StringChanged}
        rows={10}
        placeholder="Paste your Base64 string here (e.g. data:image/png;base64,...)"
        className="font-mono text-xs"
      />
      {/* Char count block */}
      <div className="mt-2.5 w-full text-right text-xs text-slate-400 dark:text-slate-500">
        {size(base64)} chars
      </div>

      <SectionGap />

      {/* Image block */}
      <LabelBar label="Image Preview" icon={View} className="mb-4">
        <CopyAction content={imageInfo.blob} />
        <DownloadAction
          blob={imageInfo.blob}
          disabled={!imageInfo.image}
          filename="converted_image"
        />
      </LabelBar>
      <div
        className={cn(
          'relative flex h-[300px] w-full flex-col items-center justify-center rounded-xl border p-4 transition-all duration-200',
          'shadow-2xs border-neutral-200/90 bg-white/80 backdrop-blur-md',
          'dark:border-neutral-700/80 dark:bg-neutral-900/80'
        )}
      >
        {isNull(imageInfo.image) ? (
          <div className="m-auto text-center text-sm font-medium text-slate-400 dark:text-slate-500">
            <ImageIcon className="mx-auto mb-3 block opacity-50" size={36} />
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
                value={`${imageInfo.width} × ${imageInfo.height} px`}
              />
              <ImageInfoTag
                title=""
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
