'use client';

import Badge from '@/components/common/badge';
import clsx from 'clsx';
import _isNull from 'lodash/isNull';

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
            _isNull(isSystemReady)
              ? 'bg-gray-500'
              : isSystemReady
                ? 'bg-green-500'
                : 'bg-red-400'
          )}
        ></span>
        <div
          className={clsx(
            !_isNull(isSystemReady) && !isSystemReady && 'text-red-400'
          )}
        >
          {_isNull(isSystemReady)
            ? 'Checking...'
            : isSystemReady
              ? 'System Ready'
              : 'System Crashed'}
        </div>
      </Badge>
    </div>
  );
}
