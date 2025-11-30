import { ActionButtonDisplay } from '@/types/common/action-button';

export default function useDisplay({
  display,
}: {
  display: ActionButtonDisplay;
}) {
  const showIcon = ['icon', 'icon-label'].includes(display);
  const showLabel = ['icon-label', 'label'].includes(display);

  return {
    showIcon,
    showLabel,
  };
}
