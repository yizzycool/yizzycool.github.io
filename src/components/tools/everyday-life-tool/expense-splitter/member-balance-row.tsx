'use client';

import type { CurrencyCode, MemberBalance } from './types';

import { PropertyRow } from '@/components/tools/common/property-row';

import { formatCurrency } from './utils/settlement-engine';

type Props = {
  balance: MemberBalance;
  currency: CurrencyCode;
  currencySymbol: string;
};

export default function MemberBalanceRow({
  balance,
  currency,
  currencySymbol,
}: Props) {
  const isCreditor = balance.netBalance >= 0.01;
  const isDebtor = balance.netBalance <= -0.01;

  const badgeText = isCreditor ? 'Receives' : isDebtor ? 'Owes' : 'Settled';

  const badgeVariant = isCreditor ? 'success' : isDebtor ? 'error' : 'neutral';

  const formattedNet = isCreditor
    ? `+${formatCurrency(balance.netBalance, currency, currencySymbol)}`
    : formatCurrency(balance.netBalance, currency, currencySymbol);

  const subText = `Paid ${formatCurrency(balance.totalPaid, currency, currencySymbol)} · Share ${formatCurrency(balance.totalShare, currency, currencySymbol)}`;

  return (
    <PropertyRow
      grouped
      hoverAction
      label={balance.memberName}
      badge={badgeText}
      badgeVariant={badgeVariant}
      value={formattedNet}
      valueClassName={
        isCreditor
          ? 'text-emerald-600 dark:text-emerald-400'
          : isDebtor
            ? 'text-rose-600 dark:text-rose-400'
            : 'text-slate-500 dark:text-slate-400'
      }
      subText={subText}
      copySuccessToast={`Copied ${balance.memberName}'s net balance`}
    />
  );
}
