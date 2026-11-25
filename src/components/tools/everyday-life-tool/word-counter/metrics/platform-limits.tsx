'use client';

import { InsetGroup } from '@/components/tools/common/inset-group';

import { PLATFORM_LIMITS } from '../utils/text-analysis';

import { PlatformLimitItem } from './platform-limit-item';

type PlatformLimitsProps = {
  charCount: number;
};

export function PlatformLimits({ charCount }: PlatformLimitsProps) {
  return (
    <InsetGroup rounded="xl">
      {PLATFORM_LIMITS.map((limit) => (
        <PlatformLimitItem
          key={limit.id}
          limit={limit}
          currentCount={charCount}
        />
      ))}
    </InsetGroup>
  );
}
