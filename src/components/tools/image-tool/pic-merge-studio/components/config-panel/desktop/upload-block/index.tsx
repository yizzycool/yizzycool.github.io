'use client';

import { Upload } from 'lucide-react';

import FilePicker from '@/components/common/file-picker';
import Label from '@/components/common/label';

type Props = {
  handleImagesUpload: (files: FileList) => void;
};

export default function UploadBlock({ handleImagesUpload }: Props) {
  return (
    <div className="space-y-4">
      <Label
        icon={Upload}
        className="text-xs !font-black uppercase tracking-widest"
      >
        Upload Images
      </Label>
      <FilePicker
        title=""
        desc="Add photos to canvas"
        showButton={false}
        onFilesChange={handleImagesUpload}
        multiple
      />
    </div>
  );
}
