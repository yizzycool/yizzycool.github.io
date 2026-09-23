'use client';

import type { LucideIcon } from 'lucide-react';

import { MoreHorizontal } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Dropdown } from '@/components/ui/dropdown';
import { cn } from '@/utils/cn';

type ActionButtonProps = {
  label: string;
  Icon: LucideIcon;
  onClick: () => void;
  isActive?: boolean;
  isDanger?: boolean;
};

function ActionButton({
  label,
  Icon,
  onClick,
  isActive = false,
  isDanger = false,
}: ActionButtonProps) {
  return (
    <Button
      variant="ghost"
      title={label}
      icon={Icon}
      onClick={onClick}
      className={cn(
        '!h-8 !min-h-8 !w-8 !min-w-8 !p-0 transition-all duration-150',
        isDanger
          ? '!text-neutral-500 hover:!bg-red-50 hover:!text-red-600 dark:hover:!bg-red-950/40 dark:hover:!text-red-400'
          : isActive
            ? '!bg-sky-500 !text-white shadow-sm shadow-sky-500/30'
            : '!text-neutral-600 hover:!bg-neutral-100 hover:!text-neutral-900 dark:!text-neutral-400 dark:hover:!bg-neutral-800 dark:hover:!text-neutral-100'
      )}
    />
  );
}

export type ToolbarAction = {
  id: string;
  label: string;
  Icon: LucideIcon;
  onClick: () => void;
  isActive?: boolean;
  isDanger?: boolean;
};

export type ActionToolbarListProps = {
  actions: ToolbarAction[];
};

export function ActionToolbarList({ actions }: ActionToolbarListProps) {
  if (actions.length <= 6) {
    return (
      <div className="flex w-full items-center justify-between gap-1">
        {actions.map((action) => (
          <ActionButton
            key={action.id}
            label={action.label}
            Icon={action.Icon}
            onClick={action.onClick}
            isActive={action.isActive}
            isDanger={action.isDanger}
          />
        ))}
      </div>
    );
  }

  const primaryActions = actions.slice(0, 5);
  const overflowActions = actions.slice(5);
  const isOverflowActive = overflowActions.some((a) => a.isActive);

  const overflowDropdownItems = overflowActions.map((action) => ({
    id: action.id,
    label: action.label,
    icon: action.Icon,
    isActive: action.isActive,
    isDanger: action.isDanger,
    onClick: action.onClick,
  }));

  return (
    <div className="flex w-full items-center justify-between gap-1">
      {primaryActions.map((action) => (
        <ActionButton
          key={action.id}
          label={action.label}
          Icon={action.Icon}
          onClick={action.onClick}
          isActive={action.isActive}
          isDanger={action.isDanger}
        />
      ))}

      <Dropdown
        trigger={
          <ActionButton
            label="More Actions"
            Icon={MoreHorizontal}
            onClick={() => {}}
            isActive={isOverflowActive}
          />
        }
        items={overflowDropdownItems}
        placement="bottom end"
        modal={false}
      />
    </div>
  );
}
