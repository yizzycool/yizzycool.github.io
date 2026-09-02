'use client';

import { FileCode, ImageIcon } from 'lucide-react';
import { useState } from 'react';
import { isNull, size } from 'lodash';
import Image from 'next/image';

import { cn } from '@/utils/cn';
import imageUtils from '@/utils/image-utils';
import HeaderBlock from '../../common/header-block';
import FilePicker from '@/components/common/file-picker';
import CopyAction from '@/components/common/action-button/copy';
import ImageInfoTag from '../image-info-tag';
import SectionGap from '../../common/section-gap';
import LabelBar from '../../common/label-bar';
import Label from '@/components/common/label';
import Textarea from '@/components/common/textarea';
import toast from '@/utils/toast';

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
      toast.success('Image converted to Base64 successfully');
    } catch (e) {
      console.log('[ERROR] convert image:', e);
      setImageInfo({
        image: null,
        width: 0,
        height: 0,
        error: true,
        blob: null,
      });
      toast.error(
        'Uploaded image is not supported. Please choose another image and try again.'
      );
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

      {/* Image Preview & Output */}
      <div className="grid w-full grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="flex-1">
          <div className="mb-3 flex items-center font-semibold">
            <Label icon={ImageIcon}>Image Preview</Label>
          </div>
          <div
            className={cn(
              'relative flex h-[300px] w-full flex-col items-center justify-center rounded-xl border p-4 transition-all duration-200',
              'shadow-2xs border-neutral-200/90 bg-white/80 backdrop-blur-md',
              'dark:border-neutral-700/80 dark:bg-neutral-900/80'
            )}
          >
            {!imageInfo.error && !isNull(imageInfo.image) ? (
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
            ) : (
              <div className="m-auto text-center text-sm font-medium text-slate-400 dark:text-slate-500">
                <ImageIcon
                  className="mx-auto mb-3 block opacity-50"
                  size={36}
                />
                <div>Image will be displayed here</div>
              </div>
            )}
          </div>
        </div>
        <div className="flex-1">
          <LabelBar label="Base64 Output" icon={FileCode}>
            <CopyAction content={base64} className="py-1" />
          </LabelBar>
          <Textarea
            value={base64}
            readOnly
            rows={11}
            placeholder="Base64 output will appear here after uploading an image..."
            className="font-mono text-xs"
          />
          {/* Char count block */}
          <div className="mt-2.5 w-full text-right text-xs text-slate-400 dark:text-slate-500">
            {size(base64)} chars
          </div>
        </div>
      </div>
    </>
  );
}
