'use client';

import type { TimeClaimInfo } from './types';

import LabelBar from '@/components/tools/common/label-bar';
import TimeClaimRow from './time-claim-row';

type TimeClaimsCardProps = {
  timeClaims: TimeClaimInfo[];
};

export default function TimeClaimsCard({ timeClaims }: TimeClaimsCardProps) {
  if (timeClaims.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col">
      <LabelBar
        label="Time Claims (exp / iat / nbf)"
        description="Standard time-based claims converted to human-readable local time and expiration countdowns."
      />

      <div className="shadow-xs divide-y divide-neutral-200/60 overflow-hidden rounded-xl border border-neutral-200/80 bg-white/70 backdrop-blur-md dark:divide-neutral-800/60 dark:border-neutral-800 dark:bg-neutral-900/60">
        {timeClaims.map((claim) => (
          <TimeClaimRow key={claim.claim} claimInfo={claim} />
        ))}
      </div>
    </div>
  );
}
