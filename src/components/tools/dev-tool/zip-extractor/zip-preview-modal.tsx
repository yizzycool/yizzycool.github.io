'use client';

import type { PreviewState, ZipFileEntry } from './types';

import { FilePreviewModal } from '@/components/shared/file-preview-modal';

interface ZipPreviewModalProps {
  preview: PreviewState;
  onClose: () => void;
  onDownload: (entry: ZipFileEntry) => void;
}

export default function ZipPreviewModal({
  preview,
  onClose,
  onDownload,
}: ZipPreviewModalProps) {
  const {
    entry,
    isOpen,
    isLoading,
    isText,
    isImage,
    textContent,
    imageUrl,
    syntaxLanguage,
    error,
  } = preview;

  if (!entry) return null;

  return (
    <FilePreviewModal
      isOpen={isOpen}
      onClose={onClose}
      fileName={entry.name}
      fileSize={entry.size}
      filePath={entry.path}
      extension={entry.extension}
      isLoading={isLoading}
      isText={isText}
      isImage={isImage}
      textContent={textContent}
      imageUrl={imageUrl}
      syntaxLanguage={syntaxLanguage}
      error={error}
      onDownload={() => onDownload(entry)}
    />
  );
}
