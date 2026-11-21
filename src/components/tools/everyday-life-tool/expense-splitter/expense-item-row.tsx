'use client';

import type { CurrencyCode, ExpenseRecord } from './types';

import { Trash2 } from 'lucide-react';

import { PropertyRow } from '@/components/tools/common/property-row';
import { Button } from '@/components/ui/button';

import { formatCurrency } from './utils/settlement-engine';

type Props = {
  expense: ExpenseRecord;
  currency: CurrencyCode;
  currencySymbol: string;
  memberNameMap: Map<string, string>;
  totalMembersCount: number;
  onRemove: (id: string) => void;
};

export default function ExpenseItemRow({
  expense,
  currency,
  currencySymbol,
  memberNameMap,
  totalMembersCount,
  onRemove,
}: Props) {
  const payerName = memberNameMap.get(expense.paidById) || 'Unknown';
  const formattedTotal = formatCurrency(
    expense.amount,
    currency,
    currencySymbol
  );

  const buildSplitSubText = (): string => {
    if (expense.splitType === 'exact') {
      const entries = Object.entries(expense.exactAmounts)
        .filter(([, amt]) => amt > 0)
        .map(
          ([id, amt]) =>
            `${memberNameMap.get(id) || 'Member'}: ${formatCurrency(amt, currency, currencySymbol)}`
        );
      return `Exact split · ${entries.join(', ')}`;
    }

    const participantNames = expense.participantIds
      .map((id) => memberNameMap.get(id))
      .filter((name): name is string => Boolean(name));

    const perPerson =
      participantNames.length > 0
        ? formatCurrency(
            expense.amount / participantNames.length,
            currency,
            currencySymbol
          )
        : formatCurrency(0, currency, currencySymbol);

    if (participantNames.length === totalMembersCount) {
      return `Split equally among all ${participantNames.length} (${perPerson} / person)`;
    }

    return `Split equally among ${participantNames.join(', ')} (${perPerson} / person)`;
  };

  return (
    <PropertyRow
      grouped
      label={expense.title}
      badge={`Paid by ${payerName}`}
      badgeVariant="primary"
      value={formattedTotal}
      subText={buildSplitSubText()}
      action={
        <Button
          variant="ghost"
          size="xs"
          rounded="lg"
          icon={Trash2}
          ariaLabel={`Remove ${expense.title}`}
          title={`Remove ${expense.title}`}
          onClick={() => onRemove(expense.id)}
          className="text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:text-slate-500 dark:hover:bg-rose-950/40 dark:hover:text-rose-400"
        />
      }
    />
  );
}
