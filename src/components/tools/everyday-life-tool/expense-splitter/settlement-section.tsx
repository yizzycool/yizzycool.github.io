'use client';

import type { CurrencyCode, SettlementSummary } from './types';

import {
  ArrowLeftRight,
  CheckCircle2,
  MessageSquareShare,
  ReceiptText,
  Scale,
} from 'lucide-react';

import { InsetGroup } from '@/components/tools/common/inset-group';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';

import MemberBalanceRow from './member-balance-row';
import SettlementTransferRow from './settlement-transfer-row';
import { formatCurrency } from './utils/settlement-engine';

type Props = {
  eventName?: string;
  memberCount?: number;
  expenseCount?: number;
  summary: SettlementSummary;
  currency: CurrencyCode;
  currencySymbol: string;
  hasExpenses: boolean;
  onOpenShareModal: () => void;
};

export default function SettlementSection({
  eventName,
  memberCount = 0,
  expenseCount = 0,
  summary,
  currency,
  currencySymbol,
  hasExpenses,
  onOpenShareModal,
}: Props) {
  const savedTransfersCount = Math.max(
    0,
    summary.rawPairwiseCount - summary.transfers.length
  );

  const perPersonAvg =
    memberCount > 0 ? summary.totalSpending / memberCount : 0;

  const maxAbsBalance = summary.balances.reduce(
    (max, item) => Math.max(max, Math.abs(item.netBalance)),
    0
  );

  return (
    <aside className="overflow-hidden rounded-2xl border border-neutral-200/80 bg-white/80 shadow-sm backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-900/65">
      {/* Live Digital Receipt Header */}
      <div className="border-b border-dashed border-neutral-200 p-5 dark:border-neutral-800">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-lg bg-sky-500/15 text-sky-600 dark:bg-sky-400/15 dark:text-sky-400">
              <ReceiptText size={15} aria-hidden="true" />
            </span>
            <h2 className="truncate text-sm font-bold text-slate-900 dark:text-slate-100">
              {eventName?.trim() || 'Live Settlement Receipt'}
            </h2>
          </div>

          <Button
            variant="blue"
            size="xs"
            rounded="lg"
            icon={MessageSquareShare}
            disabled={!hasExpenses}
            onClick={onOpenShareModal}
          >
            Bill Summary
          </Button>
        </div>

        {/* Hero Spending Metric */}
        <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Total Group Spending
            </div>
            <div className="mt-0.5 font-mono text-2xl font-bold tabular-nums tracking-tight text-slate-900 sm:text-3xl dark:text-slate-50">
              {formatCurrency(summary.totalSpending, currency, currencySymbol)}
            </div>
          </div>

          {savedTransfersCount > 0 && (
            <Badge variant="amber" size="xs">
              Saved {savedTransfersCount}{' '}
              {savedTransfersCount === 1 ? 'transfer' : 'transfers'}
            </Badge>
          )}
        </div>

        <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
          <span>
            {memberCount} {memberCount === 1 ? 'member' : 'members'}
          </span>
          <span aria-hidden="true">·</span>
          <span>
            {expenseCount} {expenseCount === 1 ? 'expense' : 'expenses'}
          </span>
          {memberCount > 0 && (
            <>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">
                ~{formatCurrency(perPersonAvg, currency, currencySymbol)}/person
              </span>
            </>
          )}
        </div>
      </div>

      {/* 1. Optimal Settlement Plan */}
      <div className="border-b border-dashed border-neutral-200 p-5 dark:border-neutral-800">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ArrowLeftRight
              size={15}
              className="text-slate-500 dark:text-slate-400"
              aria-hidden="true"
            />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
              Optimal Transfers
            </h3>
          </div>
          {hasExpenses && (
            <Badge variant="success" size="xs">
              {summary.transfers.length}{' '}
              {summary.transfers.length === 1 ? 'transfer' : 'transfers'}
            </Badge>
          )}
        </div>

        <InsetGroup rounded="xl">
          {summary.transfers.length === 0 ? (
            <EmptyState
              icon={hasExpenses ? CheckCircle2 : ArrowLeftRight}
              tone={hasExpenses ? 'success' : 'neutral'}
              title={
                hasExpenses
                  ? 'All balances are already settled!'
                  : 'Add expenses to compute transfers'
              }
              description={
                hasExpenses
                  ? 'Zero transfers needed between group members.'
                  : 'Optimal Min-Cash-Flow transfers appear live as you record expenses.'
              }
            />
          ) : (
            summary.transfers.map((transfer, index) => (
              <SettlementTransferRow
                key={transfer.id}
                transfer={transfer}
                index={index}
                currency={currency}
                currencySymbol={currencySymbol}
              />
            ))
          )}
        </InsetGroup>
      </div>

      {/* 2. Member Net Balances */}
      <div className="p-5">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Scale
              size={15}
              className="text-slate-500 dark:text-slate-400"
              aria-hidden="true"
            />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
              Member Net Balances
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 dark:text-slate-500">
            Owes ← 0 → Receives
          </span>
        </div>

        <InsetGroup rounded="xl">
          {summary.balances.length === 0 ? (
            <EmptyState
              icon={Scale}
              title="No member balances yet"
              description="Add group members to track individual paid amounts and net balances."
            />
          ) : (
            summary.balances.map((balance) => (
              <MemberBalanceRow
                key={balance.memberId}
                balance={balance}
                currency={currency}
                currencySymbol={currencySymbol}
                maxAbsBalance={maxAbsBalance}
              />
            ))
          )}
        </InsetGroup>
      </div>

      {/* Receipt Footer */}
      <div className="flex items-center justify-between gap-2 border-t border-neutral-200/70 bg-neutral-50/75 px-5 py-3 text-[11px] text-slate-500 dark:border-neutral-800 dark:bg-neutral-900/50 dark:text-slate-400">
        <span>Min-Cash-Flow greedy settlement</span>
        {hasExpenses && (
          <button
            type="button"
            onClick={onOpenShareModal}
            className="font-semibold text-sky-600 transition-colors hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300"
          >
            Share Receipt →
          </button>
        )}
      </div>
    </aside>
  );
}
