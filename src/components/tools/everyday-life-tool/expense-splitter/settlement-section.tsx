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
import { EmptyState } from '@/components/ui/empty-state';

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
          <EmptyState
            icon={hasExpenses ? CheckCircle2 : ArrowLeftRight}
            tone={hasExpenses ? 'success' : 'neutral'}
            title={
              hasExpenses
                ? 'All balances are already settled!'
                : 'Add expenses to compute optimal transfers'
            }
            description={
              hasExpenses
                ? 'Zero transfers needed between group members.'
                : 'Transfers will appear here automatically as expenses are added.'
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

      <SectionGap />

      {/* 2. Member Net Balances */}
      <LabelBar
        icon={Scale}
        label="Member Net Balances"
        description="Overview of total paid, fair share, and net receivable or payable per person."
      />

      <InsetGroup rounded="2xl">
        {summary.balances.length === 0 ? (
          <EmptyState
            icon={Scale}
            title="No member balances yet"
            description="Add group members above to track individual paid amounts and net balances."
          />
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
