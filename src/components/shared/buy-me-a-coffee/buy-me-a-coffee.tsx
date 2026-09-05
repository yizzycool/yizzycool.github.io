'use client';

import type { BuyMeACoffeeProps } from './types';

import Image from 'next/image';

import { cn } from '@/utils/cn';
import {
  buyMeACoffeeImageBaseStyles,
  buyMeACoffeeLinkBaseStyles,
} from './buy-me-a-coffee.variants';

export function BuyMeACoffee({
  color = 'blue',
  linkClassName,
  imageClassName,
}: BuyMeACoffeeProps) {
  return (
    <a
      href="https://www.buymeacoffee.com/yizzypeasy"
      target="_blank"
      rel="noopener noreferrer"
      className={cn(buyMeACoffeeLinkBaseStyles, linkClassName)}
    >
      <Image
        loading="lazy"
        src={`https://cdn.buymeacoffee.com/buttons/v2/default-${color}.png`}
        alt="Buy Me a Coffee"
        className={cn(buyMeACoffeeImageBaseStyles, imageClassName)}
        width={545}
        height={153}
      />
    </a>
  );
}
