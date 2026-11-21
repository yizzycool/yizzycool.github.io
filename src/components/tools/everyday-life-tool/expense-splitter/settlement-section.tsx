'use client';

import type { CurrencyCode, SettlementSummary } from './types';

import {
  ArrowLeftRight,
  CheckCircle2,
  MessageSquareShare,
  Scale,
} from 'lucide-react';

import { InsetGroup } from '@/components/tools/common/inset-group';
import LabelBar from '@/components/tools/common/label-bar';
import SectionGap from '@/components/tools/common/section-gap';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import MemberBalanceRow from './member-balance-row';
import SettlementTransferRow from './settlement-transfer-row';

type Props = {
  summary: SettlementSummary;
  currency: CurrencyCode;
  currencySymbol: string;
  hasExpenses: boolean;
  onOpenShareModal: () => void;
};

export default function SettlementSection({
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

  return (
    <div>
      {/* 1. Optimal Settlement Plan */}
      <LabelBar
        icon={ArrowLeftRight}
        label={
          <div className="flex flex-wrap items-center gap-2">
            <span>Optimal Settlement Plan</span>
            {hasExpenses && (
              <Badge variant="success" size="xs">
                {summary.transfers.length}{' '}
                {summary.transfers.length === 1 ? 'transfer' : 'transfers'}
              </Badge>
            )}
            {savedTransfersCount > 0 && (
              <Badge variant="amber" size="xs">
                Saved {savedTransfersCount}{' '}
                {savedTransfersCount === 1 ? 'transfer' : 'transfers'}
              </Badge>
            )}
          </div>
        }
        description="Calculated via the Min-Cash-Flow greedy algorithm to minimize total bank transfers."
        actions={
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
        }
      />

      <InsetGroup rounded="2xl">
        {summary.transfers.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 px-4 py-8 text-center">
            <CheckCircle2
              size={28}
              className="text-emerald-500/80 dark:text-emerald-400/80"
            />
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {hasExpenses
                ? 'All balances are already settled!'
                : 'Add expenses to compute optimal transfers'}
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              {hasExpenses
                ? 'Zero transfers needed between group members.'
                : 'Transfers will appear here automatically as expenses are added.'}
            </p>
          </div>
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

      <SectionGap />

      {/* 2. Member Net Balances */}
      <LabelBar
        icon={Scale}
        label="Member Net Balances"
        description="Overview of total paid, fair share, and net receivable or payable per person."
      />

      <InsetGroup rounded="2xl">
        {summary.balances.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 px-4 py-8 text-center">
            <Scale size={28} className="text-slate-300 dark:text-slate-600" />
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
              No member balances yet
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Add group members above to track individual paid amounts and net
              balances.
            </p>
          </div>
        ) : (
          summary.balances.map((balance) => (
            <MemberBalanceRow
              key={balance.memberId}
              balance={balance}
              currency={currency}
              currencySymbol={currencySymbol}
            />
          ))
        )}
      </InsetGroup>
    </div>
  );
}
