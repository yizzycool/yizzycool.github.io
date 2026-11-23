'use client';

import type { FilePreviewModalProps } from './types';

import { Download } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BaseDialog, DialogHeader } from '@/components/ui/dialog';
import {
  formatFileSize,
  getExtension,
  getFileIconConfig,
} from '@/utils/file-utils';

import { FilePreviewBody } from './file-preview-body';

export function FilePreviewModal({
  isOpen,
  onClose,
  fileName,
  fileSize,
  filePath,
  extension,
  isLoading = false,
  isText = false,
  isImage = false,
  textContent = null,
  imageUrl = null,
  syntaxLanguage = 'text',
  error = null,
  onDownload,
  downloadButtonLabel = 'Download',
}: FilePreviewModalProps) {
  if (!fileName) return null;

  const ext = extension || getExtension(fileName);
  const iconConfig = getFileIconConfig(ext, false, false);
  const IconComponent = iconConfig.icon;

  return (
    <BaseDialog
      isOpen={isOpen}
      onClose={onClose}
      dialogClassName="flex max-h-[88vh] w-full max-w-4xl flex-col"
    >
      <DialogHeader
        icon={IconComponent}
        title={fileName}
        description={filePath || fileName}
        onClose={onClose}
        closeAriaLabel="Close file preview modal"
        className="mx-6 pt-6"
      >
        <div className="flex items-center gap-2">
          <Badge variant="primary" size="xs" rounded="md" bordered>
            {formatFileSize(fileSize)}
          </Badge>
          {onDownload && (
            <Button
              variant="outline"
              size="xs"
              rounded="lg"
              icon={Download}
              onClick={onDownload}
            >
              {downloadButtonLabel}
            </Button>
          )}
        </div>
      </DialogHeader>

      <div className="flex-1 overflow-y-auto p-6 pt-3 text-left">
        <FilePreviewBody
          fileName={fileName}
          fileSize={fileSize}
          isLoading={isLoading}
          isText={isText}
          isImage={isImage}
          textContent={textContent}
          imageUrl={imageUrl}
          syntaxLanguage={syntaxLanguage}
          error={error}
          onDownload={onDownload}
        />
      </div>
    </BaseDialog>
  );
}
