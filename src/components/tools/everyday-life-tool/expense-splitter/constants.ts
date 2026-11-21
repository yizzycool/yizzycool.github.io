import type {
  CurrencyCode,
  CurrencyConfig,
  ExpenseWorkspaceData,
  SplitType,
} from './types';

export const STORAGE_KEY_EXPENSE_WORKSPACE =
  'yizzypeasy-expense-splitter-workspace';

export const CURRENCY_OPTIONS: CurrencyConfig[] = [
  { label: 'USD ($)', value: 'USD', symbol: '$', decimals: 2 },
  { label: 'TWD (NT$)', value: 'TWD', symbol: 'NT$', decimals: 0 },
  { label: 'JPY (¥)', value: 'JPY', symbol: '¥', decimals: 0 },
  { label: 'EUR (€)', value: 'EUR', symbol: '€', decimals: 2 },
  { label: 'KRW (₩)', value: 'KRW', symbol: '₩', decimals: 0 },
  { label: 'HKD (HK$)', value: 'HKD', symbol: 'HK$', decimals: 2 },
  { label: 'GBP (£)', value: 'GBP', symbol: '£', decimals: 2 },
  { label: 'Custom', value: 'CUSTOM', symbol: '$', decimals: 2 },
];

export const CURRENCY_MAP: Record<CurrencyCode, CurrencyConfig> = {
  USD: CURRENCY_OPTIONS[0],
  TWD: CURRENCY_OPTIONS[1],
  JPY: CURRENCY_OPTIONS[2],
  EUR: CURRENCY_OPTIONS[3],
  KRW: CURRENCY_OPTIONS[4],
  HKD: CURRENCY_OPTIONS[5],
  GBP: CURRENCY_OPTIONS[6],
  CUSTOM: CURRENCY_OPTIONS[7],
};

export const SPLIT_TYPE_TABS: SplitType[] = ['equal', 'exact'];

export const SPLIT_TYPE_LABELS: Record<SplitType, string> = {
  equal: 'Split Equally',
  exact: 'Exact Amounts',
};

export const DEFAULT_WORKSPACE_DATA: ExpenseWorkspaceData = {
  eventName: '',
  currency: 'USD',
  customCurrencyCode: '',
  customCurrencySymbol: '$',
  members: [],
  expenses: [],
};
