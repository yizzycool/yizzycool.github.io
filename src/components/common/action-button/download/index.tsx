'use client';

import clsx from 'clsx';
import { Download } from 'lucide-react';

export default function DownloadAction({
  disabled = false,
  blob = null,
  size = 12,
  filename = 'download',
}: {
  disabled?: boolean;
  blob?: Blob | null;
  size?: number;
  filename?: string;
}) {
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
    <button
      onClick={onDownloadClick}
      className={clsx(
        'flex items-center gap-1 rounded px-2 py-1 text-xs transition',
        'border border-neutral-900 dark:border-neutral-100',
        'bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200',
        'text-white dark:text-neutral-900',
        disabled && 'pointer-events-none opacity-50'
      )}
    >
      <Download size={size} /> Download
    </button>
  );
}
