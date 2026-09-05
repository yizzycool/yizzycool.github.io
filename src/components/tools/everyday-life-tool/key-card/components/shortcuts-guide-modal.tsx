import type { CardData } from '../types';

import {
  Keyboard,
  X,
  SquareSlash,
  LayoutDashboard,
  BookOpen,
} from 'lucide-react';

import { BaseDialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { HotkeyBadge, HotkeyBadgeLayout } from '@/components/ui/badge';

type ShortcutsGuideModalProps = {
  isOpen: boolean;
  onClose: () => void;
  cards: CardData[];
};

type ShortcutItem = {
  key: string;
  desc: string;
  layout?: HotkeyBadgeLayout;
};

const GLOBAL_SHORTCUTS: ShortcutItem[] = [
  { key: '/', desc: 'Focus dashboard search bar' },
  { key: '← →', desc: 'Navigate card selection in Dashboard' },
  { key: 'Enter', desc: 'Open currently selected card' },
  { key: '?', desc: 'Show this shortcuts guide' },
  { key: 'Esc', desc: 'Close dialog / clear search' },
];

const MODAL_SHORTCUTS: ShortcutItem[] = [
  {
    key: 'Mod + C',
    desc: 'Copy current version text to clipboard',
    layout: 'combined',
  },
  { key: '1-9', desc: 'Switch directly to version tab 1~9' },
  {
    key: 'Tab / Shift + Tab',
    desc: 'Cycle through version tabs',
    layout: 'combined',
  },
  { key: '← →', desc: 'Navigate to Previous / Next card' },
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
    <BaseDialog isOpen={isOpen} onClose={onClose} className="w-full max-w-2xl">
      {/* Header */}
      <div className="mx-6 flex items-center justify-between border-b border-neutral-200 pb-4 pt-6 dark:border-neutral-800">
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
      <div className="max-h-[70vh] space-y-6 overflow-y-auto p-6 pt-4 text-xs">
        {/* Active Hotkeys Matrix */}
        <div>
          <div className="mb-2.5 flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
            <SquareSlash size={14} />
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
          <h4 className="mb-2.5 flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
            <LayoutDashboard size={14} />
            <span>Dashboard & Navigation</span>
          </h4>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {GLOBAL_SHORTCUTS.map((item) => (
              <ShortcutRow key={item.key} item={item} />
            ))}
          </div>
        </div>

        {/* Focus Modal Shortcuts */}
        <div>
          <h4 className="mb-2.5 flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
            <BookOpen size={14} />
            <span>Focus Modal & Reading View</span>
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
      <HotkeyBadge symbol={card.key.toUpperCase()} />
    </div>
  );
}

function ShortcutRow({ item }: { item: ShortcutItem }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-neutral-100 bg-white/60 p-2 dark:border-neutral-800/60 dark:bg-neutral-900/30">
      <span className="text-slate-600 dark:text-slate-400">{item.desc}</span>
      <HotkeyBadge
        layout={item.layout || 'split'}
        symbol={item.key}
        className="inline-flex"
      />
    </div>
  );
}
