'use client';

import type { ChangeEvent } from 'react';
import { useEffect, useState } from 'react';
import imageUtils from '@/utils/image-utils';
import ErrorDialog from '@/components/dialog/error';
import _isNull from 'lodash/isNull';
import _isEmpty from 'lodash/isEmpty';
import { Checkbox, Field, Label } from '@headlessui/react';
import { CheckIcon } from '@heroicons/react/20/solid';

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
  const [base64, setBase64] = useState<string | null>(null);
  const [imageInfo, setImageInfo] = useState<ImageInfo>(DefaultImageInfo);

  useEffect(() => {
    if (!autoUpdate) return;
    transferToImage();
  }, [base64]);

  const transferToImage = async () => {
    if (_isNull(base64)) return;
    if (_isEmpty(base64)) {
      setImageInfo(DefaultImageInfo);
      return;
    }
    try {
      const image = await imageUtils.newImageFromBase64(base64);
      const { width, height } = image;
      setImageInfo({ image, width, height, error: false });
    } catch (e) {
      setImageInfo({ image: null, width: 0, height: 0, error: true });
    }
  };

  const onAutoUpdateChecked = (checked: boolean) => setAutoUpdate(checked);

  const onBase64StringChanged = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const base64String = event.target.value;
    const prefix = /^data:image\/[a-z]+;base64,/;
    if (prefix.test(base64String)) {
      setBase64(base64String);
    } else {
      setBase64(`data:image/png;base64,${base64String}`);
    }
    setBase64(base64String);
  };

  return (
    <div className="mx-auto flex min-h-full max-w-screen-xl flex-col items-center px-5 pt-[68px]">
      <h1 className="mx-auto mt-10 text-3xl font-bold">
        Base64 to Image Converter
      </h1>
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
        <button
          className="items-center rounded-md bg-sky-700 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-inner shadow-white/10 hover:bg-sky-600"
          onClick={transferToImage}
        >
          Convert
        </button>
      </div>
      {/* Textarea block */}
      <div className="mt-6 w-full">
        <label htmlFor="base64-textarea" className="block font-bold">
          Paste the Base64 string below
        </label>
        <textarea
          id="base64-textarea"
          className="mt-2 h-[300px] w-full resize-none rounded-md bg-white/5 px-3 py-2 text-neutral-700 outline outline-2 outline-neutral-300 focus:outline-sky-600 dark:text-neutral-300"
          onChange={onBase64StringChanged}
        />
      </div>
      {/* Image block */}
      <div className="mb-20 mt-6 flex w-full flex-col items-center">
        {!_isNull(imageInfo.image) && (
          <img className="" src={imageInfo.image.src} alt="result image" />
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
