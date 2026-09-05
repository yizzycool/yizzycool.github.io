import type { CardData } from '../../types';

import { useState, useEffect } from 'react';

import { BaseDialog } from '@/components/ui/dialog';
import { ProseMarkdown } from '@/components/shared/markdown';

import { FocusModalHeader } from './focus-modal-header';
import { FocusModalTabs } from './focus-modal-tabs';
import { FocusModalFooter } from './focus-modal-footer';

type FocusModalProps = {
  focusCard: CardData | undefined;
  isOpen: boolean;
  onClose: () => void;
  focusTab: number;
  setFocusTab: (tabIndex: number) => void;
  onEdit?: (cardId: string) => void;
  onNavigate?: (direction: 'prev' | 'next') => void;
  onCopy?: () => void;
};

export default function FocusModal({
  focusCard,
  isOpen,
  onClose,
  focusTab,
  setFocusTab,
  onEdit,
  onNavigate,
  onCopy,
}: FocusModalProps) {
  const [activeCard, setActiveCard] = useState<CardData | null>(
    focusCard || null
  );
  const [prevFocusCard, setPrevFocusCard] = useState(focusCard);
  const [isCopied, setIsCopied] = useState(false);

  if (focusCard && prevFocusCard !== focusCard) {
    setPrevFocusCard(focusCard);
    setActiveCard(focusCard);
  }

  const cardToRender = focusCard || activeCard;

  // Listen for digit key presses (1-9), Tab / Shift+Tab, and 'e' to edit
  useEffect(() => {
    if (!isOpen || !cardToRender?.contents) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      // Check 'e' to edit
      if (e.key.toLowerCase() === 'e' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        onEdit?.(cardToRender.id);
        return;
      }

      // Check digit keys
      const match = e.key.match(/^[1-9]$/);
      if (match) {
        const tabIndex = parseInt(e.key, 10) - 1;
        if (tabIndex >= 0 && tabIndex < cardToRender.contents.length) {
          e.preventDefault();
          setFocusTab(tabIndex);
        }
        return;
      }

      // Check Tab / Shift+Tab cycling
      if (e.key === 'Tab') {
        const totalTabs = cardToRender.contents.length;
        if (totalTabs <= 1) return;

        e.preventDefault();
        if (e.shiftKey) {
          setFocusTab((focusTab - 1 + totalTabs) % totalTabs);
        } else {
          setFocusTab((focusTab + 1) % totalTabs);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, cardToRender, focusTab, setFocusTab, onEdit]);

  if (!cardToRender) return null;

  const currentContent = cardToRender.contents?.[focusTab]?.text || '';

  const handleCopy = () => {
    if (onCopy) {
      onCopy();
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
      return;
    }

    if (!currentContent) return;
    navigator.clipboard.writeText(currentContent).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  return (
    <BaseDialog isOpen={isOpen} onClose={onClose} className="w-full max-w-3xl">
      <div className="flex h-[78vh] flex-col">
        {/* Modal Top Title Bar */}
        <FocusModalHeader
          card={cardToRender}
          onClose={onClose}
          onEdit={onEdit}
          onNavigate={onNavigate}
        />

        {/* Modal Tabs Navigation */}
        <FocusModalTabs
          contents={cardToRender.contents || []}
          focusTab={focusTab}
          isCopied={isCopied}
          onSelectTab={setFocusTab}
          onCopy={handleCopy}
        />

        {/* Scrollable Markdown Content Area */}
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-white/40 p-6 sm:p-8 dark:bg-neutral-950/20">
          <ProseMarkdown className="select-text text-left text-sm leading-relaxed text-slate-800 selection:bg-sky-500/20 dark:text-slate-200">
            {currentContent || '*(No content available for this version.)*'}
          </ProseMarkdown>
        </div>

        {/* Footer Shortcut Tips */}
        <FocusModalFooter />
      </div>
    </BaseDialog>
  );
}
