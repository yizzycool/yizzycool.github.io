import type {
  CurrencyCode,
  CurrencyConfig,
  ExpenseMember,
  ExpenseRecord,
  ExpenseWorkspaceData,
  MemberBalance,
  SettlementSummary,
  SettlementTransfer,
} from '../types';

import { CURRENCY_MAP } from '../constants';

const ROUND_EPSILON = 0.01;

function roundCents(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/**
 * Resolves the effective currency configuration, supporting user-defined custom code and symbol.
 */
export function resolveCurrencyConfig(
  currency: CurrencyCode,
  customCode?: string,
  customSymbol?: string
): CurrencyConfig {
  if (currency === 'CUSTOM') {
    const code = customCode?.trim().toUpperCase() || 'CUSTOM';
    const symbol = customSymbol?.trim() || customCode?.trim() || '$';
    return {
      label: `${code} (${symbol})`,
      value: 'CUSTOM',
      symbol,
      decimals: 2,
    };
  }
  return CURRENCY_MAP[currency] || CURRENCY_MAP.USD;
}

/**
 * Formats a numeric amount cleanly with its currency symbol.
 * Strips redundant ".00" while keeping fractional cents when present.
 */
export function formatCurrency(
  amount: number,
  currency: CurrencyCode,
  customSymbol?: string,
  customCode?: string
): string {
  const config = resolveCurrencyConfig(currency, customCode, customSymbol);
  const absAmount = Math.abs(roundCents(amount));
  const hasFraction = Math.abs(absAmount - Math.round(absAmount)) >= 0.005;

  const formattedNumber = absAmount.toLocaleString('en-US', {
    minimumFractionDigits: hasFraction ? 2 : 0,
    maximumFractionDigits: hasFraction ? 2 : config.decimals === 0 ? 0 : 2,
  });

  const sign = amount < -ROUND_EPSILON ? '-' : '';
  const spacer = config.symbol.length > 1 ? ' ' : '';

  return `${sign}${config.symbol}${spacer}${formattedNumber}`;
}

/**
 * Computes each member's paid/owed totals and runs the Min-Cash-Flow greedy
 * algorithm to minimize the number of transfers required to settle all debts.
 */
export function calculateSettlement(
  members: ExpenseMember[],
  expenses: ExpenseRecord[]
): SettlementSummary {
  if (members.length === 0) {
    return {
      totalSpending: 0,
      averagePerMember: 0,
      balances: [],
      transfers: [],
      rawPairwiseCount: 0,
    };
  }

  const memberIds = new Set(members.map((m) => m.id));
  const paidMap = new Map<string, number>();
  const shareMap = new Map<string, number>();
  const pairwiseDebt = new Map<string, number>();

  for (const member of members) {
    paidMap.set(member.id, 0);
    shareMap.set(member.id, 0);
  }

  let totalSpending = 0;

  for (const expense of expenses) {
    if (!memberIds.has(expense.paidById) || expense.amount <= 0) {
      continue;
    }

    totalSpending = roundCents(totalSpending + expense.amount);
    paidMap.set(
      expense.paidById,
      (paidMap.get(expense.paidById) || 0) + expense.amount
    );

    if (expense.splitType === 'exact') {
      for (const member of members) {
        const exactShare = expense.exactAmounts[member.id] || 0;
        if (exactShare > 0) {
          shareMap.set(member.id, (shareMap.get(member.id) || 0) + exactShare);

          if (member.id !== expense.paidById) {
            const key = `${member.id}->${expense.paidById}`;
            pairwiseDebt.set(key, (pairwiseDebt.get(key) || 0) + exactShare);
          }
        }
      }
    } else {
      const validParticipants = expense.participantIds.filter((id) =>
        memberIds.has(id)
      );
      if (validParticipants.length === 0) continue;

      const perPerson = expense.amount / validParticipants.length;
      for (const participantId of validParticipants) {
        shareMap.set(
          participantId,
          (shareMap.get(participantId) || 0) + perPerson
        );

        if (participantId !== expense.paidById) {
          const key = `${participantId}->${expense.paidById}`;
          pairwiseDebt.set(key, (pairwiseDebt.get(key) || 0) + perPerson);
        }
      }
    }
  }

  // Build rounded member balances
  const balances: MemberBalance[] = members.map((member) => {
    const totalPaid = roundCents(paidMap.get(member.id) || 0);
    const totalShare = roundCents(shareMap.get(member.id) || 0);
    const netBalance = roundCents(totalPaid - totalShare);
    return {
      memberId: member.id,
      memberName: member.name,
      totalPaid,
      totalShare,
      netBalance,
    };
  });

  // Reconcile any 1-cent rounding drift so total net balances sum to 0
  const drift = roundCents(
    balances.reduce((acc, item) => acc + item.netBalance, 0)
  );
  if (Math.abs(drift) >= ROUND_EPSILON && balances.length > 0) {
    const largestCreditor = [...balances].sort(
      (a, b) => b.netBalance - a.netBalance
    )[0];
    if (
      largestCreditor &&
      Math.abs(largestCreditor.netBalance) >= Math.abs(drift)
    ) {
      largestCreditor.netBalance = roundCents(
        largestCreditor.netBalance - drift
      );
    }
  }

  // Min-Cash-Flow Greedy Algorithm
  const creditors = balances
    .filter((b) => b.netBalance >= ROUND_EPSILON)
    .map((b) => ({ id: b.memberId, name: b.memberName, amount: b.netBalance }))
    .sort((a, b) => b.amount - a.amount);

  const debtors = balances
    .filter((b) => b.netBalance <= -ROUND_EPSILON)
    .map((b) => ({
      id: b.memberId,
      name: b.memberName,
      amount: Math.abs(b.netBalance),
    }))
    .sort((a, b) => b.amount - a.amount);

  const transfers: SettlementTransfer[] = [];
  let cIdx = 0;
  let dIdx = 0;

  while (cIdx < creditors.length && dIdx < debtors.length) {
    const creditor = creditors[cIdx];
    const debtor = debtors[dIdx];
    const transferAmount = roundCents(Math.min(creditor.amount, debtor.amount));

    if (transferAmount >= ROUND_EPSILON) {
      transfers.push({
        id: `${debtor.id}->${creditor.id}`,
        fromId: debtor.id,
        fromName: debtor.name,
        toId: creditor.id,
        toName: creditor.name,
        amount: transferAmount,
      });
    }

    creditor.amount = roundCents(creditor.amount - transferAmount);
    debtor.amount = roundCents(debtor.amount - transferAmount);

    if (creditor.amount < ROUND_EPSILON) cIdx += 1;
    if (debtor.amount < ROUND_EPSILON) dIdx += 1;
  }

  // Count non-trivial pairwise edges before simplification for user insight
  let rawPairwiseCount = 0;
  for (const val of pairwiseDebt.values()) {
    if (val >= ROUND_EPSILON) {
      rawPairwiseCount += 1;
    }
  }

  return {
    totalSpending,
    averagePerMember:
      members.length > 0 ? roundCents(totalSpending / members.length) : 0,
    balances,
    transfers,
    rawPairwiseCount,
  };
}

export interface ShareableBillOptions {
  workspace: ExpenseWorkspaceData;
  summary: SettlementSummary;
  includeItems: boolean;
  includeBalances: boolean;
}

/**
 * Generates a clean, emoji-formatted English summary text ready for LINE, Discord, or WhatsApp.
 */
export function generateShareableBillText({
  workspace,
  summary,
  includeItems,
  includeBalances,
}: ShareableBillOptions): string {
  const {
    eventName,
    currency,
    customCurrencyCode,
    customCurrencySymbol,
    members,
    expenses,
  } = workspace;
  const memberNameMap = new Map(members.map((m) => [m.id, m.name]));

  const title = eventName.trim() || 'Group Expense Summary';
  const customCodeSuffix =
    currency === 'CUSTOM' && customCurrencyCode?.trim()
      ? ` (${customCurrencyCode.trim().toUpperCase()})`
      : '';

  const lines: string[] = [];

  lines.push(`🧾 ${title}`);
  lines.push(
    `💰 Total Spending${customCodeSuffix}: ${formatCurrency(summary.totalSpending, currency, customCurrencySymbol, customCurrencyCode)} (${members.length} ${members.length === 1 ? 'member' : 'members'})`
  );

  if (includeItems && expenses.length > 0) {
    lines.push('');
    lines.push('📋 Expense Items:');
    for (const item of expenses) {
      const payerName = memberNameMap.get(item.paidById) || 'Unknown';
      const formattedAmount = formatCurrency(
        item.amount,
        currency,
        customCurrencySymbol,
        customCurrencyCode
      );
      lines.push(`• ${item.title}: ${formattedAmount} (paid by ${payerName})`);
    }
  }

  lines.push('');
  lines.push(
    `🔁 Optimal Settlement Plan (${summary.transfers.length} transfer${summary.transfers.length === 1 ? '' : 's'}):`
  );

  if (summary.transfers.length === 0) {
    lines.push('✅ All balances are settled!');
  } else {
    for (const transfer of summary.transfers) {
      const amt = formatCurrency(
        transfer.amount,
        currency,
        customCurrencySymbol,
        customCurrencyCode
      );
      lines.push(`👉 ${transfer.fromName} → ${transfer.toName}: ${amt}`);
    }
  }

  if (includeBalances && summary.balances.length > 0) {
    lines.push('');
    lines.push('⚖️ Member Net Balances:');
    for (const bal of summary.balances) {
      const net =
        bal.netBalance > ROUND_EPSILON
          ? `+${formatCurrency(bal.netBalance, currency, customCurrencySymbol, customCurrencyCode)}`
          : formatCurrency(
              bal.netBalance,
              currency,
              customCurrencySymbol,
              customCurrencyCode
            );
      const status =
        bal.netBalance > ROUND_EPSILON
          ? 'Receives'
          : bal.netBalance < -ROUND_EPSILON
            ? 'Owes'
            : 'Settled';
      lines.push(`• ${bal.memberName}: ${net} (${status})`);
    }
  }

  lines.push('');
  lines.push(
    '⚡ Powered by Yizzy Peasy Tools (yizzypeasy.com/tools/everyday-life-tool/expense-splitter)'
  );

  return lines.join('\n');
}
