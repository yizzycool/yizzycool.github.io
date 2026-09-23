'use client';

import { cn } from '@/utils/cn';
import { Image, Replace, Trash2, Upload } from 'lucide-react';
import { useRef } from 'react';

import { Button } from '@/components/ui/button';

import PanelLabel from '../../panel-label';

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
      <PanelLabel icon={Image}>Basic</PanelLabel>

      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="ghost"
          size="sm"
          bordered
          icon={hasImageSrc ? Replace : Upload}
          onClick={handleReplace}
          className={cn('font-semibold', !hasImageSrc && 'col-span-2')}
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
            className="font-semibold"
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
