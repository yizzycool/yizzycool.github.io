'use client';

import type { CardData } from './types';

import { useState, useRef, useMemo } from 'react';

import HeaderBlock from '../../common/header-block';
import SectionGap from '../../common/section-gap';

import { useKeyCards } from './hooks/use-key-cards';
import { useKeyCardSettings } from './hooks/use-key-card-settings';
import { useKeyCardShortcuts } from './hooks/use-key-card-shortcuts';

import Toolbar from './components/toolbar';
import Dashboard from './components/dashboard';
import Management from './components/management';
import FocusModal from './components/focus-modal';
import ShortcutsGuideModal from './components/shortcuts-guide-modal';

export default function KeyCard() {
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Persistent Settings Hook (IndexedDB)
  const {
    settings,
    setMode,
    setIsCompact,
    setSortOrder,
    setSelectedTag,
    toggleCardCollapse,
    setAllCardsCollapsed,
  } = useKeyCardSettings();

  // Cards Data Model Hook
  const {
    cards,
    addCard,
    duplicateCard,
    deleteCard,
    deleteAllCards,
    resetToInitial,
    updateCardField,
    updateCardContent,
    addCardContent,
    duplicateCardContent,
    deleteCardContent,
    exportCards,
    importCards,
    saveCards,
  } = useKeyCards();

  // Filter cards on Dashboard by text search & active tag
  const filteredCards = useMemo(() => {
    return cards.filter((card: CardData) => {
      // 1. Tag filter matching
      if (settings.selectedTag) {
        const cardTags = card.tags
          .split(',')
          .map((t) => t.trim().toLowerCase());
        if (!cardTags.includes(settings.selectedTag.toLowerCase())) {
          return false;
        }
      }

      // 2. Text query matching
      const query = searchQuery.toLowerCase().trim();
      if (!query) return true;

      return (
        card.title.toLowerCase().includes(query) ||
        card.tags.toLowerCase().includes(query) ||
        card.key.toLowerCase().includes(query) ||
        card.contents.some(
          (c) =>
            c.label.toLowerCase().includes(query) ||
            c.text.toLowerCase().includes(query)
        )
      );
    });
  }, [cards, searchQuery, settings.selectedTag]);

  // Keybinding and shortcut logic hook
  const {
    focusCardId,
    setFocusCardId,
    focusTab,
    setFocusTab,
    listeningCardId,
    setListeningCardId,
    isShortcutsGuideOpen,
    setIsShortcutsGuideOpen,
    focusedCardIndex,
    navigateFocusCard,
    copyCurrentFocusContent,
  } = useKeyCardShortcuts({
    cards,
    filteredCards,
    mode: settings.mode,
    setMode,
    isCompact: settings.isCompact,
    setIsCompact,
    saveCards,
    searchInputRef,
    searchQuery,
    setSearchQuery,
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
      <HeaderBlock onOpenHotkeys={() => setIsShortcutsGuideOpen(true)} />

      <SectionGap />

      {/* Control Navigation Header */}
      <Toolbar
        mode={settings.mode}
        setMode={setMode}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        cardsCount={cards.length}
        filteredCount={filteredCards.length}
        searchInputRef={searchInputRef}
      />

      {/* Conditional Rendering of Views */}
      {settings.mode === 'dashboard' ? (
        <Dashboard
          allCards={cards}
          filteredCards={filteredCards}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedTag={settings.selectedTag}
          setSelectedTag={setSelectedTag}
          onCardClick={(id) => {
            setFocusCardId(id);
            setFocusTab(0);
          }}
          setMode={setMode}
          isCompact={settings.isCompact}
          setIsCompact={setIsCompact}
          focusedCardIndex={focusedCardIndex}
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
          onDuplicateContent={duplicateCardContent}
          onDeleteContent={deleteCardContent}
          onReorderCards={saveCards}
          onExport={exportCards}
          onImport={importCards}
          sortOrder={settings.sortOrder}
          setSortOrder={setSortOrder}
          collapsedCards={settings.collapsedCards}
          onToggleCollapse={toggleCardCollapse}
          onSetAllCollapsed={setAllCardsCollapsed}
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
        onNavigate={navigateFocusCard}
        onCopy={copyCurrentFocusContent}
      />

      {/* Shortcuts Guide Modal */}
      <ShortcutsGuideModal
        isOpen={isShortcutsGuideOpen}
        onClose={() => setIsShortcutsGuideOpen(false)}
        cards={cards}
      />
    </div>
  );
}
