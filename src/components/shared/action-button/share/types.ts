import type { ActionButtonProps } from '@/types/common/action-button';

export interface ShareActionProps extends ActionButtonProps {
  content?: string | File | null;
  shareTitle?: string;
  shareText?: string;
}
