'use client';

import type { StarterPack } from './starter-packs';

import { Sparkles } from 'lucide-react';

import { BaseDialog, DialogHeader } from '@/components/ui/dialog';

import StarterPackItem from './starter-pack-item';
import { KEYCARD_STARTER_PACKS } from './starter-packs';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onImportPack: (pack: StarterPack) => void;
};

/**
 * Modal offering 1-click curated shortcut & cheat-sheet packs for KeyCard.
 */
export default function StarterPacksModal({
  isOpen,
  onClose,
  onImportPack,
}: Props) {
  return (
    <BaseDialog isOpen={isOpen} onClose={onClose}>
      <div className="w-full max-w-lg space-y-4 p-6 text-left">
        <DialogHeader
          icon={Sparkles}
          title="Starter Cheat-Sheet Packs"
          description="Import ready-to-use developer and productivity packs in 1 click without overwriting your existing cards."
          onClose={onClose}
          closeAriaLabel="Close starter packs modal"
        />

        <div className="scrollbar-thin max-h-[360px] space-y-2.5 overflow-y-auto pr-1">
          {KEYCARD_STARTER_PACKS.map((pack) => (
            <StarterPackItem
              key={pack.id}
              pack={pack}
              onImport={(selected) => {
                onImportPack(selected);
                onClose();
              }}
            />
          ))}
        </div>
      </div>
    </BaseDialog>
  );
}
