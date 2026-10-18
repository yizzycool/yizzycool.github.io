export interface FilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
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
