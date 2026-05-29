'use client';

import { Upload } from 'lucide-react';
import { useRef } from 'react';

import IconTextButton from '../icon-text-button';

type Props = {
  handleImagesUpload: (files: FileList) => void;
};

export default function UploadBlock({ handleImagesUpload }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !files.length) return;
    handleImagesUpload(files);
  };

  return (
    <>
      <IconTextButton
        icon={Upload}
        text="Upload"
        onClick={() => inputRef.current?.click()}
      />
      {/* Hidden input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={true}
        className="hidden"
        onChange={onChange}
      />
    </>
  );
}
