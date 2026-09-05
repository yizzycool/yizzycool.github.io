'use client';

import type { LucideIcon } from 'lucide-react';
import type { ButtonVariant } from '@/types/common/button';

import { size } from 'lodash';

import { cn } from '@/utils/cn';
import { TOOL_HOTKEYS } from '@/hooks/tools/use-tool-hotkeys';
import { Button } from '@/components/ui/button';
import { HotkeyBadge } from '@/components/ui/badge';

type Props = {
  label: string;
  onClick: () => void;
  icon?: LucideIcon;
  disabled?: boolean;
  text?: string;
  charCount?: number;
  showCharCount?: boolean;
  hotkeyLabel?: string;
  variant?: ButtonVariant;
  className?: string;
  extraActions?: React.ReactNode;
};

export default function ExecuteBar({
  label,
  onClick,
  icon,
  disabled = false,
  text,
  charCount,
  showCharCount = true,
  hotkeyLabel = 'Process',
  variant = 'blue',
  className,
  extraActions,
}: Props) {
  const count =
    typeof charCount === 'number'
      ? charCount
      : typeof text === 'string'
        ? size(text)
        : 0;

  return (
    <div
      className={cn(
        'mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between',
        className
      )}
    >
      <div className="flex items-center gap-3">
        <Button
          variant={variant}
          size="sm"
          rounded="lg"
          icon={icon}
          disabled={disabled}
          onClick={onClick}
        >
          {label}
        </Button>
        <HotkeyBadge
          items={[{ ...TOOL_HOTKEYS.process, label: hotkeyLabel }]}
        />
        {extraActions}
      </div>
      {showCharCount && (
        <div className="text-right text-xs text-slate-400 dark:text-slate-500">
          {count} chars
        </div>
      )}
    </div>
  );
}
