import type { ActionButtonDisplay } from '@/types/common/action-button';

export function useDisplay({ display }: { display: ActionButtonDisplay }) {
  const showIcon = ['icon', 'icon-label'].includes(display);
  const showLabel = ['icon-label', 'label'].includes(display);

  return {
    showIcon,
    showLabel,
  };
}

export default useDisplay;
