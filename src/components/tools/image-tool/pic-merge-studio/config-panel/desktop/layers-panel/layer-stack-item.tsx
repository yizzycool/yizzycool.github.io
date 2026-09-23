'use client';

import type * as fabric from 'fabric';
import type { LayerItem as LayerItemType } from '../../../types/fabric-helper';

import { useState } from 'react';
import { useSortable } from '@dnd-kit/react/sortable';
import { Eye, EyeOff, GripVertical, ImageIcon } from 'lucide-react';

import { cn } from '@/utils/cn';

type LayerStackItemProps = {
  id: string;
  layer: LayerItemType;
  index: number;
  totalLayers: number;
  onSelect: (image: fabric.FabricImage, isToggle: boolean) => void;
  onToggleVisibility: (image: fabric.FabricImage) => void;
};

export function LayerStackItem({
  id,
  layer,
  index,
  totalLayers,
  onSelect,
  onToggleVisibility,
}: LayerStackItemProps) {
  const [element, setElement] = useState<Element | null>(null);

  const { isDragging } = useSortable({
    id,
    index,
    element,
  });

  const isSelected = layer.isSelected;

  return (
    <div
      ref={setElement}
      onClick={(e) => {
        const isToggle = e.metaKey || e.ctrlKey;
        onSelect(layer.image, isToggle);
      }}
      className={cn(
        'group relative flex cursor-grab select-none items-center gap-2.5 rounded-xl border px-2.5 py-2 text-xs transition-all duration-150 active:cursor-grabbing',
        isSelected
          ? 'border-sky-500/60 bg-sky-500/10 font-semibold text-sky-700 shadow-sm dark:bg-sky-500/20 dark:text-sky-300'
          : 'border-transparent bg-neutral-50/50 text-neutral-700 hover:border-neutral-200 hover:bg-neutral-100/80 dark:bg-neutral-900/40 dark:text-neutral-300 dark:hover:border-neutral-800 dark:hover:bg-neutral-800/60',
        isDragging && 'opacity-40 shadow-inner'
      )}
    >
      {/* Visibility Eye Icon */}
      <button
        type="button"
        title={layer.visible ? 'Hide Layer' : 'Show Layer'}
        onClick={(e) => {
          e.stopPropagation();
          onToggleVisibility(layer.image);
        }}
        className={cn(
          'flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-md transition-colors',
          layer.visible
            ? 'text-neutral-400 hover:text-neutral-900 dark:text-neutral-500 dark:hover:text-neutral-100'
            : 'text-neutral-300 hover:text-neutral-600 dark:text-neutral-600 dark:hover:text-neutral-400'
        )}
      >
        {layer.visible ? (
          <Eye className="h-3.5 w-3.5" />
        ) : (
          <EyeOff className="h-3.5 w-3.5" />
        )}
      </button>

      {/* Layer Thumbnail */}
      <div className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-neutral-200/80 bg-neutral-100 dark:border-neutral-700/80 dark:bg-neutral-800">
        {layer.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={layer.thumbnail}
            alt={layer.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <ImageIcon className="h-4 w-4 text-neutral-400" />
        )}
      </div>

      {/* Layer Title */}
      <div className="min-w-0 flex-1">
        <div title={layer.name} className="truncate font-medium leading-none">
          {layer.name}
        </div>
        <div className="mt-1 text-[10px] text-neutral-400 dark:text-neutral-500">
          Layer {totalLayers - index}
        </div>
      </div>

      {/* Drag Grip Indicator */}
      <div
        title="Drag to reorder"
        className="flex h-6 w-6 shrink-0 items-center justify-center text-neutral-300 opacity-40 transition-opacity group-hover:opacity-100 dark:text-neutral-600"
      >
        <GripVertical className="h-4 w-4" />
      </div>
    </div>
  );
}
