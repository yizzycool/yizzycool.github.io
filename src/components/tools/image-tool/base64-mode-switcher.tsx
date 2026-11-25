'use client';

import Link from 'next/link';
import { ArrowRightLeft, FileImage, Image as ImageIcon } from 'lucide-react';

import { ToolKeys, ToolUrls } from '@/data/tools';
import { cn } from '@/utils/cn';

type Props = {
  active: 'image-to-base64' | 'base64-to-image';
};

/**
 * Bidirectional mode switcher connecting Image to Base64 and Base64 to Image.
 */
export default function Base64ModeSwitcher({ active }: Props) {
  const imageToBase64Url =
    ToolUrls[ToolKeys.imageToBase64] || '/tools/image-tool/image-to-base64';
  const base64ToImageUrl =
    ToolUrls[ToolKeys.base64ToImage] || '/tools/image-tool/base64-to-image';

  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div className="shadow-2xs inline-flex items-center gap-1 rounded-xl border border-neutral-200/80 bg-white/75 p-1 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-900/50">
        <Link
          href={imageToBase64Url}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors',
            active === 'image-to-base64'
              ? 'shadow-2xs bg-sky-500 text-white'
              : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800'
          )}
        >
          <ImageIcon className="h-3.5 w-3.5" />
          <span>Image → Base64</span>
        </Link>

        <Link
          href={base64ToImageUrl}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors',
            active === 'base64-to-image'
              ? 'shadow-2xs bg-sky-500 text-white'
              : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800'
          )}
        >
          <FileImage className="h-3.5 w-3.5" />
          <span>Base64 → Image</span>
        </Link>
      </div>

      <span className="hidden items-center gap-1.5 text-xs text-neutral-400 sm:inline-flex dark:text-neutral-500">
        <ArrowRightLeft className="h-3.5 w-3.5" />
        <span>Instant Bidirectional Switch</span>
      </span>
    </div>
  );
}
