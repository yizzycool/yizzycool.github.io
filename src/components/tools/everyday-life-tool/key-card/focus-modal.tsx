import type { CardData } from './types';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

import { cn } from '@/utils/cn';
import BaseDialog from '@/components/common/dialog/base';
import Badge from '@/components/common/badge';
import ProseMarkdown from '@/components/common/markdown/prose-markdown';
import CopyAction from '@/components/common/action-button/copy';

type FocusModalProps = {
  focusCard: CardData | undefined;
  isOpen: boolean;
  onClose: () => void;
  focusTab: number;
  setFocusTab: (tabIndex: number) => void;
};

export default function FocusModal({
  focusCard,
  isOpen,
  onClose,
  focusTab,
  setFocusTab,
}: FocusModalProps) {
  const [activeCard, setActiveCard] = useState<CardData | null>(null);

  // Cache the last defined card so the modal contents don't vanish during close animation
  useEffect(() => {
    if (focusCard) {
      setActiveCard(focusCard);
    }
  }, [focusCard]);

  const cardToRender = focusCard || activeCard;

  if (!cardToRender) return null;

  return (
    <BaseDialog isOpen={isOpen} onClose={onClose} className="w-full max-w-3xl">
      <div className="flex h-[75vh] flex-col">
        {/* Modal Top title bar */}
        <div
          className={cn(
            'flex items-start justify-between gap-4 border-b p-6 pb-4',
            'border-neutral-100 dark:border-neutral-700'
          )}
        >
          <div>
            <div className="mb-2 flex items-center gap-2.5">
              <h2 className="text-lg font-bold text-neutral-950 dark:text-neutral-50">
                {cardToRender.title}
              </h2>
              {cardToRender.key && (
                <kbd
                  className={cn(
                    'inline-flex h-6 min-w-6 items-center justify-center rounded-md border px-1.5 text-[10px] font-black uppercase shadow-sm',
                    'border-neutral-300 bg-neutral-100 text-neutral-800',
                    'dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200'
                  )}
                >
                  {cardToRender.key}
                </kbd>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5">
              {cardToRender.tags.split(',').map((tag, idx) => {
                const cleanTag = tag.trim();
                if (!cleanTag) return null;
                return (
                  <Badge key={idx} variant="blue" size="xs">
                    {cleanTag}
                  </Badge>
                );
              })}
            </div>
          </div>

          <button
            onClick={onClose}
            className="shrink-0 rounded-lg p-1.5 text-neutral-400 transition-all hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Tabs navigation */}
        <div
          className={cn(
            'flex shrink-0 flex-wrap items-center gap-2 border-b bg-neutral-50/50 px-6 py-2',
            'border-neutral-100 dark:border-neutral-700 dark:bg-neutral-900/30'
          )}
        >
          {cardToRender.contents &&
            cardToRender.contents.map((version, versionIdx) => (
              <button
                key={versionIdx}
                onClick={() => setFocusTab(versionIdx)}
                className={cn(
                  'rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all duration-200',
                  focusTab === versionIdx
                    ? 'bg-neutral-900 text-white shadow-sm dark:bg-white dark:text-neutral-950'
                    : 'text-neutral-600 hover:bg-neutral-100/50 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800/50 dark:hover:text-neutral-200'
                )}
              >
                {version.label}
              </button>
            ))}
        </div>

        {/* Modal comparison scrollable content area */}
        <div className="relative flex min-h-0 flex-1 flex-col">
          <div className="absolute right-2 top-2 z-10">
            <CopyAction
              display="icon"
              content={
                (cardToRender.contents &&
                  cardToRender.contents[focusTab] &&
                  cardToRender.contents[focusTab].text) ||
                ''
              }
              className="scale-90"
            />
          </div>
          <div className="flex-1 overflow-y-auto bg-neutral-50/10 px-6 py-8 dark:bg-neutral-950/20">
            <ProseMarkdown className="select-text text-left text-sm leading-relaxed text-neutral-800 selection:bg-sky-500/20 dark:text-neutral-200">
              {(cardToRender.contents &&
                cardToRender.contents[focusTab] &&
                cardToRender.contents[focusTab].text) ||
                '(No content available for this version.)'}
            </ProseMarkdown>
          </div>
        </div>

        {/* Footer */}
        <div className="flex shrink-0 justify-end gap-4 border-t border-neutral-100 bg-neutral-50 px-6 py-3 text-xs text-neutral-400 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-500">
          {cardToRender.key && (
            <span className="flex items-center gap-1.5">
              Press{' '}
              <kbd className="inline-flex h-4 min-w-4 items-center justify-center rounded border border-neutral-300 bg-neutral-100 px-1 text-[9px] font-bold text-neutral-800 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
                {cardToRender.key}
              </kbd>{' '}
              to open on dashboard
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <kbd className="inline-flex h-4 min-w-4 items-center justify-center rounded border border-neutral-300 bg-neutral-100 px-1 text-[9px] font-bold text-neutral-800 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
              ESC
            </kbd>{' '}
            to close
          </span>
        </div>
      </div>
    </BaseDialog>
  );
}
