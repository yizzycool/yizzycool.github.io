'use client';

import type { SocialIconProps } from './types';

import { cn } from '@/utils/cn';
import { socialIconBaseStyles } from './social-icon.variants';

export function SocialIcon({
  icon: Icon,
  href = '',
  size = 20,
}: SocialIconProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(socialIconBaseStyles)}
    >
      <Icon size={size} />
    </a>
  );
}
