'use client';

import type {
  CurrencyCode,
  ExpenseMember,
  ExpenseRecord,
  ExpenseSplitterHistoryData,
  ExpenseWorkspaceData,
  SettlementSummary,
  SplitType,
} from '../types';

import { useCallback, useMemo, useRef, useState } from 'react';

import { ToolKeys } from '@/data/tools';
import { useToolHistory } from '@/hooks/tools/use-tool-history';
import useToolHotkeys from '@/hooks/tools/use-tool-hotkeys';
import { useLocalStorage } from '@/hooks/window/use-local-storage';
import toast from '@/utils/toast';

import {
  DEFAULT_WORKSPACE_DATA,
  STORAGE_KEY_EXPENSE_WORKSPACE,
} from '../constants';
import {
  calculateSettlement,
  formatCurrency,
  generateShareableBillText,
  resolveCurrencyConfig,
} from '../utils/settlement-engine';

function createId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export default function useExpenseSplitter() {
  const { value: workspace, setValue: setWorkspace } =
    useLocalStorage<ExpenseWorkspaceData>(
      STORAGE_KEY_EXPENSE_WORKSPACE,
      DEFAULT_WORKSPACE_DATA
    );

  // Member addition state
  const [newMemberName, setNewMemberName] = useState<string>('');
  const [memberError, setMemberError] = useState<string | null>(null);

  // Expense form states
  const [expenseTitle, setExpenseTitle] = useState<string>('');
  const [expenseAmount, setExpenseAmount] = useState<string>('');
  const [paidById, setPaidById] = useState<string>('');
  const [splitType, setSplitType] = useState<SplitType>('equal');
  const [selectedParticipantIds, setSelectedParticipantIds] = useState<
    string[] | null
  >(null);
  const [exactAmounts, setExactAmounts] = useState<Record<string, string>>({});
  const [expenseError, setExpenseError] = useState<string | null>(null);

  // Share bill modal states
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [includeItems, setIncludeItems] = useState<boolean>(true);
  const [includeBalances, setIncludeBalances] = useState<boolean>(false);

  const expenseTitleInputRef = useRef<HTMLInputElement>(null);

  // History integration
  const {
    historyList,
    isLoading: isLoadingHistory,
    addHistoryWithToast,
    renameHistory,
    removeHistory,
    clearHistory,
  } = useToolHistory<ExpenseSplitterHistoryData>(ToolKeys.expenseSplitter);

  // Effective payer & participants derived safely against current member list
  const effectivePaidById = useMemo(() => {
    const exists = workspace.members.some((m) => m.id === paidById);
    if (exists) return paidById;
    return workspace.members[0]?.id ?? '';
  }, [workspace.members, paidById]);

  const effectiveParticipantIds = useMemo(() => {
    const validIds = new Set(workspace.members.map((m) => m.id));
    if (selectedParticipantIds === null) {
      return workspace.members.map((m) => m.id);
    }
    return selectedParticipantIds.filter((id) => validIds.has(id));
  }, [workspace.members, selectedParticipantIds]);

  // Real-time Min-Cash-Flow calculation
  const summary: SettlementSummary = useMemo(
    () => calculateSettlement(workspace.members, workspace.expenses),
    [workspace.members, workspace.expenses]
  );

  // Exact split remaining validation
  const parsedExpenseAmount = useMemo(() => {
    const num = Number.parseFloat(expenseAmount);
    return Number.isFinite(num) && num > 0 ? num : 0;
  }, [expenseAmount]);

  const exactAssignedTotal = useMemo(() => {
    return workspace.members.reduce((sum, member) => {
      const val = Number.parseFloat(exactAmounts[member.id] || '0');
      return sum + (Number.isFinite(val) && val > 0 ? val : 0);
    }, 0);
  }, [workspace.members, exactAmounts]);

  const exactRemainder = useMemo(() => {
    return Math.round((parsedExpenseAmount - exactAssignedTotal) * 100) / 100;
  }, [parsedExpenseAmount, exactAssignedTotal]);

  const currencyConfig = useMemo(
    () =>
      resolveCurrencyConfig(
        workspace.currency,
        workspace.customCurrencyCode,
        workspace.customCurrencySymbol
      ),
    [
      workspace.currency,
      workspace.customCurrencyCode,
      workspace.customCurrencySymbol,
    ]
  );

  const shareableBillText = useMemo(
    () =>
      generateShareableBillText({
        workspace,
        summary,
        includeItems,
        includeBalances,
      }),
    [workspace, summary, includeItems, includeBalances]
  );

  // Workspace metadata updates
  const handleEventNameChange = useCallback(
    (name: string) => {
      setWorkspace({
        ...workspace,
        eventName: name,
      });
    },
    [workspace, setWorkspace]
  );

  const handleCurrencyChange = useCallback(
    (currency: string) => {
      setWorkspace({
        ...workspace,
        currency: currency as CurrencyCode,
      });
    },
    [workspace, setWorkspace]
  );

  const handleCustomCurrencyCodeChange = useCallback(
    (code: string) => {
      setWorkspace({
        ...workspace,
        customCurrencyCode: code,
      });
    },
    [workspace, setWorkspace]
  );

  const handleCustomCurrencySymbolChange = useCallback(
    (symbol: string) => {
      setWorkspace({
        ...workspace,
        customCurrencySymbol: symbol,
      });
    },
    [workspace, setWorkspace]
  );

  // Member management
  const handleNewMemberNameChange = useCallback((value: string) => {
    setNewMemberName(value);
    setMemberError(null);
  }, []);

  const handleAddMember = useCallback(() => {
    const trimmed = newMemberName.trim();
    if (!trimmed) {
      setMemberError('Please enter a member name');
      return;
    }

    const duplicate = workspace.members.some(
      (m) => m.name.toLowerCase() === trimmed.toLowerCase()
    );
    if (duplicate) {
      setMemberError(`"${trimmed}" is already in the group`);
      return;
    }

    const newMember: ExpenseMember = {
      id: createId('member'),
      name: trimmed,
    };

    const nextMembers = [...workspace.members, newMember];
    setWorkspace({
      ...workspace,
      members: nextMembers,
    });

    if (selectedParticipantIds !== null) {
      setSelectedParticipantIds([...effectiveParticipantIds, newMember.id]);
    }

    setNewMemberName('');
    setMemberError(null);
    toast.success(`Added ${trimmed}`);
  }, [
    newMemberName,
    workspace,
    setWorkspace,
    selectedParticipantIds,
    effectiveParticipantIds,
  ]);

  const handleRemoveMember = useCallback(
    (memberId: string) => {
      const target = workspace.members.find((m) => m.id === memberId);
      if (!target) return;

      const isUsedInExpenses = workspace.expenses.some(
        (exp) =>
          exp.paidById === memberId ||
          exp.participantIds.includes(memberId) ||
          (exp.exactAmounts[memberId] ?? 0) > 0
      );

      if (isUsedInExpenses) {
        toast.warning(
          `Remove expenses involving ${target.name} before removing member`
        );
        return;
      }

      setWorkspace({
        ...workspace,
        members: workspace.members.filter((m) => m.id !== memberId),
      });

      if (selectedParticipantIds !== null) {
        setSelectedParticipantIds(
          effectiveParticipantIds.filter((id) => id !== memberId)
        );
      }

      toast.info(`Removed ${target.name}`);
    },
    [workspace, setWorkspace, selectedParticipantIds, effectiveParticipantIds]
  );

  // Expense form actions
  const handleToggleParticipant = useCallback(
    (memberId: string) => {
      const exists = effectiveParticipantIds.includes(memberId);
      const nextIds = exists
        ? effectiveParticipantIds.filter((id) => id !== memberId)
        : [...effectiveParticipantIds, memberId];
      setSelectedParticipantIds(nextIds);
      setExpenseError(null);
    },
    [effectiveParticipantIds]
  );

  const handleSelectAllParticipants = useCallback(() => {
    setSelectedParticipantIds(workspace.members.map((m) => m.id));
    setExpenseError(null);
  }, [workspace.members]);

  const handleExactAmountChange = useCallback(
    (memberId: string, value: string) => {
      setExactAmounts((prev) => ({
        ...prev,
        [memberId]: value,
      }));
      setExpenseError(null);
    },
    []
  );

  const handleFillExactRemainder = useCallback(
    (memberId: string) => {
      if (parsedExpenseAmount <= 0) return;
      const otherSum = workspace.members.reduce((sum, member) => {
        if (member.id === memberId) return sum;
        const val = Number.parseFloat(exactAmounts[member.id] || '0');
        return sum + (Number.isFinite(val) && val > 0 ? val : 0);
      }, 0);
      const remaining = Math.max(
        0,
        Math.round((parsedExpenseAmount - otherSum) * 100) / 100
      );
      setExactAmounts((prev) => ({
        ...prev,
        [memberId]: remaining > 0 ? String(remaining) : '',
      }));
      setExpenseError(null);
    },
    [parsedExpenseAmount, workspace.members, exactAmounts]
  );

  const resetExpenseForm = useCallback(() => {
    setExpenseTitle('');
    setExpenseAmount('');
    setExactAmounts({});
    setSelectedParticipantIds(null);
    setExpenseError(null);
  }, []);

  const handleAddExpense = useCallback(() => {
    if (workspace.members.length < 2) {
      setExpenseError('Add at least 2 members first');
      return;
    }

    const titleTrimmed = expenseTitle.trim() || 'Shared Expense';
    const amountVal = Number.parseFloat(expenseAmount);

    if (!Number.isFinite(amountVal) || amountVal <= 0) {
      setExpenseError('Please enter a valid positive amount');
      return;
    }

    if (!effectivePaidById) {
      setExpenseError('Please select who paid');
      return;
    }

    const parsedExactMap: Record<string, number> = {};
    let participantsForRecord: string[] = effectiveParticipantIds;

    if (splitType === 'equal') {
      if (effectiveParticipantIds.length === 0) {
        setExpenseError('Select at least 1 participant to split equally');
        return;
      }
    } else {
      for (const member of workspace.members) {
        const val = Number.parseFloat(exactAmounts[member.id] || '0');
        if (Number.isFinite(val) && val > 0) {
          parsedExactMap[member.id] = Math.round(val * 100) / 100;
        }
      }

      const assignedSum = Object.values(parsedExactMap).reduce(
        (acc, v) => acc + v,
        0
      );

      if (Math.abs(assignedSum - amountVal) > 0.01) {
        setExpenseError(
          `Assigned amounts (${formatCurrency(assignedSum, workspace.currency, currencyConfig.symbol, workspace.customCurrencyCode)}) must match total (${formatCurrency(amountVal, workspace.currency, currencyConfig.symbol, workspace.customCurrencyCode)})`
        );
        return;
      }

      participantsForRecord = Object.keys(parsedExactMap);
    }

    const newRecord: ExpenseRecord = {
      id: createId('exp'),
      title: titleTrimmed,
      amount: Math.round(amountVal * 100) / 100,
      paidById: effectivePaidById,
      splitType,
      participantIds: participantsForRecord,
      exactAmounts: parsedExactMap,
      createdAt: Date.now(),
    };

    setWorkspace({
      ...workspace,
      expenses: [newRecord, ...workspace.expenses],
    });

    resetExpenseForm();
    toast.success(`Added "${titleTrimmed}"`);
    expenseTitleInputRef.current?.focus();
  }, [
    workspace,
    setWorkspace,
    expenseTitle,
    expenseAmount,
    effectivePaidById,
    splitType,
    effectiveParticipantIds,
    exactAmounts,
    currencyConfig.symbol,
    resetExpenseForm,
  ]);

  const handleRemoveExpense = useCallback(
    (expenseId: string) => {
      setWorkspace({
        ...workspace,
        expenses: workspace.expenses.filter((exp) => exp.id !== expenseId),
      });
      toast.info('Expense removed');
    },
    [workspace, setWorkspace]
  );

  // Workspace presets & history actions
  const handleResetAll = useCallback(() => {
    setWorkspace(DEFAULT_WORKSPACE_DATA);
    setPaidById(DEFAULT_WORKSPACE_DATA.members[0]?.id ?? '');
    resetExpenseForm();
  }, [setWorkspace, resetExpenseForm]);

  const handleSaveSnapshot = useCallback(() => {
    if (workspace.expenses.length === 0) {
      toast.warning('Add at least one expense before saving a snapshot');
      return;
    }

    const eventLabel =
      workspace.eventName.trim() ||
      `${workspace.members.length} Members · ${workspace.expenses.length} Items`;
    const preview = `${eventLabel} (${formatCurrency(summary.totalSpending, workspace.currency, currencyConfig.symbol, workspace.customCurrencyCode)})`;

    addHistoryWithToast(
      preview,
      {
        workspace,
        totalSpending: summary.totalSpending,
        transferCount: summary.transfers.length,
        timestamp: Date.now(),
      },
      {
        title: eventLabel,
        toastMessage: 'Saved group bill snapshot to history',
      }
    );
  }, [workspace, summary, currencyConfig.symbol, addHistoryWithToast]);

  const handleRestoreHistory = useCallback(
    (data: ExpenseSplitterHistoryData) => {
      if (data?.workspace) {
        setWorkspace(data.workspace);
        setPaidById(data.workspace.members[0]?.id ?? '');
        resetExpenseForm();
        toast.info(
          `Restored: ${data.workspace.eventName || 'Group Bill Snapshot'}`
        );
      }
    },
    [setWorkspace, resetExpenseForm]
  );

  const handleCopyBillText = useCallback(async () => {
    if (workspace.expenses.length === 0) {
      toast.warning('Add at least one expense to copy the settlement bill');
      return;
    }

    try {
      await navigator.clipboard.writeText(shareableBillText);
      toast.success('Copied bill summary to clipboard');
    } catch {
      toast.error('Failed to copy bill summary');
    }
  }, [workspace.expenses.length, shareableBillText]);

  // Global keyboard shortcuts
  useToolHotkeys({
    onExecute: () => {
      if (expenseAmount.trim()) {
        handleAddExpense();
      } else {
        handleSaveSnapshot();
      }
    },
    onCopy: handleCopyBillText,
    onClear: resetExpenseForm,
  });

  return {
    workspace,
    summary,
    currencySymbol: currencyConfig.symbol,
    customCurrencyCode: workspace.customCurrencyCode ?? '',
    customCurrencySymbol: workspace.customCurrencySymbol ?? '$',
    // Member management
    newMemberName,
    memberError,
    handleNewMemberNameChange,
    handleAddMember,
    handleRemoveMember,
    handleEventNameChange,
    handleCurrencyChange,
    handleCustomCurrencyCodeChange,
    handleCustomCurrencySymbolChange,
    // Expense form
    expenseTitleInputRef,
    expenseTitle,
    setExpenseTitle: (val: string) => {
      setExpenseTitle(val);
      setExpenseError(null);
    },
    expenseAmount,
    setExpenseAmount: (val: string) => {
      setExpenseAmount(val);
      setExpenseError(null);
    },
    paidById: effectivePaidById,
    setPaidById,
    splitType,
    setSplitType: (type: SplitType) => {
      setSplitType(type);
      setExpenseError(null);
    },
    selectedParticipantIds: effectiveParticipantIds,
    exactAmounts,
    exactRemainder,
    parsedExpenseAmount,
    expenseError,
    handleToggleParticipant,
    handleSelectAllParticipants,
    handleExactAmountChange,
    handleFillExactRemainder,
    handleAddExpense,
    handleRemoveExpense,
    resetExpenseForm,
    // Share modal
    isShareModalOpen,
    setIsShareModalOpen,
    includeItems,
    setIncludeItems,
    includeBalances,
    setIncludeBalances,
    shareableBillText,
    handleCopyBillText,
    // Presets & History
    handleResetAll,
    handleSaveSnapshot,
    historyList,
    isLoadingHistory,
    renameHistory,
    removeHistory,
    clearHistory,
    handleRestoreHistory,
  };
}
