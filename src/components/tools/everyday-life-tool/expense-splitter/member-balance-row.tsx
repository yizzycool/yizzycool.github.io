'use client';

import type { CurrencyCode, MemberBalance } from './types';

import { PropertyRow } from '@/components/tools/common/property-row';

import { formatCurrency } from './utils/settlement-engine';

type Props = {
  balance: MemberBalance;
  currency: CurrencyCode;
  currencySymbol: string;
  maxAbsBalance?: number;
};

export default function MemberBalanceRow({
  balance,
  currency,
  currencySymbol,
  maxAbsBalance = 0,
}: Props) {
  const isCreditor = balance.netBalance >= 0.01;
  const isDebtor = balance.netBalance <= -0.01;

  const badgeText = isCreditor ? 'Receives' : isDebtor ? 'Owes' : 'Settled';

  const badgeVariant = isCreditor ? 'success' : isDebtor ? 'error' : 'neutral';

  const formattedNet = isCreditor
    ? `+${formatCurrency(balance.netBalance, currency, currencySymbol)}`
    : formatCurrency(balance.netBalance, currency, currencySymbol);

  const subText = `Paid ${formatCurrency(balance.totalPaid, currency, currencySymbol)} · Share ${formatCurrency(balance.totalShare, currency, currencySymbol)}`;

  const barRatio =
    maxAbsBalance > 0
      ? Math.min(
          100,
          Math.round((Math.abs(balance.netBalance) / maxAbsBalance) * 100)
        )
      : 0;

  return (
    <div>
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

      {maxAbsBalance > 0 && (
        <div aria-hidden="true" className="-mt-1 px-4 pb-2.5">
          <div className="relative grid h-1.5 grid-cols-2 gap-0.5 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800/80">
            {/* Left Half: Debtor (Owes) growing outward from center */}
            <div className="flex justify-end">
              {isDebtor && (
                <div
                  className="h-full rounded-l-full bg-rose-500/80 transition-all duration-300 dark:bg-rose-400/80"
                  style={{ width: `${barRatio}%` }}
                />
              )}
            </div>

            {/* Right Half: Creditor (Receives) growing outward from center */}
            <div className="flex justify-start">
              {isCreditor && (
                <div
                  className="h-full rounded-r-full bg-emerald-500/80 transition-all duration-300 dark:bg-emerald-400/80"
                  style={{ width: `${barRatio}%` }}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
