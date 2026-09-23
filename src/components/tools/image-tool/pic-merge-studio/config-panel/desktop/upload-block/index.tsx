'use client';

import { Upload } from 'lucide-react';

import { FilePicker } from '@/components/ui/file-picker';

import PanelLabel from '../../panel-label';

type Props = {
  handleImagesUpload: (files: FileList) => void;
};

export default function UploadBlock({ handleImagesUpload }: Props) {
  return (
    <div className="space-y-4">
      <PanelLabel icon={Upload}>Upload Images</PanelLabel>
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
