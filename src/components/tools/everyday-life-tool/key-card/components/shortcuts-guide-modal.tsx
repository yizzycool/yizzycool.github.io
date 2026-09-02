import type { CardData } from '../types';

import { Keyboard, X, Sparkles } from 'lucide-react';
import BaseDialog from '@/components/common/dialog/base';
import { Button } from '@/components/common/button';

type ShortcutsGuideModalProps = {
  isOpen: boolean;
  onClose: () => void;
  cards: CardData[];
};

type ShortcutItem = {
  key: string;
  desc: string;
};

const GLOBAL_SHORTCUTS: ShortcutItem[] = [
  { key: 'A - Z / 0 - 9', desc: 'Open bound card details directly' },
  { key: '/ or ⌘K', desc: 'Focus dashboard search bar' },
  { key: 'C', desc: 'Toggle Compact Grid mode' },
  { key: 'M', desc: 'Toggle Dashboard / Management mode' },
  { key: '↑ ↓ ← →', desc: 'Navigate card selection in Dashboard' },
  { key: 'Enter', desc: 'Open currently selected card' },
  { key: '?', desc: 'Show this shortcuts guide' },
  { key: 'Esc', desc: 'Close dialog / clear search' },
];

const MODAL_SHORTCUTS: ShortcutItem[] = [
  { key: 'C or ⌘C', desc: 'Copy current version text to clipboard' },
  { key: '1 - 9', desc: 'Switch directly to version tab 1~9' },
  { key: 'Tab / ⇧Tab', desc: 'Cycle through version tabs' },
  { key: '[  /  ]', desc: 'Navigate to Previous / Next card' },
  { key: 'E', desc: 'Jump to Management mode to edit this card' },
  { key: 'Esc', desc: 'Close focus view' },
];

export default function ShortcutsGuideModal({
  isOpen,
  onClose,
  cards,
}: ShortcutsGuideModalProps) {
  const boundCards = cards.filter((c) => !!c.key);

  return (
    <BaseDialog
      isOpen={isOpen}
      onClose={onClose}
      className="w-full max-w-2xl p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-200 pb-4 dark:border-neutral-800">
        <div className="flex items-center gap-2.5">
          <div className="rounded-xl bg-sky-500/10 p-2 text-sky-600 dark:bg-sky-500/20 dark:text-sky-400">
            <Keyboard size={20} />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Keyboard Shortcuts Guide
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Master the keys to navigate and copy snippets at lightning speed
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="base"
          rounded="full"
          icon={X}
          onClick={onClose}
          ariaLabel="Close shortcuts guide"
        />
      </div>

      {/* Content */}
      <div className="max-h-[70vh] space-y-6 overflow-y-auto py-4 pr-1 text-xs">
        {/* Active Hotkeys Matrix */}
        <div>
          <div className="mb-2.5 flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
            <Sparkles size={14} className="text-amber-500" />
            <span>Currently Bound Card Hotkeys ({boundCards.length})</span>
          </div>

          {boundCards.length === 0 ? (
            <p className="rounded-xl border border-dashed border-neutral-200 p-4 text-center text-slate-400 dark:border-neutral-800 dark:text-slate-500">
              No cards have assigned hotkeys yet. Switch to Management mode to
              bind single-key shortcuts!
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {boundCards.map((card) => (
                <BoundCardKeyBadge key={card.id} card={card} />
              ))}
            </div>
          )}
        </div>

        {/* Global / Dashboard Shortcuts */}
        <div>
          <h4 className="mb-2.5 font-bold text-slate-800 dark:text-slate-200">
            Dashboard & Navigation
          </h4>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {GLOBAL_SHORTCUTS.map((item) => (
              <ShortcutRow key={item.key} item={item} />
            ))}
          </div>
        </div>

        {/* Focus Modal Shortcuts */}
        <div>
          <h4 className="mb-2.5 font-bold text-slate-800 dark:text-slate-200">
            Focus Modal & Reading View
          </h4>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {MODAL_SHORTCUTS.map((item) => (
              <ShortcutRow key={item.key} item={item} />
            ))}
          </div>
        </div>
      </div>
    </BaseDialog>
  );
}

function BoundCardKeyBadge({ card }: { card: CardData }) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-xl border border-neutral-200/80 bg-neutral-50/50 p-2.5 dark:border-neutral-800 dark:bg-neutral-900/50">
      <span className="truncate font-semibold text-slate-700 dark:text-slate-300">
        {card.title}
      </span>
      <kbd className="shadow-xs inline-flex h-6 min-w-6 items-center justify-center rounded-lg border border-neutral-300 bg-white px-1.5 font-mono text-[11px] font-black uppercase text-slate-800 dark:border-neutral-700 dark:bg-neutral-800 dark:text-slate-200">
        {card.key}
      </kbd>
    </div>
  );
}

function ShortcutRow({ item }: { item: ShortcutItem }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-neutral-100 bg-white/60 p-2 dark:border-neutral-800/60 dark:bg-neutral-900/30">
      <span className="text-slate-600 dark:text-slate-400">{item.desc}</span>
      <kbd className="shadow-2xs inline-flex items-center justify-center rounded-md border border-neutral-200 bg-neutral-100 px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase text-slate-800 dark:border-neutral-700 dark:bg-neutral-800 dark:text-slate-200">
        {item.key}
      </kbd>
    </div>
  );
}
