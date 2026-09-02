import {
  ChevronDown,
  ChevronUp,
  Pencil,
  Check,
  X,
  Keyboard,
  Copy,
  Trash2,
  GripVertical,
} from 'lucide-react';
import type { CardData } from '../../types';
import { cn } from '@/utils/cn';
import { Badge } from '@/components/common/badge';
import { Button } from '@/components/common/button';
import {
  TooltipPopup,
  TooltipRoot,
  TooltipTrigger,
} from '@/components/common/tooltip';
import { Ref, useState } from 'react';

type ManagementCardHeaderProps = {
  handleRef: Ref<HTMLButtonElement>;
  card: CardData;
  index: number;
  isCollapsed: boolean;
  isListening: boolean;
  isManualReorderEnabled: boolean;
  onToggleCollapse: () => void;
  onTitleChange: (val: string) => void;
  onToggleListening: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
};

export function ManagementCardHeader({
  handleRef,
  card,
  index,
  isCollapsed,
  isListening,
  isManualReorderEnabled,
  onToggleCollapse,
  onTitleChange,
  onToggleListening,
  onDuplicate,
  onDelete,
}: ManagementCardHeaderProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(card.title);

  const handleStartEdit = () => {
    setTempTitle(card.title);
    setIsEditingTitle(true);
  };

  const handleSaveEdit = () => {
    const trimmed = tempTitle.trim();
    onTitleChange(trimmed || 'Untitled Card');
    setIsEditingTitle(false);
  };

  const handleCancelEdit = () => {
    setTempTitle(card.title);
    setIsEditingTitle(false);
  };

  const summaryTags = card.tags
    ? card.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
        .slice(0, 2)
    : [];

  return (
    <div
      className={cn(
        'flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between',
        !isCollapsed && 'border-b border-neutral-100 dark:border-neutral-800/80'
      )}
    >
      {/* Left: Collapse toggle, Index, Title */}
      <div className="flex flex-1 items-center gap-2.5">
        <Button
          variant="ghost"
          size="xs"
          rounded="lg"
          icon={isCollapsed ? ChevronDown : ChevronUp}
          onClick={onToggleCollapse}
          title={isCollapsed ? 'Expand card' : 'Collapse card'}
          ariaLabel={isCollapsed ? 'Expand card' : 'Collapse card'}
          className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
        />

        <span
          className={cn(
            'flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-mono text-xs font-semibold',
            'bg-neutral-100 text-slate-600 dark:bg-neutral-800 dark:text-slate-400'
          )}
        >
          {index + 1}
        </span>

        {isEditingTitle ? (
          <div
            className="flex max-w-sm flex-1 items-center gap-1.5"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              type="text"
              value={tempTitle}
              onChange={(e) => setTempTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveEdit();
                if (e.key === 'Escape') handleCancelEdit();
              }}
              onBlur={handleSaveEdit}
              placeholder="Enter card title..."
              autoFocus
              className="w-full rounded-lg border border-sky-500/80 bg-white px-2.5 py-1 text-sm font-bold text-slate-900 outline-none ring-2 ring-sky-500/20 dark:border-sky-500/80 dark:bg-neutral-800 dark:text-slate-100"
            />
            <button
              type="button"
              onClick={handleSaveEdit}
              className="rounded-lg p-1 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
              title="Save title"
              aria-label="Save title"
            >
              <Check size={14} />
            </button>
            <button
              type="button"
              onClick={handleCancelEdit}
              className="rounded-lg p-1 text-slate-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              title="Cancel"
              aria-label="Cancel editing"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <div className="group/title flex max-w-sm items-center gap-1.5 overflow-hidden">
            <span
              onClick={handleStartEdit}
              className={cn(
                'cursor-pointer truncate text-sm font-bold text-slate-900 transition-colors hover:text-sky-600 dark:text-slate-100 dark:hover:text-sky-400',
                !card.title && 'italic opacity-50'
              )}
              title="Click to rename"
            >
              {card.title || 'Untitled Card'}
            </span>
            <button
              type="button"
              onClick={handleStartEdit}
              className="rounded p-1 text-slate-400 opacity-0 transition-opacity hover:bg-neutral-100 hover:text-slate-700 group-hover/title:opacity-100 dark:hover:bg-neutral-800 dark:hover:text-slate-200"
              title="Rename card"
              aria-label="Rename card"
            >
              <Pencil size={12} />
            </button>
          </div>
        )}

        {/* Summary Badges when Collapsed */}
        {isCollapsed && (
          <div className="hidden items-center gap-2 sm:flex">
            {summaryTags.map((tag) => (
              <Badge key={tag} variant="blue" size="xs">
                {tag}
              </Badge>
            ))}
            <span className="text-[11px] font-medium text-slate-400">
              {card.contents?.length || 0} tabs
            </span>
          </div>
        )}
      </div>

      {/* Right: Hotkey Button, Duplicate, Delete, Grip */}
      <div className="flex shrink-0 items-center gap-1.5 self-end sm:self-auto">
        {/* Hotkey Binder Button */}
        <TooltipRoot delay={{ open: 300 }}>
          <TooltipTrigger>
            <span className="inline-flex">
              <Button
                size="xs"
                rounded="xl"
                variant={isListening ? 'primary' : 'outline'}
                icon={Keyboard}
                onClick={onToggleListening}
                className={cn(
                  'shadow-2xs text-xs font-semibold transition-all',
                  isListening
                    ? 'animate-pulse'
                    : 'text-slate-600 hover:border-sky-300 hover:bg-sky-50/50 hover:text-sky-600 dark:text-slate-300 dark:hover:border-sky-800 dark:hover:bg-sky-950/30 dark:hover:text-sky-400'
                )}
                ariaLabel={
                  isListening
                    ? 'Listening for shortcut key'
                    : card.key
                      ? `Bound to ${card.key.toUpperCase()}`
                      : 'Bind keyboard shortcut'
                }
              >
                {isListening
                  ? 'Press key...'
                  : card.key
                    ? `Key: [ ${card.key.toUpperCase()} ]`
                    : 'Bind Key'}
              </Button>
            </span>
          </TooltipTrigger>
          <TooltipPopup
            showArrow
            placement="top"
            variant="dark"
            className="max-w-xs px-2.5 py-1.5 text-[11px] font-medium leading-normal"
          >
            {isListening
              ? 'Press any single key (A-Z, 0-9) to bind, or ESC to cancel.'
              : 'Click to record shortcut key (A-Z, 0-9). Press ESC while recording to cancel.'}
          </TooltipPopup>
        </TooltipRoot>

        {/* Duplicate */}
        <Button
          variant="outline"
          size="xs"
          icon={Copy}
          onClick={onDuplicate}
          ariaLabel="Duplicate card"
        />

        {/* Delete */}
        <Button
          variant="outline"
          size="xs"
          icon={Trash2}
          onClick={onDelete}
          ariaLabel="Delete card"
          className={cn(
            'transition-colors',
            'hover:border-rose-300 dark:hover:border-rose-900/60',
            'hover:bg-rose-50 dark:hover:bg-rose-950/40',
            'hover:text-rose-600 dark:hover:text-rose-400'
          )}
        />

        {/* Grip */}
        <TooltipRoot delay={{ open: 300 }}>
          <TooltipTrigger>
            <span className="inline-flex">
              <Button
                ref={handleRef}
                size="xs"
                variant="neutral"
                icon={GripVertical}
                disabled={!isManualReorderEnabled}
                className={cn(
                  isManualReorderEnabled
                    ? 'cursor-grab active:cursor-grabbing'
                    : 'cursor-not-allowed opacity-30'
                )}
                ariaLabel={
                  isManualReorderEnabled
                    ? 'Drag to reorder card'
                    : 'Reordering disabled'
                }
              />
            </span>
          </TooltipTrigger>
          {!isManualReorderEnabled && (
            <TooltipPopup
              showArrow
              placement="top"
              variant="dark"
              className="max-w-xs px-2.5 py-1.5 text-[11px] font-medium leading-normal"
            >
              Sorting or filtering active. Switch to Default (Asc) to reorder
              cards.
            </TooltipPopup>
          )}
        </TooltipRoot>
      </div>
    </div>
  );
}
