'use client';

import type {
  HashCaseMode,
  HashEncoding,
  HashResultItem as HashResultItemType,
} from './types';

import { PropertyRow } from '@/components/tools/common/property-row';
import { cn } from '@/utils/cn';

import { applyCaseMode } from './utils/formatters';

type Props = {
  item: HashResultItemType;
  encoding: HashEncoding;
  caseMode: HashCaseMode;
  isMatched: boolean;
  isHmac: boolean;
  grouped?: boolean;
};

export default function HashResultItem({
  item,
  encoding,
  caseMode,
  isMatched,
  isHmac,
  grouped = false,
}: Props) {
  const rawValue = encoding === 'hex' ? item.hex : item.base64;
  const displayHash = rawValue ? applyCaseMode(rawValue, caseMode) : '';
  const label = isHmac ? `HMAC-${item.algorithm}` : item.algorithm;

  return (
    <PropertyRow
      label={label}
      badge={isMatched ? '✓ Matched' : `${item.bitLength}-bit`}
      badgeVariant={isMatched ? 'success' : 'neutral'}
      value={displayHash || '---'}
      subText={
        item.error ? (
          <span className="text-rose-500 dark:text-rose-400">{item.error}</span>
        ) : undefined
      }
      grouped={grouped}
      className={cn(
        'transition-all duration-200',
        isMatched && [
          'bg-emerald-500/10 ring-1 ring-inset ring-emerald-500/40',
          'dark:bg-emerald-500/15 dark:ring-emerald-500/50',
        ]
      )}
      valueClassName={cn(
        isMatched && 'text-emerald-700 font-semibold dark:text-emerald-300'
      )}
      copyable={Boolean(displayHash)}
      hoverAction
    />
  );
}
