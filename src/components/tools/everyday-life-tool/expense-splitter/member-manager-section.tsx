'use client';

import type { KeyboardEvent } from 'react';
import type { CurrencyCode, ExpenseMember } from './types';

import { BookmarkPlus, UserPlus, Users } from 'lucide-react';

import { DeleteAction } from '@/components/shared/action-button';
import {
  InsetGroup,
  InsetGroupRow,
} from '@/components/tools/common/inset-group';
import LabelBar from '@/components/tools/common/label-bar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Selector } from '@/components/ui/selector';

import { CURRENCY_OPTIONS } from './constants';
import MemberChipItem from './member-chip-item';

type Props = {
  eventName: string;
  currency: CurrencyCode;
  customCurrencyCode: string;
  customCurrencySymbol: string;
  members: ExpenseMember[];
  newMemberName: string;
  memberError: string | null;
  hasExpenses: boolean;
  onEventNameChange: (value: string) => void;
  onCurrencyChange: (value: string) => void;
  onCustomCurrencyCodeChange: (value: string) => void;
  onCustomCurrencySymbolChange: (value: string) => void;
  onNewMemberNameChange: (value: string) => void;
  onAddMember: () => void;
  onRemoveMember: (id: string) => void;
  onSaveSnapshot: () => void;
  onResetAll: () => void;
};

export default function MemberManagerSection({
  eventName,
  currency,
  customCurrencyCode,
  customCurrencySymbol,
  members,
  newMemberName,
  memberError,
  hasExpenses,
  onEventNameChange,
  onCurrencyChange,
  onCustomCurrencyCodeChange,
  onCustomCurrencySymbolChange,
  onNewMemberNameChange,
  onAddMember,
  onRemoveMember,
  onSaveSnapshot,
  onResetAll,
}: Props) {
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onAddMember();
    }
  };

  return (
    <div>
      <LabelBar
        icon={Users}
        label="Group & Members"
        description="Name your event, pick a currency, and add everyone splitting the bill."
        actions={
          <div className="flex flex-wrap items-center gap-1.5">
            <Button
              variant="outline"
              size="xs"
              rounded="lg"
              icon={BookmarkPlus}
              disabled={!hasExpenses}
              onClick={onSaveSnapshot}
              title="Save entire event, members, and expenses to History"
            >
              Save Snapshot
            </Button>
            <DeleteAction
              label="Reset All"
              onClick={onResetAll}
              successToast={false}
            />
          </div>
        }
      />

      <InsetGroup rounded="2xl">
        {/* Row 1: Event Name & Currency */}
        <InsetGroupRow hoverable={false}>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
            <div className="sm:col-span-3">
              <Input
                id="expense-event-name"
                title="Event Name"
                value={eventName}
                onChange={(e) => onEventNameChange(e.target.value)}
                onClear={() => onEventNameChange('')}
                placeholder="e.g. Tokyo Trip, Roommate Bills..."
              />
            </div>
            <div>
              <Selector
                title="Currency"
                value={currency}
                options={CURRENCY_OPTIONS}
                onChange={onCurrencyChange}
              />
            </div>
          </div>

          {currency === 'CUSTOM' && (
            <div className="mt-3 grid grid-cols-1 gap-3 rounded-lg bg-neutral-100/70 p-2.5 sm:grid-cols-2 dark:bg-neutral-800/50">
              <Input
                id="expense-custom-currency-code"
                title="Custom Currency Code"
                value={customCurrencyCode}
                onChange={(e) => onCustomCurrencyCodeChange(e.target.value)}
                onClear={() => onCustomCurrencyCodeChange('')}
                placeholder="e.g. CAD, AUD, THB, SGD..."
              />
              <Input
                id="expense-custom-currency-symbol"
                title="Custom Currency Symbol"
                value={customCurrencySymbol}
                onChange={(e) => onCustomCurrencySymbolChange(e.target.value)}
                onClear={() => onCustomCurrencySymbolChange('')}
                placeholder="e.g. CA$, A$, ฿, S$..."
              />
            </div>
          )}
        </InsetGroupRow>

        {/* Row 2: Member List & Add Input */}
        <InsetGroupRow hoverable={false}>
          <div className="space-y-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
              <div className="flex-1">
                <Input
                  id="expense-new-member"
                  value={newMemberName}
                  onChange={(e) => onNewMemberNameChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Add member name (press Enter)..."
                  errorMessage={memberError}
                />
              </div>
              <Button
                variant="primary"
                size="sm"
                rounded="xl"
                icon={UserPlus}
                onClick={onAddMember}
                disabled={!newMemberName.trim()}
                className="shrink-0 font-medium sm:mt-1.5"
              >
                Add Member
              </Button>
            </div>

            {members.length === 0 ? (
              <p className="pt-0.5 text-xs text-slate-400 dark:text-slate-500">
                No members added yet. Add at least 2 members above to start
                splitting expenses.
              </p>
            ) : (
              <div className="flex flex-wrap items-center gap-2 pt-0.5">
                {members.map((member) => (
                  <MemberChipItem
                    key={member.id}
                    member={member}
                    canRemove
                    onRemove={onRemoveMember}
                  />
                ))}
              </div>
            )}
          </div>
        </InsetGroupRow>
      </InsetGroup>
    </div>
  );
}
