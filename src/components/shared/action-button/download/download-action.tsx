'use client';

import type { DownloadActionProps } from './types';

import { Download } from 'lucide-react';

import toast from '@/utils/toast';

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
  successToast = true,
  errorToast = true,
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

    try {
      if (blob) {
        download(blob);
      } else if (imageUrl) {
        const response = await fetch(imageUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.statusText}`);
        }
        const fetchedBlob = await response.blob();
        download(fetchedBlob);
      } else {
        return;
      }

      if (successToast) {
        const msg =
          typeof successToast === 'string'
            ? successToast
            : `Downloaded ${filename}`;
        toast.success(msg);
      }
    } catch (e) {
      console.error('Download failed:', e);
      if (errorToast) {
        const msg =
          typeof errorToast === 'string'
            ? errorToast
            : 'Failed to download file';
        toast.error(msg);
      }
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
