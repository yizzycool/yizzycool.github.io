'use client';

import clsx from 'clsx';
import { Image, Replace, Trash2, Upload } from 'lucide-react';
import { useRef } from 'react';

import Label from '@/components/common/label';
import Button from '@/components/common/button';

import _xor from 'lodash/xor';

type Props = {
  hasImageSrc: boolean;
  replaceImage: (file: File) => void;
  deleteImage: () => void;
};

export default function Basic({
  hasImageSrc,
  replaceImage,
  deleteImage,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleReplace = () => {
    if (!inputRef.current) return;
    inputRef.current.click();
  };

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    replaceImage(file);
  };

  return (
    <div className="space-y-4">
      <Label
        icon={Image}
        className="text-xs !font-black uppercase tracking-widest"
      >
        Basic
      </Label>

      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="ghost"
          size="sm"
          bordered
          icon={hasImageSrc ? Replace : Upload}
          onClick={handleReplace}
          className={clsx('font-black', !hasImageSrc && 'col-span-2')}
        >
          {hasImageSrc ? 'Replace' : 'Choose an Image'}
        </Button>
        {hasImageSrc && (
          <Button
            variant="error"
            size="sm"
            bordered
            icon={Trash2}
            onClick={deleteImage}
            className="font-black"
          >
            Delete
          </Button>
        )}
      </div>

      {/* Hidden input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onChange}
      />
    </div>
  );
}
