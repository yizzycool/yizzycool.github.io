'use client';

import type { SocialIconsProps } from './types';

import useGetTransitionClass from '@/hooks/animation/use-get-transition-class';
import { cn } from '@/utils/cn';
import { SocialIcon } from '@/components/ui/social-icon';
import { socialHrefMap, socialIconMap } from './constants';
import { socialIconsBaseStyles } from './social-icons.variants';

export function SocialIcons({
  types = [],
  transition = false,
  delay = 'animate-delay-0',
  className = '',
  iconSize = 20,
}: SocialIconsProps) {
  const { getFadeUpClass } = useGetTransitionClass();

  return (
    <div
      className={cn(
        socialIconsBaseStyles,
        transition && getFadeUpClass(delay),
        className
      )}
    >
      {types.map((type) => (
        <SocialIcon
          key={type}
          icon={socialIconMap[type]}
          href={socialHrefMap[type]}
          size={iconSize}
        />
      ))}
    </div>
  );
}
