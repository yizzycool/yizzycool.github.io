'use client';

import clsx from 'clsx';
import { LoaderCircle, QrCode } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';

type Props = {
  qrCodeUrl: string;
  inputText: string;
};

export default function Preview({ qrCodeUrl, inputText }: Props) {
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (!inputText) return;
    setIsGenerating(true);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qrCodeUrl]);

  return (
    <div
      className={clsx(
        'group relative mx-auto w-fit p-6',
        'overflow-hidden rounded-2xl',
        'border border-neutral-200 dark:border-neutral-700'
      )}
    >
      <div
        className={clsx(
          'absolute -inset-4 z-10 backdrop-blur-sm',
          'pointer-events-none bg-neutral-100/50 dark:bg-neutral-800/50',
          'transition-opacity duration-300',
          'flex items-center justify-center',
          isGenerating ? 'opacity-100' : 'opacity-0'
        )}
      >
        <LoaderCircle className="animate-spin" size={50} />
      </div>

      <div
        className={clsx(
          'relative',
          'transition-transform duration-500 hover:scale-[1.02] dark:border-neutral-800'
        )}
      >
        {/* QR Display */}
        {!!inputText ? (
          <Image
            width={220}
            height={220}
            src={qrCodeUrl}
            onLoad={() => setIsGenerating(false)}
            className="aspect-square h-auto w-full object-contain"
            alt="Generated QR Code"
            style={{ width: '220px', height: '220px' }}
          />
        ) : (
          <QrCode size={220} />
        )}
      </div>
    </div>
  );
}
