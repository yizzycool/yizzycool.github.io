'use client';

import type { ActionButtonProps } from '@/types/common/action-button';
import { Download } from 'lucide-react';
import useDisplay from '../hooks/use-display';
import Button from '../../button';

interface Props extends ActionButtonProps {
  blob?: Blob;
  imageUrl?: string;
  filename?: string;
}

export default function DownloadAction({
  display = 'icon-label',
  size = 'xs',
  rounded,
  bordered,
  className,
  disabled = false,
  blob,
  imageUrl,
  filename = 'download',
  label = 'Download',
}: Props) {
  const { showIcon, showLabel } = useDisplay({ display });

  const onDownloadClick = async () => {
    if (disabled) return;

    if (blob) {
      download(blob);
    } else if (imageUrl) {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      download(blob);
    }
  };

  const download = (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Button
      onClick={onDownloadClick}
      variant="primary"
      size={size}
      rounded={rounded}
      bordered={bordered}
      className={className}
      icon={showIcon ? Download : undefined}
      disabled={disabled}
    >
      {showLabel ? label : null}
    </Button>
  );
}
