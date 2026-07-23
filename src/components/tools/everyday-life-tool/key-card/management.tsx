import type { CardData, ContentVersion } from './types';

import { useRef, useState } from 'react';
import {
  Plus,
  Trash2,
  Keyboard,
  RotateCcw,
  Upload,
  Download,
  Info,
  Pencil,
  Copy,
} from 'lucide-react';

import { cn } from '@/utils/cn';
import Button from '@/components/common/button';
import ConfirmDialog from '@/components/common/dialog/confirm';
import {
  TooltipPopup,
  TooltipRoot,
  TooltipTrigger,
} from '@/components/common/tooltip';

type ManagementProps = {
  cards: CardData[];
  listeningCardId: string | null;
  setListeningCardId: (id: string | null) => void;
  onAddCard: () => string;
  onDuplicateCard: (id: string) => string;
  onDeleteCard: (id: string) => void;
  onFieldChange: (id: string, field: keyof CardData, value: string) => void;
  onDeleteAll: () => void;
  onResetInitial: () => void;
  onUpdateContent: (
    id: string,
    index: number,
    field: keyof ContentVersion,
    value: string
  ) => void;
  onAddContent: (id: string) => void;
  onDeleteContent: (id: string, index: number) => void;
  onExport: () => void;
  onImport: (file: File) => void;
  sortOrder: 'asc' | 'desc';
  setSortOrder: (order: 'asc' | 'desc') => void;
};

export default function Management({
  cards,
  listeningCardId,
  setListeningCardId,
  onAddCard,
  onDuplicateCard,
  onDeleteCard,
  onFieldChange,
  onDeleteAll,
  onResetInitial,
  onUpdateContent,
  onAddContent,
  onDeleteContent,
  onExport,
  onImport,
  sortOrder,
  setSortOrder,
}: ManagementProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dialog state hooks
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isDeleteAllConfirmOpen, setIsDeleteAllConfirmOpen] = useState(false);
  const [deleteCardId, setDeleteCardId] = useState<string | null>(null);
  const [deleteVersionTarget, setDeleteVersionTarget] = useState<{
    cardId: string;
    index: number;
  } | null>(null);

  const handleAddCard = () => {
    const newId = onAddCard();
    if (newId && sortOrder === 'asc') {
      setTimeout(() => {
        const element = document.getElementById(newId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  };

  const handleDuplicateCard = (id: string) => {
    const newId = onDuplicateCard(id);
    if (newId && sortOrder === 'asc') {
      setTimeout(() => {
        const element = document.getElementById(newId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  };

  const sortedCards = [...cards];
  if (sortOrder === 'desc') {
    sortedCards.reverse();
  }

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onImport(file);
    e.target.value = ''; // Reset file input
  };

  return (
    <div className="space-y-12">
      {/* Action header bar wrapper */}
      <div className="border-t border-neutral-200 dark:border-neutral-700">
        {/* Info hint text on mobile */}
        <div className="-mb-3 flex items-center gap-1.5 pt-6 text-[11px] text-slate-500 md:hidden dark:text-slate-400">
          <Info
            size={13}
            className="shrink-0 text-slate-400 dark:text-slate-500"
          />
          <span>Import or export from JSON file</span>
        </div>

        <div className={cn('flex items-center justify-between gap-4 pt-6')}>
          {/* Left Side: Import/Export */}
          <div className="flex items-center gap-2">
            {/* Import / Export JSON buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                icon={Upload}
                onClick={handleImportClick}
                className="p-2.5 text-[11px] font-semibold md:px-4 md:py-2"
                iconClassName="mr-0 md:mr-2"
                ariaLabel="Import JSON"
              >
                <span className="hidden md:inline">Import JSON</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                icon={Download}
                onClick={onExport}
                className="p-2.5 text-[11px] font-semibold md:px-4 md:py-2"
                iconClassName="mr-0 md:mr-2"
                ariaLabel="Export JSON"
              >
                <span className="hidden md:inline">Export JSON</span>
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".json"
                onChange={handleFileChange}
              />
            </div>
          </div>

          {/* Right Side: Actions (Delete All, Reset, Add) */}
          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="error"
              size="sm"
              icon={Trash2}
              onClick={() => setIsDeleteAllConfirmOpen(true)}
              className="p-2.5 text-xs font-semibold md:px-4 md:py-2"
              iconClassName="mr-0 md:mr-2"
              ariaLabel="Delete All"
            >
              <span className="hidden md:inline">Delete All</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={RotateCcw}
              onClick={() => setIsResetConfirmOpen(true)}
              className="p-2.5 text-xs font-semibold md:px-4 md:py-2"
              iconClassName="mr-0 md:mr-2"
              ariaLabel="Reset"
            >
              <span className="hidden md:inline">Reset</span>
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={handleAddCard}
              className="p-2.5 text-xs font-semibold md:px-4 md:py-2"
              ariaLabel="Add Card"
            >
              <span>
                Add<span className="hidden md:inline"> Card</span>
              </span>
            </Button>
          </div>
        </div>
      </div>

      {/* Cards Form list */}
      <div className="space-y-4">
        {/* Sorting controls row */}
        <div className="flex items-center justify-end gap-2.5 px-1 text-xs text-slate-500 dark:text-slate-400">
          <span className="font-semibold">Sort By:</span>
          <div className="inline-flex rounded-xl border border-neutral-200/50 bg-neutral-100/80 p-1 backdrop-blur-sm dark:border-neutral-700/50 dark:bg-neutral-800/80">
            <button
              type="button"
              onClick={() => setSortOrder('asc')}
              className={cn(
                'rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-200',
                sortOrder === 'asc'
                  ? 'bg-white text-sky-600 shadow-sm dark:bg-neutral-900 dark:text-sky-500'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              )}
            >
              Ascending
            </button>
            <button
              type="button"
              onClick={() => setSortOrder('desc')}
              className={cn(
                'rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-200',
                sortOrder === 'desc'
                  ? 'bg-white text-sky-600 shadow-sm dark:bg-neutral-900 dark:text-sky-500'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              )}
            >
              Descending
            </button>
          </div>
        </div>

        {sortedCards.map((card, index) => (
          <div
            key={card.id}
            id={card.id}
            className={cn(
              'relative space-y-4 rounded-2xl border p-5 shadow-sm duration-300 animate-in fade-in',
              'border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900/45'
            )}
          >
            {/* Form header: Index, Title input, key-binding trigger & delete button */}
            <div
              className={cn(
                'flex flex-col justify-between gap-4 border-b pb-3 sm:flex-row sm:items-center',
                'border-neutral-100 dark:border-neutral-700/85'
              )}
            >
              <div className="flex flex-1 items-center gap-2">
                <span
                  className={cn(
                    'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
                    'bg-neutral-100 text-slate-500 dark:bg-neutral-700 dark:text-slate-400'
                  )}
                >
                  {sortOrder === 'desc' ? cards.length - index : index + 1}
                </span>
                <div className="group/title relative flex flex-1 items-center">
                  <input
                    type="text"
                    value={card.title}
                    onChange={(e) =>
                      onFieldChange(card.id, 'title', e.target.value)
                    }
                    placeholder="Enter card title..."
                    className={cn(
                      'w-full border-b border-transparent bg-transparent py-0.5 pl-1 pr-6 text-sm font-bold outline-none transition-all',
                      'text-slate-900 dark:text-slate-100',
                      'focus:border-neutral-400 dark:focus:border-neutral-600'
                    )}
                  />
                  <Pencil
                    size={12}
                    className="pointer-events-none absolute right-1 text-slate-400 opacity-0 transition-opacity group-focus-within/title:opacity-0 group-hover/title:opacity-100"
                  />
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2.5 self-end sm:self-auto">
                {/* Hotkey binder trigger */}
                <button
                  onClick={() =>
                    setListeningCardId(
                      listeningCardId === card.id ? null : card.id
                    )
                  }
                  className={cn(
                    'flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-bold shadow-sm transition-all',
                    listeningCardId === card.id
                      ? 'animate-pulse border-sky-500 bg-sky-500 text-white'
                      : card.key
                        ? 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-900/20 dark:text-sky-500'
                        : 'border-neutral-200 bg-neutral-50 text-slate-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-slate-400'
                  )}
                >
                  <Keyboard size={13} />
                  {listeningCardId === card.id
                    ? 'Press any A-Z or 0-9 key...'
                    : card.key
                      ? `Key: [ ${card.key.toUpperCase()} ]`
                      : 'Bind Hotkey'}
                </button>

                <Button
                  variant="outline"
                  size="xs"
                  icon={Copy}
                  onClick={() => handleDuplicateCard(card.id)}
                  ariaLabel="Duplicate card"
                />

                <Button
                  variant="error"
                  size="xs"
                  icon={Trash2}
                  onClick={() => setDeleteCardId(card.id)}
                  ariaLabel="Delete card"
                />
              </div>
            </div>

            {/* Tags and content details grid */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Tags comma split input */}
              <div className="col-span-1 space-y-2 md:col-span-2">
                <label
                  className={cn(
                    'flex items-center gap-2 text-xs font-semibold',
                    'text-slate-500 dark:text-slate-400'
                  )}
                >
                  Tags
                  <TooltipRoot>
                    <TooltipTrigger>
                      <button className="opacity-80">
                        <Info size={12} strokeWidth={3} />
                      </button>
                    </TooltipTrigger>
                    <TooltipPopup
                      showArrow
                      placement="top"
                      className="z-50"
                      arrowClassName={cn(
                        'border-b border-r border-neutral-700/80 bg-neutral-900',
                        'dark:border-neutral-700 dark:bg-neutral-800'
                      )}
                    >
                      <div
                        className={cn(
                          'max-w-xs rounded-xl border px-3.5 py-2.5 text-xs leading-relaxed shadow-xl',
                          'border-neutral-700/80 bg-neutral-900 text-slate-100',
                          'dark:border-neutral-700 dark:bg-neutral-800 dark:text-slate-200'
                        )}
                      >
                        Separate multiple tags with commas.
                      </div>
                    </TooltipPopup>
                  </TooltipRoot>
                </label>
                <input
                  type="text"
                  value={card.tags}
                  onChange={(e) =>
                    onFieldChange(card.id, 'tags', e.target.value)
                  }
                  placeholder="e.g. General, Task, Notes"
                  className={cn(
                    'w-full rounded-lg border bg-white/30 px-3 py-1.5 text-sm text-slate-800 outline-none transition-all',
                    'border-neutral-200 dark:border-neutral-700 dark:bg-neutral-900/30 dark:text-slate-200',
                    'focus:border-sky-500/20 focus:ring-2 focus:ring-sky-500/20'
                  )}
                />
              </div>

              {/* Dynamic Content Versions */}
              <div className="col-span-1 space-y-2 md:col-span-2">
                <div className="flex items-center justify-between pb-1.5">
                  <span
                    className={cn(
                      'flex items-center gap-1.5 text-xs font-bold',
                      'text-slate-500 dark:text-slate-400'
                    )}
                  >
                    Contents ({card.contents ? card.contents.length : 0})
                    <TooltipRoot>
                      <TooltipTrigger>
                        <button className="opacity-80">
                          <Info size={12} strokeWidth={3} />
                        </button>
                      </TooltipTrigger>
                      <TooltipPopup
                        showArrow
                        placement="top"
                        className="z-50"
                        arrowClassName={cn(
                          'border-b border-r border-neutral-700/80 bg-neutral-900',
                          'dark:border-neutral-700 dark:bg-neutral-800'
                        )}
                      >
                        <div
                          className={cn(
                            'max-w-xs rounded-xl border px-3.5 py-2.5 text-xs font-normal leading-relaxed shadow-xl',
                            'border-neutral-700/80 bg-neutral-900 text-slate-100',
                            'dark:border-neutral-700 dark:bg-neutral-800 dark:text-slate-200'
                          )}
                        >
                          Supports Markdown formatting, which will be rendered
                          in the details view on the Dashboard.
                        </div>
                      </TooltipPopup>
                    </TooltipRoot>
                  </span>
                  <Button
                    variant="outline"
                    size="xs"
                    icon={Plus}
                    onClick={() => onAddContent(card.id)}
                    className="px-2 py-0.5 text-[10px] font-semibold"
                  >
                    Add Content
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {card.contents &&
                    card.contents.map((version, versionIdx) => (
                      <div
                        key={versionIdx}
                        className={cn(
                          'group/version relative space-y-2 rounded-xl border p-3',
                          'border-neutral-200 bg-neutral-50/30',
                          'dark:border-neutral-700 dark:bg-neutral-900/10'
                        )}
                      >
                        <div className="flex items-center justify-between gap-2">
                          {/* Version label edit */}
                          <div className="group/label relative flex flex-1 items-center">
                            <input
                              type="text"
                              value={version.label}
                              onChange={(e) =>
                                onUpdateContent(
                                  card.id,
                                  versionIdx,
                                  'label',
                                  e.target.value
                                )
                              }
                              placeholder="Name (e.g. Version A)..."
                              className={cn(
                                'w-full border-b border-transparent bg-transparent pl-2 pr-6 text-xs font-bold outline-none transition-all',
                                'text-slate-700 focus:border-neutral-400',
                                'dark:text-slate-300 dark:focus:border-neutral-600'
                              )}
                            />
                            <Pencil
                              size={11}
                              className="pointer-events-none absolute right-1 text-slate-400 opacity-0 transition-opacity group-focus-within/label:opacity-0 group-hover/label:opacity-100"
                            />
                          </div>

                          {/* Delete version if count > 1 */}
                          {card.contents.length > 1 && (
                            <button
                              onClick={() =>
                                setDeleteVersionTarget({
                                  cardId: card.id,
                                  index: versionIdx,
                                })
                              }
                              className={cn(
                                'p-0.5 transition-opacity hover:text-red-500 group-hover/version:opacity-100 sm:opacity-0',
                                'text-slate-455'
                              )}
                              title="Delete this version"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>

                        <textarea
                          value={version.text}
                          onChange={(e) =>
                            onUpdateContent(
                              card.id,
                              versionIdx,
                              'text',
                              e.target.value
                            )
                          }
                          placeholder="Enter content details here..."
                          rows={10}
                          className={cn(
                            'w-full resize-none rounded-lg border bg-white/30 px-2.5 py-1.5 text-xs outline-none transition-all focus:border-sky-500 focus:ring-1 focus:ring-sky-500/20',
                            'border-neutral-200 dark:border-neutral-700 dark:bg-neutral-900/20',
                            'text-slate-855 dark:text-slate-250'
                          )}
                        />
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        ))}

        {cards.length === 0 && (
          <div
            className={cn(
              'flex flex-col items-center justify-center rounded-2xl border-2 border-dashed py-20 text-center',
              'border-neutral-200 dark:border-neutral-700'
            )}
          >
            <Plus
              size={48}
              className="text-slate-350 mb-3 animate-pulse dark:text-slate-700"
            />
            <p className="text-base font-semibold text-slate-500 dark:text-slate-400">
              No cards in management. Click Add Card in the top right to get
              started!
            </p>
          </div>
        )}
      </div>

      {/* Delete Card Confirm Dialog */}
      <ConfirmDialog
        isOpen={deleteCardId !== null}
        onClose={() => setDeleteCardId(null)}
        onConfirm={() => {
          if (deleteCardId) onDeleteCard(deleteCardId);
        }}
        title="Delete Card"
        message="Are you sure you want to delete this card? This action cannot be undone."
        confirmText="Delete"
      />

      {/* Delete Version Confirm Dialog */}
      <ConfirmDialog
        isOpen={deleteVersionTarget !== null}
        onClose={() => setDeleteVersionTarget(null)}
        onConfirm={() => {
          if (deleteVersionTarget) {
            onDeleteContent(
              deleteVersionTarget.cardId,
              deleteVersionTarget.index
            );
          }
        }}
        title="Delete Content Version"
        message="Are you sure you want to delete this content version?"
        confirmText="Delete"
      />

      {/* Delete All Confirm Dialog */}
      <ConfirmDialog
        isOpen={isDeleteAllConfirmOpen}
        onClose={() => setIsDeleteAllConfirmOpen(false)}
        onConfirm={onDeleteAll}
        title="Delete All Cards"
        message="Are you sure you want to delete all cards? This will completely clear your library."
        confirmText="Delete All"
      />

      {/* Reset Confirm Dialog */}
      <ConfirmDialog
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={onResetInitial}
        title="Reset Library"
        message="Are you sure you want to reset your cards? This will restore the default example card and delete all of your current cards."
        confirmText="Reset"
      />
    </div>
  );
}
