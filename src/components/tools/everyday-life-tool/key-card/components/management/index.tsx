'use client';

import type { CardData, ContentVersion, SortOrderOption } from '../../types';

import { useRef, useState } from 'react';
import { DragDropProvider, DragEndEvent } from '@dnd-kit/react';
import { move } from '@dnd-kit/helpers';

import { ConfirmDialog } from '@/components/ui/dialog';

import { ManagementToolbar } from './management-toolbar';
import { ManagementCardItem } from './management-card-item';
import { ManagementImportModal } from './management-import-modal';
import { ManagementEmptyState } from './management-empty-state';

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
  onDuplicateContent: (id: string, index: number) => void;
  onDeleteContent: (id: string, index: number) => void;
  onReorderCards?: (cards: CardData[]) => void;
  onExport: () => void;
  onImport: (file: File, mode: 'replace' | 'merge') => void;
  sortOrder: SortOrderOption;
  setSortOrder: (order: SortOrderOption) => void;
  collapsedCards: string[];
  onToggleCollapse: (cardId: string) => void;
  onSetAllCollapsed: (collapsed: boolean, cardIds: string[]) => void;
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
  onDuplicateContent,
  onDeleteContent,
  onReorderCards,
  onExport,
  onImport,
  sortOrder,
  setSortOrder,
  collapsedCards,
  onToggleCollapse,
  onSetAllCollapsed,
}: ManagementProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [managementSearch, setManagementSearch] = useState('');
  const [activePreviewTabs, setActivePreviewTabs] = useState<
    Record<string, 'edit' | 'preview'>
  >({});

  // Dialog state hooks
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isDeleteAllConfirmOpen, setIsDeleteAllConfirmOpen] = useState(false);
  const [deleteCardId, setDeleteCardId] = useState<string | null>(null);
  const [deleteVersionTarget, setDeleteVersionTarget] = useState<{
    cardId: string;
    index: number;
  } | null>(null);

  // Import Dialog state
  const [pendingImportFile, setPendingImportFile] = useState<File | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const handleAddCard = () => {
    const newId = onAddCard();
    if (newId) {
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
    if (newId) {
      setTimeout(() => {
        const element = document.getElementById(newId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingImportFile(file);
    setIsImportModalOpen(true);
    e.target.value = ''; // Reset file input
  };

  const confirmImport = (mode: 'replace' | 'merge') => {
    if (pendingImportFile) {
      onImport(pendingImportFile, mode);
    }
    setIsImportModalOpen(false);
    setPendingImportFile(null);
  };

  // Filter cards in management mode
  const filteredCards = cards.filter((card) => {
    const q = managementSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      card.title.toLowerCase().includes(q) ||
      card.tags.toLowerCase().includes(q) ||
      card.key.toLowerCase().includes(q) ||
      card.contents.some(
        (c) =>
          c.label.toLowerCase().includes(q) || c.text.toLowerCase().includes(q)
      )
    );
  });

  // Sort cards based on sortOrder
  const sortedCards = (() => {
    const list = [...filteredCards];
    if (sortOrder === 'desc') {
      return list.reverse();
    }
    return list.sort((a, b) => {
      if (sortOrder === 'title-asc' || sortOrder === 'title') {
        return a.title.localeCompare(b.title);
      }
      if (sortOrder === 'title-desc') {
        return b.title.localeCompare(a.title);
      }
      if (sortOrder === 'hotkey-asc' || sortOrder === 'hotkey') {
        if (!a.key && !b.key) return 0;
        if (!a.key) return 1;
        if (!b.key) return -1;
        return a.key.localeCompare(b.key);
      }
      if (sortOrder === 'hotkey-desc') {
        if (!a.key && !b.key) return 0;
        if (!a.key) return 1;
        if (!b.key) return -1;
        return b.key.localeCompare(a.key);
      }
      return 0;
    });
  })();

  const allCardIds = cards.map((c) => c.id);
  const isAllCollapsed =
    allCardIds.length > 0 &&
    allCardIds.every((id) => collapsedCards.includes(id));

  const toggleVersionPreview = (key: string, mode: 'edit' | 'preview') => {
    setActivePreviewTabs((prev) => ({ ...prev, [key]: mode }));
  };

  const isManualReorderEnabled =
    sortOrder === 'asc' && !managementSearch.trim();

  const onDndKitDragEnd = (event: DragEndEvent) => {
    if (!isManualReorderEnabled || !onReorderCards) return;
    const updated = move(cards, event);
    if (updated !== cards) {
      onReorderCards(updated);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action Header Bar */}
      <ManagementToolbar
        search={managementSearch}
        onSearchChange={setManagementSearch}
        cardsCount={cards.length}
        filteredCount={sortedCards.length}
        isAllCollapsed={isAllCollapsed}
        onToggleAllCollapsed={() =>
          onSetAllCollapsed(!isAllCollapsed, allCardIds)
        }
        sortOrder={sortOrder}
        onSortOrderChange={setSortOrder}
        onImportClick={handleImportClick}
        onExport={onExport}
        onResetClick={() => setIsResetConfirmOpen(true)}
        onDeleteAllClick={() => setIsDeleteAllConfirmOpen(true)}
        onAddCard={handleAddCard}
        fileInputRef={fileInputRef}
        onFileChange={handleFileChange}
      />

      {/* dnd kit */}
      <DragDropProvider onDragEnd={onDndKitDragEnd}>
        {/* Cards Form List or Empty State */}
        <div className="space-y-4">
          {sortedCards.map((card, index) => (
            <ManagementCardItem
              key={card.id}
              id={card.id}
              card={card}
              index={index}
              isCollapsed={collapsedCards.includes(card.id)}
              isListening={listeningCardId === card.id}
              isManualReorderEnabled={isManualReorderEnabled}
              activePreviewTabs={activePreviewTabs}
              onToggleCollapse={onToggleCollapse}
              onFieldChange={onFieldChange}
              onToggleListening={(id) =>
                setListeningCardId(listeningCardId === id ? null : id)
              }
              onDuplicateCard={handleDuplicateCard}
              onDeleteCardClick={setDeleteCardId}
              onAddContent={onAddContent}
              onUpdateContent={onUpdateContent}
              onDuplicateContent={onDuplicateContent}
              onDeleteContentClick={(cardId, vIdx) =>
                setDeleteVersionTarget({ cardId, index: vIdx })
              }
              onToggleVersionPreview={toggleVersionPreview}
            />
          ))}

          {cards.length === 0 && <ManagementEmptyState />}
        </div>
      </DragDropProvider>

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
        message="Are you sure you want to reset your cards? This will restore the default example card and remove custom cards."
        confirmText="Reset"
      />

      {/* Smart Import Options Modal */}
      <ManagementImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        pendingFile={pendingImportFile}
        onConfirmImport={confirmImport}
      />
    </div>
  );
}
