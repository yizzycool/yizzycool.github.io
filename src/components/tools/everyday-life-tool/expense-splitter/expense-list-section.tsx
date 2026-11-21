'use client';

import type { CurrencyCode, ExpenseMember, ExpenseRecord } from './types';

import { ListOrdered, Receipt } from 'lucide-react';
import { useMemo } from 'react';

import { InsetGroup } from '@/components/tools/common/inset-group';
import LabelBar from '@/components/tools/common/label-bar';
import { Badge } from '@/components/ui/badge';

import ExpenseItemRow from './expense-item-row';
import { formatCurrency } from './utils/settlement-engine';

type Props = {
  expenses: ExpenseRecord[];
  members: ExpenseMember[];
  currency: CurrencyCode;
  currencySymbol: string;
  totalSpending: number;
  onRemoveExpense: (id: string) => void;
};

export default function ExpenseListSection({
  expenses,
  members,
  currency,
  currencySymbol,
  totalSpending,
  onRemoveExpense,
}: Props) {
  const memberNameMap = useMemo(
    () => new Map(members.map((m) => [m.id, m.name])),
    [members]
  );

  return (
    <div>
      <LabelBar
        icon={ListOrdered}
        label={
          <div className="flex items-center gap-2">
            <span>Expense Breakdown</span>
            <Badge variant="neutral" size="xs">
              {expenses.length} {expenses.length === 1 ? 'item' : 'items'}
            </Badge>
          </div>
        }
        actions={
          expenses.length > 0 ? (
            <Badge variant="blue" size="sm" className="font-mono">
              Total: {formatCurrency(totalSpending, currency, currencySymbol)}
            </Badge>
          ) : null
        }
      />

      {expenses.length === 0 ? (
        <InsetGroup rounded="2xl">
          <div className="flex flex-col items-center justify-center gap-2 px-4 py-10 text-center">
            <Receipt size={28} className="text-slate-300 dark:text-slate-600" />
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
              No expenses recorded yet
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Add an expense above to automatically compute optimal settlement
              transfers.
            </p>
          </div>
        </InsetGroup>
      ) : (
        <InsetGroup rounded="2xl">
          {expenses.map((expense) => (
            <ExpenseItemRow
              key={expense.id}
              expense={expense}
              currency={currency}
              currencySymbol={currencySymbol}
              memberNameMap={memberNameMap}
              totalMembersCount={members.length}
              onRemove={onRemoveExpense}
            />
          ))}
        </InsetGroup>
      )}
    </div>
  );
}
