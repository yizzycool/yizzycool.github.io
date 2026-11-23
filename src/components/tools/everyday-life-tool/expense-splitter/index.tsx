'use client';

import type { ExpenseSplitterHistoryData } from './types';

import HeaderBlock from '@/components/tools/common/header-block';
import SectionGap from '@/components/tools/common/section-gap';
import { ConfirmDialog, useConfirmDialog } from '@/components/ui/dialog';
import { TOOL_HOTKEYS } from '@/hooks/tools/use-tool-hotkeys';
import toast from '@/utils/toast';

import ExpenseFormSection from './expense-form-section';
import ExpenseListSection from './expense-list-section';
import useExpenseSplitter from './hooks/use-expense-splitter';
import MemberManagerSection from './member-manager-section';
import SettlementSection from './settlement-section';
import ShareBillModal from './share-bill-modal';

export default function ExpenseSplitter() {
  const { confirm, dialogProps: confirmDialogProps } = useConfirmDialog();

  const {
    workspace,
    summary,
    currencySymbol,
    customCurrencyCode,
    customCurrencySymbol,
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
    setExpenseTitle,
    expenseAmount,
    setExpenseAmount,
    paidById,
    setPaidById,
    splitType,
    setSplitType,
    selectedParticipantIds,
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
    // Share modal
    isShareModalOpen,
    setIsShareModalOpen,
    includeItems,
    setIncludeItems,
    includeBalances,
    setIncludeBalances,
    shareableBillText,
    // Presets & History
    handleResetAll,
    handleSaveSnapshot,
    historyList,
    isLoadingHistory,
    renameHistory,
    removeHistory,
    clearHistory,
    handleRestoreHistory,
  } = useExpenseSplitter();

  const handleRequestResetAll = () => {
    void confirm({
      title: 'Reset Group Workspace',
      message: `Reset the event name, ${workspace.members.length} member${workspace.members.length === 1 ? '' : 's'}, and ${workspace.expenses.length} recorded expense${workspace.expenses.length === 1 ? '' : 's'} back to defaults? This action cannot be undone.`,
      confirmText: 'Reset All',
      cancelText: 'Cancel',
      confirmVariant: 'error',
      onConfirm: () => {
        handleResetAll();
        toast.info('Reset group workspace');
      },
    });
  };

  return (
    <div>
      {/* Header Block with History Drawer & Shortcuts */}
      <HeaderBlock<ExpenseSplitterHistoryData>
        historyList={historyList}
        isLoadingHistory={isLoadingHistory}
        onRestoreHistory={handleRestoreHistory}
        onRenameHistory={renameHistory}
        onRemoveHistory={removeHistory}
        onClearHistory={clearHistory}
        customShortcuts={[
          {
            ...TOOL_HOTKEYS.process,
            label: 'Add Expense / Save Snapshot',
          },
          {
            ...TOOL_HOTKEYS.copy,
            label: 'Copy Bill Summary',
          },
          {
            ...TOOL_HOTKEYS.clear,
            label: 'Reset Current Expense Form',
          },
          TOOL_HOTKEYS.history,
          TOOL_HOTKEYS.help,
        ]}
      />

      <SectionGap size="sm" />

      {/* Desktop 7:5 Split Ledger + Live Digital Receipt */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
        {/* Left Rail: Group Settings, Expense Input & Breakdown */}
        <div className="space-y-6 lg:col-span-7">
          {/* 1. Group & Members Manager */}
          <MemberManagerSection
            eventName={workspace.eventName}
            currency={workspace.currency}
            customCurrencyCode={customCurrencyCode}
            customCurrencySymbol={customCurrencySymbol}
            members={workspace.members}
            newMemberName={newMemberName}
            memberError={memberError}
            hasExpenses={workspace.expenses.length > 0}
            onEventNameChange={handleEventNameChange}
            onCurrencyChange={handleCurrencyChange}
            onCustomCurrencyCodeChange={handleCustomCurrencyCodeChange}
            onCustomCurrencySymbolChange={handleCustomCurrencySymbolChange}
            onNewMemberNameChange={handleNewMemberNameChange}
            onAddMember={handleAddMember}
            onRemoveMember={handleRemoveMember}
            onSaveSnapshot={handleSaveSnapshot}
            onResetAll={handleRequestResetAll}
          />

          {/* 2. Add Expense Form */}
          <ExpenseFormSection
            titleInputRef={expenseTitleInputRef}
            currency={workspace.currency}
            currencySymbol={currencySymbol}
            members={workspace.members}
            expenseTitle={expenseTitle}
            expenseAmount={expenseAmount}
            paidById={paidById}
            splitType={splitType}
            selectedParticipantIds={selectedParticipantIds}
            exactAmounts={exactAmounts}
            exactRemainder={exactRemainder}
            parsedExpenseAmount={parsedExpenseAmount}
            expenseError={expenseError}
            onExpenseTitleChange={setExpenseTitle}
            onExpenseAmountChange={setExpenseAmount}
            onPaidByChange={setPaidById}
            onSplitTypeChange={setSplitType}
            onToggleParticipant={handleToggleParticipant}
            onSelectAllParticipants={handleSelectAllParticipants}
            onExactAmountChange={handleExactAmountChange}
            onFillExactRemainder={handleFillExactRemainder}
            onAddExpense={handleAddExpense}
          />

          {/* 3. Recorded Expense Breakdown */}
          <ExpenseListSection
            expenses={workspace.expenses}
            members={workspace.members}
            currency={workspace.currency}
            currencySymbol={currencySymbol}
            totalSpending={summary.totalSpending}
            onRemoveExpense={handleRemoveExpense}
          />
        </div>

        {/* Right Rail: Sticky Live Digital Receipt & Settlement */}
        <div className="lg:sticky lg:top-24 lg:col-span-5">
          <SettlementSection
            eventName={workspace.eventName}
            memberCount={workspace.members.length}
            expenseCount={workspace.expenses.length}
            summary={summary}
            currency={workspace.currency}
            currencySymbol={currencySymbol}
            hasExpenses={workspace.expenses.length > 0}
            onOpenShareModal={() => setIsShareModalOpen(true)}
          />
        </div>
      </div>

      {/* 5. LINE / Chat Export Modal */}
      <ShareBillModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        includeItems={includeItems}
        onChangeIncludeItems={setIncludeItems}
        includeBalances={includeBalances}
        onChangeIncludeBalances={setIncludeBalances}
        shareableBillText={shareableBillText}
      />

      {/* Reset Workspace Confirmation */}
      <ConfirmDialog {...confirmDialogProps} />
    </div>
  );
}
