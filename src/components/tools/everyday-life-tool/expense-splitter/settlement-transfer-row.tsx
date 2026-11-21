'use client';

import type { CurrencyCode, SettlementTransfer } from './types';

import { ArrowRight } from 'lucide-react';

import { PropertyRow } from '@/components/tools/common/property-row';

import { formatCurrency } from './utils/settlement-engine';

type Props = {
  transfer: SettlementTransfer;
  index: number;
  currency: CurrencyCode;
  currencySymbol: string;
};

export default function SettlementTransferRow({
  transfer,
  index,
  currency,
  currencySymbol,
}: Props) {
  const formattedAmount = formatCurrency(
    transfer.amount,
    currency,
    currencySymbol
  );
  const copyString = `${transfer.fromName} → ${transfer.toName}: ${formattedAmount}`;

  return (
    <PropertyRow
      grouped
      hoverAction
      label={`Transfer #${index + 1}`}
      badge="Min-Cash-Flow"
      badgeVariant="success"
      value={copyString}
      displayValue={
        <span className="inline-flex flex-wrap items-center gap-2 font-sans">
          <span className="font-semibold text-rose-600 dark:text-rose-400">
            {transfer.fromName}
          </span>
          <ArrowRight
            size={14}
            className="shrink-0 text-slate-400 dark:text-slate-500"
          />
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
            {transfer.toName}
          </span>
          <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
            {formattedAmount}
          </span>
        </span>
      }
      copySuccessToast={`Copied: ${copyString}`}
    />
  );
}
