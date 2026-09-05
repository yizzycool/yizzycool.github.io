import type { LucideIcon } from 'lucide-react';

export type FilePickerProps = {
  icon?: LucideIcon;
  title?: string;
  desc?: string;
  showButton?: boolean;
  buttonIcon?: LucideIcon;
  buttonText?: string;
  accept?: string;
  multiple?: boolean;
  onFileChange?: (file: File) => void;
  onFilesChange?: (files: FileList) => void;
};
