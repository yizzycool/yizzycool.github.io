import type { ActionButtonProps } from '@/types/common/action-button';

export interface DownloadActionProps extends ActionButtonProps {
  blob?: Blob | null;
  imageUrl?: string;
  filename?: string;
}
