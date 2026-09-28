'use client';

import type { TokenStatus } from './types';

import { Badge } from '@/components/ui/badge';

type TokenStatusSummaryProps = {
  status: TokenStatus;
  tokenLength: number;
};

export default function TokenStatusSummary({
  status,
  tokenLength,
}: TokenStatusSummaryProps) {
  if (tokenLength === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2 p-3">
      <div className="flex flex-wrap items-center gap-2">
        {/* Token Validity */}
        {status.isValid && (
          <Badge variant="success" size="xs" rounded="md" bordered>
            Valid JWT
          </Badge>
        )}

        {/* Algorithm */}
        {status.isValid && status.algorithm && (
          <Badge variant="neutral" size="xs" rounded="md" bordered>
            Algorithm: {status.algorithm}
          </Badge>
        )}
      </div>

      {/* Error detail message if invalid */}
      {!status.isValid && status.errorMessage && (
        <p className="text-xs font-medium text-rose-600 dark:text-rose-400">
          {status.errorMessage}
        </p>
      )}
    </div>
  );
}
