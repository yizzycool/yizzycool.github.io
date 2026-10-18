import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

export interface FileLoadedCardProps {
  fileName: string;
  fileSize: number;
  description?: ReactNode;
  icon?: LucideIcon;
  iconContainerClassName?: string;
  iconClassName?: string;
  accept?: string;
  onChangeFile?: (file: File) => void;
  changeButtonLabel?: string;
  className?: string;
}
