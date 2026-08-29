'use client';

import type { CardData } from './types';

import { Info } from 'lucide-react';
import { useState } from 'react';

import { useKeyCards } from './hooks/use-key-cards';
import { useKeyCardShortcuts } from './hooks/use-key-card-shortcuts';
import Snackbar from '@/components/common/snackbar';
import HeaderBlock from '../../common/header-block';
import SectionGap from '../../common/section-gap';
import Toolbar from './toolbar';
import Dashboard from './dashboard';
import Management from './management';
import FocusModal from './focus-modal';

export default function KeyCard() {
  const [mode, setMode] = useState<'dashboard' | 'management'>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCompact, setIsCompact] = useState(false);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Snackbar feedback states
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');
  const [snackbarVariant, setSnackbarVariant] = useState<'success' | 'error'>(
    'success'
  );

  // Trigger snackbar helper
  const triggerSnackbar = (
    msg: string,
    variant: 'success' | 'error' = 'success'
  ) => {
    setSnackbarMsg(msg);
    setSnackbarVariant(variant);
    setSnackbarOpen(true);
  };

  // Custom hook usage
  const {
    cards,
    isLoaded,
    addCard,
    duplicateCard,
    deleteCard,
    deleteAllCards,
    resetToInitial,
    updateCardField,
    updateCardContent,
    addCardContent,
    deleteCardContent,
    exportCards,
    importCards,
    saveCards,
  } = useKeyCards(triggerSnackbar);

  // Keybinding and shortcut logic hook
  const {
    focusCardId,
    setFocusCardId,
    focusTab,
    setFocusTab,
    listeningCardId,
    setListeningCardId,
  } = useKeyCardShortcuts({
    cards,
    mode,
    saveCards,
    triggerSnackbar,
  });

  // Filter cards on Dashboard
  const filteredCards = cards.filter((card: CardData) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      card.title.toLowerCase().includes(query) ||
      card.tags.toLowerCase().includes(query) ||
      card.contents.some(
        (c) =>
          c.label.toLowerCase().includes(query) ||
          c.text.toLowerCase().includes(query)
      )
    );
  });

  const handleEditCardFromModal = (cardId: string) => {
    setFocusCardId(null);
    setMode('management');
    setTimeout(() => {
      const element = document.getElementById(cardId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 150);
  };

  const focusCard = cards.find((c: CardData) => c.id === focusCardId);

  return (
    <div className="min-h-[calc(100dvh-68px)]">
      <HeaderBlock />

      <SectionGap />

      {!isLoaded ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-sky-500 border-t-transparent" />
        </div>
      ) : (
        <>
          {/* Control Navigation Header */}
          <Toolbar
            mode={mode}
            setMode={setMode}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            cardsCount={cards.length}
          />

          {/* Conditional Rendering of Views */}
          {mode === 'dashboard' ? (
            <Dashboard
              filteredCards={filteredCards}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onCardClick={(id) => {
                setFocusCardId(id);
                setFocusTab(0);
              }}
              setMode={setMode}
              isCompact={isCompact}
              setIsCompact={setIsCompact}
            />
          ) : (
            <Management
              cards={cards}
              listeningCardId={listeningCardId}
              setListeningCardId={setListeningCardId}
              onAddCard={addCard}
              onDuplicateCard={duplicateCard}
              onDeleteCard={deleteCard}
              onFieldChange={updateCardField}
              onDeleteAll={deleteAllCards}
              onResetInitial={resetToInitial}
              onUpdateContent={updateCardContent}
              onAddContent={addCardContent}
              onDeleteContent={deleteCardContent}
              onExport={exportCards}
              onImport={importCards}
              sortOrder={sortOrder}
              setSortOrder={setSortOrder}
            />
          )}

          {/* Focus Modal Overlay */}
          <FocusModal
            focusCard={focusCard}
            isOpen={focusCardId !== null}
            onClose={() => setFocusCardId(null)}
            focusTab={focusTab}
            setFocusTab={setFocusTab}
            onEdit={handleEditCardFromModal}
          />

          {/* Global Snackbar feedback alerts */}
          <Snackbar
            variant={snackbarVariant}
            open={snackbarOpen}
            icon={Info}
            onClose={() => setSnackbarOpen(false)}
            content={snackbarMsg}
          />
        </>
      )}
    </div>
  );
}
