'use client';

import type { DownloadActionProps } from './types';

import { Download } from 'lucide-react';

import { useDisplay } from '../hooks/use-display';
import { Button } from '@/components/ui/button';

export function DownloadAction({
  display = 'icon-label',
  variant = 'outline',
  size = 'xs',
  rounded,
  bordered,
  className,
  disabled = false,
  blob,
  imageUrl,
  filename = 'download',
  label = 'Download',
  ariaLabel,
  title,
}: DownloadActionProps) {
  const { showIcon, showLabel } = useDisplay({ display });

  const download = (b: Blob) => {
    const url = URL.createObjectURL(b);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const onDownloadClick = async () => {
    if (disabled) return;

    if (blob) {
      download(blob);
    } else if (imageUrl) {
      const response = await fetch(imageUrl);
      const fetchedBlob = await response.blob();
      download(fetchedBlob);
    }
  };

  return (
    <Button
      onClick={onDownloadClick}
      variant={variant}
      size={size}
      rounded={rounded}
      bordered={bordered}
      className={className}
      icon={showIcon ? Download : undefined}
      disabled={disabled}
      ariaLabel={ariaLabel}
      title={title}
    >
      {showLabel ? label : null}
    </Button>
  );
}
