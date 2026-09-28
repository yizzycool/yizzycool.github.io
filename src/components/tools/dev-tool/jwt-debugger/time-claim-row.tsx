'use client';

import type { TimeClaimInfo } from './types';

import { Clock, Globe } from 'lucide-react';

import { CopyAction } from '@/components/shared/action-button';
import { Badge } from '@/components/ui/badge';

type TimeClaimRowProps = {
  claimInfo: TimeClaimInfo;
};

const CLAIM_TITLES: Record<TimeClaimInfo['claim'], string> = {
  exp: 'Expiration Time',
  iat: 'Issued At',
  nbf: 'Not Before',
};

const CLAIM_BADGE_VARIANTS: Record<
  TimeClaimInfo['claim'],
  'blue' | 'purple' | 'amber'
> = {
  exp: 'blue',
  iat: 'purple',
  nbf: 'amber',
};

export default function TimeClaimRow({ claimInfo }: TimeClaimRowProps) {
  const isExp = claimInfo.claim === 'exp';
  const title = CLAIM_TITLES[claimInfo.claim] ?? claimInfo.label;
  const claimTagVariant = CLAIM_BADGE_VARIANTS[claimInfo.claim] ?? 'neutral';

  return (
    <div className="flex flex-col gap-2.5 p-3.5 transition-colors hover:bg-neutral-50/70 sm:p-4 dark:hover:bg-neutral-800/40">
      {/* Top Header: Claim Tag + Full Name + Status / Relative Badge */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Badge
            variant={claimTagVariant}
            size="xs"
            rounded="md"
            bordered
            className="font-mono font-bold uppercase tracking-wider"
          >
            {claimInfo.claim}
          </Badge>
          <span className="text-xs font-semibold text-neutral-800 sm:text-sm dark:text-neutral-200">
            {title}
          </span>
        </div>

        {/* Status / Relative Badge */}
        {isExp ? (
          <Badge
            variant={claimInfo.isExpired ? 'error' : 'success'}
            size="xs"
            rounded="full"
            bordered
            className="font-medium"
          >
            {claimInfo.isExpired ? 'Expired' : 'Active'} (
            {claimInfo.relativeTime})
          </Badge>
        ) : (
          <Badge
            variant="neutral"
            size="xs"
            rounded="full"
            bordered
            className="font-medium text-neutral-600 dark:text-neutral-400"
          >
            {claimInfo.relativeTime}
          </Badge>
        )}
      </div>

      {/* Middle Content: Formatted Time Grid (Local Time vs UTC) */}
      <div className="grid grid-cols-1 gap-2 rounded-lg bg-neutral-100/70 p-2.5 sm:grid-cols-2 dark:bg-neutral-800/50">
        {/* Local Time */}
        <div className="flex items-center gap-2 text-xs">
          <Clock className="h-3.5 w-3.5 shrink-0 text-neutral-400 dark:text-neutral-500" />
          <span className="shrink-0 text-neutral-500 dark:text-neutral-400">
            Local:
          </span>
          <span className="truncate font-mono text-neutral-800 dark:text-neutral-200">
            {claimInfo.formattedLocal}
          </span>
        </div>

        {/* UTC Time */}
        <div className="flex items-center gap-2 text-xs">
          <Globe className="h-3.5 w-3.5 shrink-0 text-neutral-400 dark:text-neutral-500" />
          <span className="shrink-0 text-neutral-500 dark:text-neutral-400">
            UTC:
          </span>
          <span className="truncate font-mono text-neutral-800 dark:text-neutral-200">
            {claimInfo.formattedUtc}
          </span>
        </div>
      </div>

      {/* Footer: Raw Timestamp and Quick Copy */}
      <div className="flex items-center justify-between text-[11px] text-neutral-400 dark:text-neutral-500">
        <span className="font-mono">
          Epoch:{' '}
          <span className="text-neutral-700 dark:text-neutral-300">
            {claimInfo.timestamp}
          </span>
        </span>
        <CopyAction
          display="icon-label"
          variant="ghost"
          size="xs"
          label="Copy Epoch"
          content={String(claimInfo.timestamp)}
          successToast={`${claimInfo.claim} timestamp copied!`}
          className="h-6 px-1.5 text-[11px]"
        />
      </div>
    </div>
  );
}
