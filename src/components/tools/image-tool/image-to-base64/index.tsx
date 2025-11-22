'use client';

import { useState } from 'react';
import imageUtils from '@/utils/image-utils';
import Image from 'next/image';
import ErrorDialog from '@/components/common/dialog/error';
import Title from '../../components/title';
import _isNull from 'lodash/isNull';
import _isEmpty from 'lodash/isEmpty';
import FilePicker from '@/components/common/file-picker';
import Description from '../../components/description';

type ImageInfo = {
  image: HTMLImageElement | null;
  width: number;
  height: number;
  error: boolean;
};

const DefaultImageInfo: ImageInfo = {
  image: null,
  width: 0,
  height: 0,
  error: false,
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
      setImageInfo({ image, width, height, error: false });
    } catch (e) {
      console.log('[ERROR] convert image:', e);
      setImageInfo({ image: null, width: 0, height: 0, error: true });
    }
  };

  const onFileChange = (file: File) => {
    transferToBase64(file);
  };

  return (
    <div className="mx-auto flex min-h-full max-w-screen-lg flex-col items-center px-5 lg:px-10">
      <Title>Image to Base64</Title>
      <Description>
        Convert your images to Base64 strings instantly. Supports drag & drop,
        runs entirely in your browser to ensure privacy.
      </Description>
      {/* File Picker */}
      <FilePicker type="image" onFileChange={onFileChange} />
      {/* Textarea block */}
      <div className="mt-8 w-full">
        <div className="mb-2 font-bold">Base64 string</div>
        <textarea
          className="mt-2 h-[300px] w-full resize-none rounded-md bg-white/5 px-3 py-2 text-neutral-700 outline outline-1 outline-neutral-500/20 dark:text-neutral-300"
          value={base64}
          onChange={() => {}}
          contentEditable={false}
          disabled
        />
      </div>
      {/* Image block */}
      <div className="mb-20 mt-8 w-full">
        <div className="mb-2 font-bold">Image</div>
        <div className="flex h-[300px] w-full flex-col items-center rounded-md bg-neutral-500/20">
          {!imageInfo.error && !_isNull(imageInfo.image) && (
            <Image
              width={0}
              height={0}
              className="h-full max-h-full w-full max-w-full object-contain"
              src={imageInfo.image.src}
              alt="result image"
            />
          )}
        </div>
      </div>
      {/* Error dialog */}
      <ErrorDialog
        open={imageInfo.error}
        onClose={() => setImageInfo(DefaultImageInfo)}
        errorString="Uploaded image is not supported now. Please choose another image and try again."
      />
    </div>
  );
}
