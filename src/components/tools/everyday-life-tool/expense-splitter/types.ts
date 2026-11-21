export type CurrencyCode =
  | 'USD'
  | 'TWD'
  | 'JPY'
  | 'EUR'
  | 'KRW'
  | 'HKD'
  | 'GBP'
  | 'CUSTOM';

export type SplitType = 'equal' | 'exact';

export interface CurrencyConfig {
  label: string;
  value: CurrencyCode;
  symbol: string;
  decimals: number;
}

export interface ExpenseMember {
  id: string;
  name: string;
}

export interface ExpenseRecord {
  id: string;
  title: string;
  amount: number;
  paidById: string;
  splitType: SplitType;
  participantIds: string[];
  exactAmounts: Record<string, number>;
  createdAt: number;
}

export interface MemberBalance {
  memberId: string;
  memberName: string;
  totalPaid: number;
  totalShare: number;
  netBalance: number;
}

export interface SettlementTransfer {
  id: string;
  fromId: string;
  fromName: string;
  toId: string;
  toName: string;
  amount: number;
}

export interface SettlementSummary {
  totalSpending: number;
  averagePerMember: number;
  balances: MemberBalance[];
  transfers: SettlementTransfer[];
  rawPairwiseCount: number;
}

export interface ExpenseWorkspaceData {
  eventName: string;
  currency: CurrencyCode;
  customCurrencyCode?: string;
  customCurrencySymbol?: string;
  members: ExpenseMember[];
  expenses: ExpenseRecord[];
}

export interface ExpenseSplitterHistoryData {
  workspace: ExpenseWorkspaceData;
  totalSpending: number;
  transferCount: number;
  timestamp: number;
}
