'use client';

import type { LayerKind, LayerSummary } from './types/studio';

import { useSortable } from '@dnd-kit/react/sortable';
import {
  Eye,
  EyeOff,
  Folder,
  GripVertical,
  ImageIcon,
  Lock,
  Paintbrush,
  Shapes,
  Trash2,
  Type,
  Unlock,
} from 'lucide-react';
import { useState } from 'react';

import { cn } from '@/utils/cn';

const KIND_ICONS: Record<LayerKind, typeof ImageIcon> = {
  image: ImageIcon,
  text: Type,
  shape: Shapes,
  brush: Paintbrush,
  group: Folder,
};

type Props = {
  layer: LayerSummary;
  index: number;
  onSelect: (id: string, isToggle: boolean) => void;
  onToggleVisibility: (id: string) => void;
  onToggleLock: (id: string) => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
};

/**
 * Single draggable layer row supporting inline double-click rename, visibility/lock toggles, and delete.
 */
export default function LayerTreeRow({
  layer,
  index,
  onSelect,
  onToggleVisibility,
  onToggleLock,
  onRename,
  onDelete,
}: Props) {
  const [element, setElement] = useState<Element | null>(null);
  const [isRenaming, setIsRenaming] = useState(false);
  const [draftName, setDraftName] = useState(layer.name);

  const { isDragging } = useSortable({
    id: layer.id,
    index,
    element,
  });

  const KindIcon = KIND_ICONS[layer.kind];

  const commitRename = () => {
    setIsRenaming(false);
    if (draftName.trim() && draftName.trim() !== layer.name) {
      onRename(layer.id, draftName.trim());
    } else {
      setDraftName(layer.name);
    }
  };

  return (
    <div
      ref={setElement}
      onClick={(e) => {
        if (isRenaming) return;
        onSelect(layer.id, e.metaKey || e.ctrlKey);
      }}
      onDoubleClick={() => {
        setDraftName(layer.name);
        setIsRenaming(true);
      }}
      className={cn(
        'group flex cursor-grab select-none items-center gap-2 rounded-xl border px-2 py-1.5 text-xs transition-colors active:cursor-grabbing',
        layer.isSelected
          ? 'border-sky-500/60 bg-sky-500/10 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300'
          : 'border-transparent bg-neutral-50/60 text-neutral-700 hover:border-neutral-200 hover:bg-neutral-100/80 dark:bg-neutral-900/50 dark:text-neutral-300 dark:hover:border-neutral-800 dark:hover:bg-neutral-800/60',
        isDragging && 'opacity-40'
      )}
    >
      <GripVertical className="h-3.5 w-3.5 shrink-0 text-neutral-300 group-hover:text-neutral-400 dark:text-neutral-600" />

      {/* Preview Thumbnail or Kind Icon */}
      <div className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-neutral-200/80 bg-white dark:border-neutral-700/80 dark:bg-neutral-800">
        {layer.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={layer.thumbnail}
            alt={layer.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <KindIcon className="h-3.5 w-3.5 text-neutral-500 dark:text-neutral-400" />
        )}
      </div>

      {/* Name + Blend Meta */}
      <div className="min-w-0 flex-1">
        {isRenaming ? (
          <input
            type="text"
            autoFocus
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitRename();
              if (e.key === 'Escape') {
                setDraftName(layer.name);
                setIsRenaming(false);
              }
            }}
            onClick={(e) => e.stopPropagation()}
            className="w-full rounded border border-sky-400 bg-white px-1 py-0.5 text-xs text-neutral-900 outline-none dark:bg-neutral-900 dark:text-neutral-100"
          />
        ) : (
          <div
            className="truncate font-medium leading-tight"
            title={layer.name}
          >
            {layer.name}
          </div>
        )}
        <div className="mt-0.5 flex flex-wrap items-center gap-1 text-[10px] text-neutral-400 dark:text-neutral-500">
          <span className="capitalize">{layer.kind}</span>
          {layer.hasMask && (
            <span className="rounded bg-purple-500/15 px-1 text-[9px] font-semibold uppercase text-purple-600 dark:text-purple-400">
              Mask
            </span>
          )}
          {layer.isClippedBelow && (
            <span className="rounded bg-amber-500/15 px-1 text-[9px] font-semibold uppercase text-amber-600 dark:text-amber-400">
              ↳ Clip
            </span>
          )}
          {layer.blendMode !== 'source-over' && (
            <span className="rounded bg-sky-500/10 px-1 text-[9px] font-semibold uppercase text-sky-600 dark:text-sky-400">
              {layer.blendMode}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-0.5">
        <button
          type="button"
          title={layer.locked ? 'Unlock Layer' : 'Lock Layer'}
          onClick={(e) => {
            e.stopPropagation();
            onToggleLock(layer.id);
          }}
          className={cn(
            'rounded p-1 transition-colors',
            layer.locked
              ? 'text-amber-500'
              : 'text-neutral-400 opacity-0 hover:text-neutral-700 group-hover:opacity-100 dark:hover:text-neutral-200'
          )}
        >
          {layer.locked ? (
            <Lock className="h-3 w-3" />
          ) : (
            <Unlock className="h-3 w-3" />
          )}
        </button>

        <button
          type="button"
          title={layer.visible ? 'Hide Layer' : 'Show Layer'}
          onClick={(e) => {
            e.stopPropagation();
            onToggleVisibility(layer.id);
          }}
          className={cn(
            'rounded p-1 transition-colors',
            layer.visible
              ? 'text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'
              : 'text-neutral-300 dark:text-neutral-600'
          )}
        >
          {layer.visible ? (
            <Eye className="h-3.5 w-3.5" />
          ) : (
            <EyeOff className="h-3.5 w-3.5" />
          )}
        </button>

        <button
          type="button"
          title="Delete Layer"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(layer.id);
          }}
          className="rounded p-1 text-neutral-400 opacity-0 transition-colors hover:text-red-500 group-hover:opacity-100 dark:hover:text-red-400"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
