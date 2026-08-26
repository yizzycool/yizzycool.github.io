'use client';

import Image from 'next/image';

import { cn } from '@/utils/cn';

type DefaultColor = 'yellow' | 'violet' | 'blue' | 'green' | 'red';

type Props = {
  color?: DefaultColor;
  linkClassName?: string;
  imageClassName?: string;
};

export default function BuyMeACoffee({
  color = 'blue',
  linkClassName,
  imageClassName,
}: Props) {
  return (
    <a
      href="https://www.buymeacoffee.com/yizzypeasy"
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'block opacity-70 transition-opacity duration-300 hover:opacity-100',
        linkClassName
      )}
    >
      <Image
        loading="lazy"
        src={`https://cdn.buymeacoffee.com/buttons/v2/default-${color}.png`}
        alt="Buy Me a Coffee"
        className={cn('block', imageClassName)}
        width={545}
        height={153}
      />
    </a>
  );
}
