'use client';

import type { KeyboardEvent } from 'react';
import type { CurrencyCode, ExpenseMember, SplitType } from './types';

import { Plus, Receipt } from 'lucide-react';

import ExecuteBar from '@/components/tools/common/execute-bar';
import {
  InsetGroup,
  InsetGroupRow,
} from '@/components/tools/common/inset-group';
import LabelBar from '@/components/tools/common/label-bar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ErrorMessage } from '@/components/ui/error-message';
import { Input } from '@/components/ui/input';
import { Selector } from '@/components/ui/selector';
import { PillTabs } from '@/components/ui/tabs';

import { SPLIT_TYPE_LABELS, SPLIT_TYPE_TABS } from './constants';
import ExactSplitInputItem from './exact-split-input-item';
import ParticipantChipItem from './participant-chip-item';
import { formatCurrency } from './utils/settlement-engine';

type Props = {
  titleInputRef: React.RefObject<HTMLInputElement | null>;
  currency: CurrencyCode;
  currencySymbol: string;
  members: ExpenseMember[];
  expenseTitle: string;
  expenseAmount: string;
  paidById: string;
  splitType: SplitType;
  selectedParticipantIds: string[];
  exactAmounts: Record<string, string>;
  exactRemainder: number;
  parsedExpenseAmount: number;
  expenseError: string | null;
  onExpenseTitleChange: (value: string) => void;
  onExpenseAmountChange: (value: string) => void;
  onPaidByChange: (value: string) => void;
  onSplitTypeChange: (type: SplitType) => void;
  onToggleParticipant: (memberId: string) => void;
  onSelectAllParticipants: () => void;
  onExactAmountChange: (memberId: string, value: string) => void;
  onFillExactRemainder: (memberId: string) => void;
  onAddExpense: () => void;
};

export default function ExpenseFormSection({
  titleInputRef,
  currency,
  currencySymbol,
  members,
  expenseTitle,
  expenseAmount,
  paidById,
  splitType,
  selectedParticipantIds,
  exactAmounts,
  exactRemainder,
  parsedExpenseAmount,
  expenseError,
  onExpenseTitleChange,
  onExpenseAmountChange,
  onPaidByChange,
  onSplitTypeChange,
  onToggleParticipant,
  onSelectAllParticipants,
  onExactAmountChange,
  onFillExactRemainder,
  onAddExpense,
}: Props) {
  const payerOptions = members.map((member) => ({
    label: member.name,
    value: member.id,
  }));

  const perPersonShare =
    parsedExpenseAmount > 0 && selectedParticipantIds.length > 0
      ? parsedExpenseAmount / selectedParticipantIds.length
      : 0;

  const isExactBalanced =
    parsedExpenseAmount > 0 && Math.abs(exactRemainder) <= 0.01;

  const handleAmountKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onAddExpense();
    }
  };

  return (
    <div>
      <LabelBar
        icon={Receipt}
        label="Add Expense"
        description="Record who paid and select whether to split equally or by exact amounts."
      />

      <InsetGroup rounded="2xl">
        {/* Row 1: Title, Amount, Payer */}
        <InsetGroupRow hoverable={false}>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-12">
            <div className="sm:col-span-5">
              <Input
                ref={titleInputRef}
                id="expense-item-title"
                title="Description"
                value={expenseTitle}
                onChange={(e) => onExpenseTitleChange(e.target.value)}
                onClear={() => onExpenseTitleChange('')}
                placeholder="e.g. Dinner, Taxi, Hotel..."
              />
            </div>

            <div className="sm:col-span-4">
              <Input
                id="expense-item-amount"
                title={`Amount (${currencySymbol})`}
                type="number"
                inputMode="decimal"
                value={expenseAmount}
                onChange={(e) => onExpenseAmountChange(e.target.value)}
                onKeyDown={handleAmountKeyDown}
                onClear={() => onExpenseAmountChange('')}
                placeholder="0"
                className="font-mono"
              />
            </div>

            <div className="sm:col-span-3">
              <Selector
                title="Paid By"
                value={paidById}
                options={payerOptions}
                placeholder={
                  members.length === 0 ? 'Add members first' : 'Select payer'
                }
                disabled={members.length === 0}
                onChange={onPaidByChange}
              />
            </div>
          </div>
        </InsetGroupRow>

        {/* Row 2: Split Mode & Participant Breakdown */}
        <InsetGroupRow hoverable={false}>
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <PillTabs<SplitType>
                tabs={SPLIT_TYPE_TABS}
                activeTab={splitType}
                tabLabels={SPLIT_TYPE_LABELS}
                onChange={onSplitTypeChange}
                size="xs"
                variant="segment"
              />

              {splitType === 'equal' ? (
                <div className="flex items-center gap-2">
                  {perPersonShare > 0 && (
                    <Badge variant="primary" size="xs" className="font-mono">
                      {formatCurrency(perPersonShare, currency, currencySymbol)}{' '}
                      / person
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="xs"
                    rounded="lg"
                    onClick={onSelectAllParticipants}
                    disabled={
                      members.length === 0 ||
                      selectedParticipantIds.length === members.length
                    }
                  >
                    Select All
                  </Button>
                </div>
              ) : (
                <Badge
                  variant={
                    parsedExpenseAmount === 0
                      ? 'neutral'
                      : isExactBalanced
                        ? 'success'
                        : 'amber'
                  }
                  size="xs"
                  className="font-mono"
                >
                  {parsedExpenseAmount === 0
                    ? 'Enter total amount'
                    : isExactBalanced
                      ? 'Balanced ✓'
                      : exactRemainder > 0
                        ? `Remaining: ${formatCurrency(exactRemainder, currency, currencySymbol)}`
                        : `Over by: ${formatCurrency(Math.abs(exactRemainder), currency, currencySymbol)}`}
                </Badge>
              )}
            </div>

            {members.length === 0 ? (
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Add at least 2 members above to assign participants.
              </p>
            ) : splitType === 'equal' ? (
              <div className="flex flex-wrap items-center gap-2">
                {members.map((member) => (
                  <ParticipantChipItem
                    key={member.id}
                    member={member}
                    selected={selectedParticipantIds.includes(member.id)}
                    onToggle={onToggleParticipant}
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {members.map((member) => (
                  <ExactSplitInputItem
                    key={member.id}
                    member={member}
                    currencySymbol={currencySymbol}
                    value={exactAmounts[member.id] || ''}
                    canFillRemainder={parsedExpenseAmount > 0}
                    onChange={onExactAmountChange}
                    onFillRemainder={onFillExactRemainder}
                  />
                ))}
              </div>
            )}

            <ErrorMessage message={expenseError} />
          </div>
        </InsetGroupRow>
      </InsetGroup>

      <ExecuteBar
        label="Add Expense"
        icon={Plus}
        onClick={onAddExpense}
        showCharCount={false}
        disabled={members.length < 2 || !expenseAmount.trim()}
      />
    </div>
  );
}
