import type { LucideIcon } from 'lucide-react';

/**
 * Props for the FilePicker drag & drop file upload component.
 */
export type FilePickerProps = {
  /** Main icon displayed in the drop zone */
  icon?: LucideIcon;
  /** Primary title text */
  title?: string;
  /** Helper / hint description text */
  desc?: string;
  /** Whether to render a browse files action button */
  showButton?: boolean;
  /** Icon for the browse files button */
  buttonIcon?: LucideIcon;
  /** Label text for the browse files button */
  buttonText?: string;
  /** Allowed MIME types or extensions (e.g. 'image/*', '.png') */
  accept?: string;
  /** Whether multiple file selection is permitted */
  multiple?: boolean;
  /** Callback fired when a single file is chosen or dropped */
  onFileChange?: (file: File) => void;
  /** Callback fired when multiple files are chosen or dropped */
  onFilesChange?: (files: FileList) => void;
};
