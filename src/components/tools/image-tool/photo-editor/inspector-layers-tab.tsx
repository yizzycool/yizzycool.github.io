'use client';

import type { DragEndEvent } from '@dnd-kit/react';
import type { LayerOrderAction, LayerSummary } from './types/studio';

import { DragDropProvider } from '@dnd-kit/react';
import { move } from '@dnd-kit/helpers';
import {
  ArrowDown,
  ArrowDownToLine,
  ArrowUp,
  ArrowUpToLine,
  Group,
  Layers,
  Ungroup,
} from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { SearchInput } from '@/components/ui/input';

import LayerTreeRow from './layer-tree-row';

type Props = {
  layers: LayerSummary[];
  hasSelection: boolean;
  canGroup: boolean;
  canUngroup: boolean;
  searchInputRef: React.RefObject<HTMLInputElement | null>;
  onSelectLayer: (id: string, isToggle: boolean) => void;
  onToggleVisibility: (id: string) => void;
  onToggleLock: (id: string) => void;
  onRenameLayer: (id: string, name: string) => void;
  onDeleteLayer: (id: string) => void;
  onReorderLayers: (nextVisualIds: string[]) => void;
  onOrderSelected: (action: LayerOrderAction) => void;
  onGroup: () => void;
  onUngroup: () => void;
};

/**
 * Right Inspector Layers tab with `/` shortcut search, @dnd-kit drag reordering,
 * layer z-order controls, and group/ungroup buttons.
 */
export default function InspectorLayersTab({
  layers,
  hasSelection,
  canGroup,
  canUngroup,
  searchInputRef,
  onSelectLayer,
  onToggleVisibility,
  onToggleLock,
  onRenameLayer,
  onDeleteLayer,
  onReorderLayers,
  onOrderSelected,
  onGroup,
  onUngroup,
}: Props) {
  const [query, setQuery] = useState('');

  const trimmed = query.trim().toLowerCase();
  const visibleLayers = trimmed
    ? layers.filter(
        (l) =>
          l.name.toLowerCase().includes(trimmed) ||
          l.kind.toLowerCase().includes(trimmed)
      )
    : layers;

  const handleDragEnd = (event: DragEndEvent) => {
    if (event.canceled || trimmed) return;
    const updated = move(layers, event);
    if (updated && updated !== layers) {
      onReorderLayers(updated.map((l) => l.id));
    }
  };

  return (
    <div className="space-y-3">
      <SearchInput
        inputRef={searchInputRef}
        hotkey="/"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search layers..."
        className="text-xs"
      />

      {/* Order & Group Quick Bar */}
      <div className="grid grid-cols-6 gap-1">
        <Button
          variant="ghost"
          size="xs"
          icon={ArrowUpToLine}
          disabled={!hasSelection}
          onClick={() => onOrderSelected('front')}
          title="Bring to Front"
          className="!px-0"
        />
        <Button
          variant="ghost"
          size="xs"
          icon={ArrowUp}
          disabled={!hasSelection}
          onClick={() => onOrderSelected('forward')}
          title="Bring Forward"
          className="!px-0"
        />
        <Button
          variant="ghost"
          size="xs"
          icon={ArrowDown}
          disabled={!hasSelection}
          onClick={() => onOrderSelected('backward')}
          title="Send Backward"
          className="!px-0"
        />
        <Button
          variant="ghost"
          size="xs"
          icon={ArrowDownToLine}
          disabled={!hasSelection}
          onClick={() => onOrderSelected('back')}
          title="Send to Back"
          className="!px-0"
        />
        <Button
          variant="ghost"
          size="xs"
          icon={Group}
          disabled={!canGroup}
          onClick={onGroup}
          title="Group (Ctrl+G)"
          className="!px-0"
        />
        <Button
          variant="ghost"
          size="xs"
          icon={Ungroup}
          disabled={!canUngroup}
          onClick={onUngroup}
          title="Ungroup (Ctrl+Shift+G)"
          className="!px-0"
        />
      </div>

      {visibleLayers.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-neutral-200 py-10 text-center text-xs text-neutral-400 dark:border-neutral-800 dark:text-neutral-500">
          <Layers className="mb-2 h-7 w-7 stroke-[1.3] opacity-50" />
          <p className="font-medium">
            {layers.length === 0 ? 'No layers yet' : 'No matching layers'}
          </p>
        </div>
      ) : (
        <DragDropProvider onDragEnd={handleDragEnd}>
          <div className="flex flex-col gap-1">
            {visibleLayers.map((layer, idx) => (
              <LayerTreeRow
                key={layer.id}
                layer={layer}
                index={idx}
                onSelect={onSelectLayer}
                onToggleVisibility={onToggleVisibility}
                onToggleLock={onToggleLock}
                onRename={onRenameLayer}
                onDelete={onDeleteLayer}
              />
            ))}
          </div>
        </DragDropProvider>
      )}
    </div>
  );
}
