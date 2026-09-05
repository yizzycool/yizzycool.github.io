import type { ActionButtonProps } from '@/types/common/action-button';

export interface CopyActionProps extends ActionButtonProps {
  content?: string | Blob | null;
}
