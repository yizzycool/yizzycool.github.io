'use client';

import clsx from 'clsx';
import { Image, LayersIcon, Replace, Trash2, Upload } from 'lucide-react';
import { useRef } from 'react';

import { useControlDrawer } from '../hooks/use-control-drawer';
import IconTextButton from '../icon-text-button';
import BottomDrawer from '../bottom-drawer';
import GroupTitle from '../group-title';
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

  const { isOpen, openDrawer, closeDrawer } = useControlDrawer();

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
    <>
      <IconTextButton icon={Image} text="Basic" onClick={openDrawer} />

      <BottomDrawer isOpen={isOpen} onClose={closeDrawer}>
        <div className="space-y-4 p-4">
          <GroupTitle text="Basic" icon={LayersIcon} />
          <div className="flex gap-4">
            <Button
              variant="ghost"
              size="sm"
              bordered
              icon={hasImageSrc ? Replace : Upload}
              onClick={handleReplace}
              className={clsx('font-black', !hasImageSrc && 'col-span-2')}
            >
              {hasImageSrc ? 'Replace' : 'Upload'}
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
      </BottomDrawer>
    </>
  );
}
