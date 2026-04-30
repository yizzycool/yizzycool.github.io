'use client';

import clsx from 'clsx';
import { isNull } from 'lodash';

import Badge from '@/components/common/badge';

type Props = {
  isSystemReady: boolean | null;
};

export default function SystemStatus({ isSystemReady }: Props) {
  return (
    <div className="flex items-center justify-end">
      <Badge bordered>
        <span
          className={clsx(
            'mr-2 h-2 w-2 animate-pulse rounded-full',
            isNull(isSystemReady)
              ? 'bg-gray-500'
              : isSystemReady
                ? 'bg-green-500'
                : 'bg-red-400'
          )}
        ></span>
        <div
          className={clsx(
            !isNull(isSystemReady) && !isSystemReady && 'text-red-400'
          )}
        >
          {isNull(isSystemReady)
            ? 'Checking...'
            : isSystemReady
              ? 'System Ready'
              : 'System Crashed'}
        </div>
      </Badge>
    </div>
  );
}
