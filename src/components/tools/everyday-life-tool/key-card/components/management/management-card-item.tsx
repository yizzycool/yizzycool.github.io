'use client';

import type { CardData, ContentVersion } from '../../types';

import { Plus, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useSortable } from '@dnd-kit/react/sortable';

import { cn } from '@/utils/cn';
import Card from '@/components/common/card';
import { Button } from '@/components/common/button';
import {
  TooltipPopup,
  TooltipRoot,
  TooltipTrigger,
} from '@/components/common/tooltip';

import { ManagementCardHeader } from './management-card-header';
import { ManagementVersionItem } from './management-version-item';
import { useRef, useState } from 'react';

type ManagementCardItemProps = {
  id: string;
  card: CardData;
  index: number;
  isCollapsed: boolean;
  isListening: boolean;
  isManualReorderEnabled: boolean;
  activePreviewTabs: Record<string, 'edit' | 'preview'>;
  onToggleCollapse: (cardId: string) => void;
  onFieldChange: (id: string, field: keyof CardData, value: string) => void;
  onToggleListening: (cardId: string) => void;
  onDuplicateCard: (id: string) => void;
  onDeleteCardClick: (id: string) => void;
  onAddContent: (id: string) => void;
  onUpdateContent: (
    id: string,
    index: number,
    field: keyof ContentVersion,
    value: string
  ) => void;
  onDuplicateContent: (id: string, index: number) => void;
  onDeleteContentClick: (cardId: string, index: number) => void;
  onToggleVersionPreview: (key: string, mode: 'edit' | 'preview') => void;
};

export function ManagementCardItem({
  id,
  card,
  index,
  isCollapsed,
  isListening,
  isManualReorderEnabled,
  activePreviewTabs,
  onToggleCollapse,
  onFieldChange,
  onToggleListening,
  onDuplicateCard,
  onDeleteCardClick,
  onAddContent,
  onUpdateContent,
  onDuplicateContent,
  onDeleteContentClick,
  onToggleVersionPreview,
}: ManagementCardItemProps) {
  const contents = card.contents || [];

  const [element, setElement] = useState<Element | null>(null);
  const handleRef = useRef<HTMLButtonElement | null>(null);
  const { isDragging } = useSortable({
    id,
    index,
    element,
    handle: handleRef,
    disabled: !isManualReorderEnabled,
  });

  return (
    <Card
      ref={setElement}
      id={card.id}
      rounded="2xl"
      className={cn(
        'relative p-0 transition-all duration-200',
        isListening && 'ring-2 ring-sky-500/50',
        isDragging && 'shadow-xl'
      )}
    >
      {/* Card Header Bar (Collapsible Toggle) */}
      <ManagementCardHeader
        card={card}
        index={index}
        isCollapsed={isCollapsed}
        isListening={isListening}
        isManualReorderEnabled={isManualReorderEnabled}
        onToggleCollapse={() => onToggleCollapse(card.id)}
        onTitleChange={(val) => onFieldChange(card.id, 'title', val)}
        onToggleListening={() => onToggleListening(card.id)}
        onDuplicate={() => onDuplicateCard(card.id)}
        onDelete={() => onDeleteCardClick(card.id)}
        handleRef={handleRef}
      />

      {/* Card Body (Expanded Details) */}
      <AnimatePresence initial={false}>
        {!isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <div className="space-y-5 p-5">
              {/* Tags Input */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300">
                  <span>Tags</span>
                  <TooltipRoot>
                    <TooltipTrigger>
                      <button
                        type="button"
                        className="cursor-help opacity-60 hover:opacity-100"
                      >
                        <Info size={12} strokeWidth={2.5} />
                      </button>
                    </TooltipTrigger>
                    <TooltipPopup
                      showArrow
                      placement="top"
                      className="max-w-xs px-3 py-2 text-xs font-normal leading-relaxed"
                    >
                      Separate multiple tags with commas (e.g. Prompt, Code,
                      Work).
                    </TooltipPopup>
                  </TooltipRoot>
                </label>
                <input
                  type="text"
                  value={card.tags}
                  onChange={(e) =>
                    onFieldChange(card.id, 'tags', e.target.value)
                  }
                  placeholder="e.g. Prompt, System, Email"
                  className={cn(
                    'w-full rounded-xl border px-3 py-2 text-xs outline-none transition-all duration-200',
                    'border-neutral-200/90 bg-white/70 backdrop-blur-md dark:border-neutral-700/80 dark:bg-neutral-900/80 dark:text-slate-100',
                    'focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-500/20',
                    'dark:focus:border-sky-400 dark:focus:bg-neutral-900 dark:focus:ring-sky-400/40'
                  )}
                />
              </div>

              {/* Dynamic Content Versions */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300">
                    <span>Content Versions ({contents.length})</span>
                    <TooltipRoot>
                      <TooltipTrigger>
                        <button
                          type="button"
                          className="cursor-help opacity-60 hover:opacity-100"
                        >
                          <Info size={12} strokeWidth={2.5} />
                        </button>
                      </TooltipTrigger>
                      <TooltipPopup
                        showArrow
                        placement="top"
                        variant="dark"
                        className="max-w-xs px-3 py-2 text-xs font-normal leading-relaxed"
                      >
                        Add multiple versions (e.g. Summary, Full, English).
                        Supports Markdown rendering.
                      </TooltipPopup>
                    </TooltipRoot>
                  </span>

                  <Button
                    variant="outline"
                    size="xs"
                    icon={Plus}
                    onClick={() => onAddContent(card.id)}
                    className="px-2.5 py-1 text-[11px] font-semibold"
                  >
                    Add Version
                  </Button>
                </div>

                {/* Versions Grid */}
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  {contents.map((version, versionIdx) => (
                    <ManagementVersionItem
                      key={versionIdx}
                      version={version}
                      versionIdx={versionIdx}
                      totalVersions={contents.length}
                      currentMode={
                        activePreviewTabs[`${card.id}_${versionIdx}`] || 'edit'
                      }
                      onToggleMode={(mode) =>
                        onToggleVersionPreview(`${card.id}_${versionIdx}`, mode)
                      }
                      onUpdateLabel={(val) =>
                        onUpdateContent(card.id, versionIdx, 'label', val)
                      }
                      onUpdateText={(val) =>
                        onUpdateContent(card.id, versionIdx, 'text', val)
                      }
                      onDuplicate={() =>
                        onDuplicateContent(card.id, versionIdx)
                      }
                      onDelete={() => onDeleteContentClick(card.id, versionIdx)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
