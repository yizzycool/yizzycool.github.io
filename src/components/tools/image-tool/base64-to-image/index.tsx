'use client';

import type { ChangeEvent } from 'react';
import { useRef, useState } from 'react';
import imageUtils from '@/utils/image-utils';
import Image from 'next/image';
import ErrorDialog from '@/components/dialog/error';
import { Checkbox, Field, Label } from '@headlessui/react';
import { CheckIcon, TrashIcon } from '@heroicons/react/20/solid';
import Title from '../../components/title';
import _isNull from 'lodash/isNull';
import _isEmpty from 'lodash/isEmpty';

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

export default function Base64ToImage() {
  const [autoUpdate, setAutoUpdate] = useState(true);
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
      setImageInfo({ image, width, height, error: false });
    } catch (e) {
      console.log('[ERROR] convert image:', e);
      setImageInfo({ image: null, width: 0, height: 0, error: true });
    }
  };

  const onAutoUpdateChecked = (checked: boolean) => setAutoUpdate(checked);

  const onBase64StringChanged = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const base64String = event.target.value;
    setBase64(base64String);
    if (!autoUpdate) return;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => transferToImage(base64String), 500);
  };

  const onClearBase64 = () => setBase64('');

  return (
    <div className="mx-auto flex min-h-full max-w-screen-xl flex-col items-center px-5 pt-[68px]">
      <Title>Base64 to Image Converter</Title>
      <div className="mt-8 flex w-full items-center justify-between">
        {/* Enable auto update or not */}
        <Field className="flex items-center gap-2">
          <Checkbox
            checked={autoUpdate}
            onChange={onAutoUpdateChecked}
            className="group block size-6 rounded-md bg-white/10 p-1 ring-1 ring-inset ring-black/30 data-[checked]:bg-white dark:ring-white/30"
          >
            <CheckIcon className="hidden size-4 fill-black group-data-[checked]:block" />
          </Checkbox>
          <Label className="cursor-pointer">Auto Update</Label>
        </Field>
        <div className="flex items-center">
          <button
            className="flex items-center rounded-md bg-red-700 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-inner shadow-white/10 hover:bg-red-600"
            onClick={onClearBase64}
          >
            <TrashIcon className="mr-2 h-5 w-5 text-white" />
            Clear
          </button>
          <button
            className="ml-4 items-center rounded-md bg-sky-700 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-inner shadow-white/10 hover:bg-sky-600"
            onClick={() => transferToImage()}
          >
            Convert
          </button>
        </div>
      </div>
      {/* Textarea block */}
      <div className="mt-6 w-full">
        <label htmlFor="base64-textarea" className="block font-bold">
          Paste the Base64 string below
        </label>
        <textarea
          id="base64-textarea"
          className="mt-2 h-[300px] w-full resize-none rounded-md bg-white/5 px-3 py-2 text-neutral-700 outline outline-2 outline-neutral-300 focus:outline-sky-600 dark:text-neutral-300"
          value={base64}
          onChange={onBase64StringChanged}
        />
      </div>
      {/* Image block */}
      <div className="mb-20 mt-6 flex w-full flex-col items-center">
        {!imageInfo.error && !_isNull(imageInfo.image) && (
          <Image
            width={0}
            height={0}
            className="w-full object-contain"
            src={imageInfo.image.src}
            alt="result image"
          />
        )}
      </div>
      {/* Error dialog */}
      <ErrorDialog
        open={imageInfo.error}
        onClose={() => setImageInfo(DefaultImageInfo)}
        errorString="Conversion Error! Please check your base64 string and try again."
      />
    </div>
  );
}
