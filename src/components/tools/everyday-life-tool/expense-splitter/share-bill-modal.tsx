'use client';

import { MessageSquareShare, RotateCcw } from 'lucide-react';
import { useState } from 'react';

import { CopyAction } from '@/components/shared/action-button';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BaseDialog, DialogHeader } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  includeItems: boolean;
  onChangeIncludeItems: (val: boolean) => void;
  includeBalances: boolean;
  onChangeIncludeBalances: (val: boolean) => void;
  shareableBillText: string;
};

export default function ShareBillModal({
  isOpen,
  onClose,
  includeItems,
  onChangeIncludeItems,
  includeBalances,
  onChangeIncludeBalances,
  shareableBillText,
}: Props) {
  const [customBillText, setCustomBillText] = useState<string | null>(null);

  const displayText = customBillText ?? shareableBillText;
  const isEdited =
    customBillText !== null && customBillText !== shareableBillText;

  const handleClose = () => {
    setCustomBillText(null);
    onClose();
  };

  const handleIncludeItemsChange = (val: boolean) => {
    setCustomBillText(null);
    onChangeIncludeItems(val);
  };

  const handleIncludeBalancesChange = (val: boolean) => {
    setCustomBillText(null);
    onChangeIncludeBalances(val);
  };

  return (
    <BaseDialog
      isOpen={isOpen}
      onClose={handleClose}
      dialogClassName="flex max-h-[85vh] w-full max-w-xl flex-col"
    >
      <DialogHeader
        icon={MessageSquareShare}
        title="Bill Summary"
        description="Customize, edit, and copy a clean settlement message to paste directly into group chats."
        onClose={handleClose}
        closeAriaLabel="Close bill summary dialog"
        className="mx-6 pt-6"
      />

      <div className="flex-1 space-y-4 overflow-y-auto p-6 pt-4">
        {/* Controls Row */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-4">
            <Switch
              size="xs"
              label="Include Items"
              checked={includeItems}
              onChange={handleIncludeItemsChange}
            />
            <Switch
              size="xs"
              label="Include Balances"
              checked={includeBalances}
              onChange={handleIncludeBalancesChange}
            />
          </div>

          {isEdited && (
            <div className="flex items-center gap-1.5">
              <Badge variant="amber" size="xs">
                Edited
              </Badge>
              <Button
                variant="ghost"
                size="xs"
                rounded="lg"
                icon={RotateCcw}
                onClick={() => setCustomBillText(null)}
              >
                Reset
              </Button>
            </div>
          )}
        </div>

        {/* Editable Preview Box */}
        <Textarea
          rows={12}
          value={displayText}
          onChange={(e) => setCustomBillText(e.target.value)}
          className="font-mono text-xs leading-relaxed"
        />

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2">
          <CopyAction
            variant="blue"
            size="sm"
            label="Copy Bill Summary"
            content={displayText}
            successToast="Copied bill summary to clipboard"
          />
        </div>
      </div>
    </BaseDialog>
  );
}
