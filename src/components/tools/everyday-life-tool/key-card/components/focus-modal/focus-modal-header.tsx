import type { CardData } from '../../types';

import { X, Pencil, ChevronLeft, ChevronRight } from 'lucide-react';

import { cn } from '@/utils/cn';
import { Button } from '@/components/common/button';

import { FocusModalTags } from './focus-modal-tags';

type FocusModalHeaderProps = {
  card: CardData;
  onClose: () => void;
  onEdit?: (cardId: string) => void;
  onNavigate?: (direction: 'prev' | 'next') => void;
};

export function FocusModalHeader({
  card,
  onClose,
  onEdit,
  onNavigate,
}: FocusModalHeaderProps) {
  return (
    <div
      className={cn(
        'flex items-start justify-between gap-4 border-b p-5 pb-4 sm:p-6',
        'border-neutral-200/80 dark:border-neutral-800/80'
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="mb-2 flex flex-wrap items-center gap-2.5">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50">
            {card.title}
          </h2>
          {card.key && (
            <kbd
              className={cn(
                'shadow-2xs inline-flex h-6 min-w-6 items-center justify-center rounded-lg border px-1.5 font-mono text-[11px] font-black uppercase',
                'border-neutral-300 bg-neutral-100 text-slate-800',
                'dark:border-neutral-700 dark:bg-neutral-800 dark:text-slate-200'
              )}
            >
              {card.key}
            </kbd>
          )}
        </div>

        <FocusModalTags tagsString={card.tags} />
      </div>

      {/* Top Actions: Prev / Next, Edit, Close */}
      <div className="flex shrink-0 items-center gap-1">
        {onNavigate && (
          <div className="mr-1 flex items-center rounded-xl border border-neutral-200/80 bg-neutral-100/60 p-0.5 dark:border-neutral-800 dark:bg-neutral-800/60">
            <Button
              variant="ghost"
              size="xs"
              rounded="lg"
              icon={ChevronLeft}
              onClick={() => onNavigate('prev')}
              title="Previous Card (Left Arrow)"
              ariaLabel="Previous card"
              className="p-1.5 hover:bg-white dark:hover:bg-neutral-900"
            />
            <Button
              variant="ghost"
              size="xs"
              rounded="lg"
              icon={ChevronRight}
              onClick={() => onNavigate('next')}
              title="Next Card (Right Arrow)"
              ariaLabel="Next card"
              className="p-1.5 hover:bg-white dark:hover:bg-neutral-900"
            />
          </div>
        )}

        <Button
          variant="ghost"
          size="sm"
          rounded="xl"
          icon={Pencil}
          onClick={() => onEdit?.(card.id)}
          title="Edit Card (Press E)"
          ariaLabel="Edit card"
        />
        <Button
          variant="ghost"
          size="sm"
          rounded="xl"
          icon={X}
          onClick={onClose}
          title="Close (ESC)"
          ariaLabel="Close modal"
        />
      </div>
    </div>
  );
}
