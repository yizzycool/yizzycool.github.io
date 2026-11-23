export interface FilePreviewContentProps {
  fileName: string;
  fileSize: number;
  filePath?: string;
  extension?: string;
  isLoading?: boolean;
  isText?: boolean;
  isImage?: boolean;
  textContent?: string | null;
  imageUrl?: string | null;
  syntaxLanguage?: string;
  error?: string | null;
  onDownload?: () => void;
  downloadButtonLabel?: string;
}

export interface FilePreviewModalProps extends FilePreviewContentProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface FilePreviewPaneProps extends FilePreviewContentProps {
  onExpandModal?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
  className?: string;
}
