'use client';

import type * as fabric from 'fabric';
import type { DragEndEvent } from '@dnd-kit/react';
import type { CanvasBackground, CanvasSize } from '../../../types/config';
import type { LayerItem as LayerItemType } from '../../../types/fabric-helper';

import { DragDropProvider } from '@dnd-kit/react';
import { move } from '@dnd-kit/helpers';
import { ImageIcon } from 'lucide-react';

import { LayerStackBackground } from './layer-stack-background';
import { LayerStackItem } from './layer-stack-item';

type Props = {
  layers: LayerItemType[];
  selectedCount: number;
  canvasSize: CanvasSize;
  canvasBackground: CanvasBackground;
  onSelectLayer: (image: fabric.FabricImage, isToggle: boolean) => void;
  onSelectBackground: () => void;
  onToggleVisibility: (image: fabric.FabricImage) => void;
  onReorderLayers: (newLayers: LayerItemType[]) => void;
};

export default function LayerStack({
  layers,
  selectedCount,
  canvasSize,
  canvasBackground,
  onSelectLayer,
  onSelectBackground,
  onToggleVisibility,
  onReorderLayers,
}: Props) {
  const handleDragEnd = (event: DragEndEvent) => {
    if (event.canceled) return;
    const updated = move(layers, event);
    if (updated && updated !== layers) {
      onReorderLayers(updated);
    }
  };

  const isBackgroundActive = selectedCount === 0;

  return (
    <div className="flex flex-col gap-1 py-1">
      {/* Empty State when no layers */}
      {layers.length === 0 && (
        <div className="flex flex-col items-center justify-center py-6 text-center text-xs text-neutral-400">
          <ImageIcon className="mb-2 h-8 w-8 stroke-[1.25] text-neutral-300 dark:text-neutral-600" />
          <p className="font-medium">No image layers yet</p>
          <p className="text-[11px] text-neutral-400 dark:text-neutral-500">
            Click the toolbar button above to add images
          </p>
        </div>
      )}

      {/* Layer Items with @dnd-kit DragDropProvider */}
      <DragDropProvider onDragEnd={handleDragEnd}>
        {layers.map((layer, index) => (
          <LayerStackItem
            key={layer.id}
            id={layer.id}
            layer={layer}
            index={index}
            totalLayers={layers.length}
            onSelect={onSelectLayer}
            onToggleVisibility={onToggleVisibility}
          />
        ))}
      </DragDropProvider>

      {/* Canvas Background Layer (Always bottom) */}
      <LayerStackBackground
        canvasSize={canvasSize}
        canvasBackground={canvasBackground}
        isActive={isBackgroundActive}
        onSelect={onSelectBackground}
      />
    </div>
  );
}
