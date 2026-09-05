'use client';

import type { GlimmerBackgroundProps } from './types';

import { values } from 'lodash';

import { cn } from '@/utils/cn';
import {
  glimmerBackgroundContainerStyles,
  glimmerItemBaseStyles,
} from './glimmer-background.variants';

export function GlimmerBackground({ configs = [{}] }: GlimmerBackgroundProps) {
  return (
    <div className={glimmerBackgroundContainerStyles} aria-hidden>
      {configs.map((config, idx) => (
        <div
          key={idx}
          className={cn(glimmerItemBaseStyles, ...values(config))}
        />
      ))}
    </div>
  );
}
