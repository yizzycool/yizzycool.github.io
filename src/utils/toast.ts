import type { LucideIcon } from 'lucide-react';
import type { ButtonVariant } from '@/types/common/button';

import customEventUtils, { CustomEvents } from '@/utils/custom-event-utils';

export type ToastOptions = {
  variant?: ButtonVariant;
  timeout?: number;
  icon?: LucideIcon;
  showCloseIcon?: boolean;
};

export type ToastEventDetail = {
  content: string;
} & ToastOptions;

export function toast(content: string, options?: ToastOptions) {
  customEventUtils.emit(CustomEvents.common.triggerSnackbar, {
    content,
    ...options,
  });
}

toast.success = (content: string, options?: Omit<ToastOptions, 'variant'>) => {
  toast(content, { ...options, variant: 'success' });
};

toast.error = (content: string, options?: Omit<ToastOptions, 'variant'>) => {
  toast(content, { ...options, variant: 'error' });
};

toast.warning = (content: string, options?: Omit<ToastOptions, 'variant'>) => {
  toast(content, { ...options, variant: 'amber' });
};

toast.info = (content: string, options?: Omit<ToastOptions, 'variant'>) => {
  toast(content, { ...options, variant: 'primary' });
};

toast.clear = () => {
  customEventUtils.emit(CustomEvents.common.clearSnackbar);
};

export default toast;
