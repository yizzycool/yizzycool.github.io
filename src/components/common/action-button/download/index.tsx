'use client';

import { ActionButtonProps } from '@/types/common/action-button';
import { Download } from 'lucide-react';
import useDisplay from '../hooks/use-display';
import Button from '../../button';

interface Props extends ActionButtonProps {
  blob?: Blob | null;
  filename?: string;
}

export default function DownloadAction({
  display = 'icon-label',
  size = 'xs',
  disabled = false,
  blob = null,
  filename = 'download',
}: Props) {
  const { showIcon, showLabel } = useDisplay({ display });

  const onDownloadClick = () => {
    if (disabled) return;

    if (blob) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <Button
      onClick={onDownloadClick}
      variant="primary"
      size={size}
      icon={showIcon ? Download : undefined}
      disabled={disabled}
    >
      {showLabel ? 'Download' : null}
    </Button>
  );
}
