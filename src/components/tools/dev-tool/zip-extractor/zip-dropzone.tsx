'use client';

import { FolderArchive } from 'lucide-react';

import { FilePicker } from '@/components/ui/file-picker';
import { DeleteAction, SampleAction } from '@/components/shared/action-button';
import { FileLoadedCard } from '@/components/shared/file-loaded-card';
import LabelBar from '@/components/tools/common/label-bar';

interface ZipDropzoneProps {
  file: File | null;
  isParsing: boolean;
  onFileSelect: (file: File) => void;
  onClear: () => void;
  onLoadSample: () => void;
}

export default function ZipDropzone({
  file,
  isParsing,
  onFileSelect,
  onClear,
  onLoadSample,
}: ZipDropzoneProps) {
  return (
    <div>
      <LabelBar
        label="ZIP Archive Input"
        description="Select or drop any .zip file. 100% processed locally in your browser memory."
        actions={
          <div className="flex items-center gap-2">
            {!file && (
              <SampleAction
                rounded="lg"
                label="Load Sample ZIP"
                onClick={onLoadSample}
              />
            )}
            {file && (
              <DeleteAction
                variant="ghost"
                bordered
                rounded="lg"
                label="Clear Archive"
                onClick={onClear}
              />
            )}
          </div>
        }
      />

      {file ? (
        <FileLoadedCard
          fileName={file.name}
          fileSize={file.size}
          description={
            isParsing
              ? 'Analyzing central directory...'
              : 'Archive loaded and inspected in local memory'
          }
          icon={FolderArchive}
          accept=".zip,application/zip,application/x-zip-compressed"
          onChangeFile={onFileSelect}
          changeButtonLabel="Change ZIP"
        />
      ) : (
        <FilePicker
          icon={FolderArchive}
          title="Drag and drop your ZIP file here"
          desc="Or click to browse from device (Supports full directory hierarchies, UTF-8 & legacy archives)"
          accept=".zip,application/zip,application/x-zip-compressed"
          onFileChange={onFileSelect}
        />
      )}
    </div>
  );
}
