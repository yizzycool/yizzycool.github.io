import type { ActionButtonProps } from '@/types/common/action-button';

export interface SpeakActionProps extends ActionButtonProps {
  content: string;
  lang?: string;
  rate?: number;
}
