'use client';

import { FileArchive } from 'lucide-react';

import { FilePicker } from '@/components/ui/file-picker';
import { DeleteAction, SampleAction } from '@/components/shared/action-button';
import { FileLoadedCard } from '@/components/shared/file-loaded-card';
import LabelBar from '@/components/tools/common/label-bar';

interface GzipDropzoneProps {
  file: File | null;
  isProcessing: boolean;
  onFileSelect: (file: File) => void;
  onClear: () => void;
  onLoadSample: () => void;
}

export default function GzipDropzone({
  file,
  isProcessing,
  onFileSelect,
  onClear,
  onLoadSample,
}: GzipDropzoneProps) {
  return (
    <div>
      <LabelBar
        label="GZIP Archive Input"
        description="Select or drop any .gz, .tgz, or .deflate file. 100% processed locally in your browser memory."
        actions={
          <div className="flex items-center gap-2">
            {!file && (
              <SampleAction
                rounded="lg"
                label="Load Sample (.tar.gz)"
                onClick={onLoadSample}
                successToast={false}
              />
            )}
            {file && (
              <DeleteAction
                variant="ghost"
                bordered
                rounded="lg"
                label="Clear File"
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
            isProcessing
              ? 'Decompressing archive in memory...'
              : 'GZIP file loaded and inspected locally'
          }
          icon={FileArchive}
          accept=".gz,.tgz,.deflate,application/gzip,application/x-gzip"
          onChangeFile={onFileSelect}
          changeButtonLabel="Change GZIP"
        />
      ) : (
        <FilePicker
          icon={FileArchive}
          title="Drag and drop your GZIP file here"
          desc="Or click to browse from device (Supports .gz, .log.gz, .sql.gz, .tgz, and .deflate)"
          accept=".gz,.tgz,.deflate,application/gzip,application/x-gzip"
          onFileChange={onFileSelect}
        />
      )}
    </div>
  );
}
