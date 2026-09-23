'use client';

import type { FabricHelper } from '../types/fabric-helper';
import type { ConfigHelper } from '../types/config-helper';

import { useEffect } from 'react';

import useToolHotkeys from '@/hooks/tools/use-tool-hotkeys';

type Props = {
  fabricHelper: FabricHelper;
  configHelper: ConfigHelper;
  onOpenExport: () => void;
};

export default function useStudioHotkeys({
  fabricHelper,
  configHelper,
  onOpenExport,
}: Props) {
  // Global Tool Hotkeys (Mod + S for export, Esc for deselect)
  useToolHotkeys({
    onSave: onOpenExport,
    onClear: () => fabricHelper.canvasUpdater.discardActiveObject(),
  });

  // Keyboard navigation & quick delete
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isEditingInput =
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          (activeEl as HTMLElement).isContentEditable);

      if (isEditingInput) return;

      // Select all layers (Ctrl + A or Cmd + A)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        fabricHelper.layersUpdater?.selectAll();
        return;
      }

      // Delete active image
      if (
        (e.key === 'Delete' || e.key === 'Backspace') &&
        fabricHelper.states.hasImageSelection
      ) {
        e.preventDefault();
        if (configHelper.canvasConfig.layout === 'grid') {
          fabricHelper.gridUpdater.deleteImage();
        } else {
          if (fabricHelper.layersUpdater?.selectedCount >= 2) {
            fabricHelper.layersUpdater.batchDelete();
          } else {
            fabricHelper.imageUpdater.deleteImage();
          }
        }
        return;
      }

      // Arrow keys nudge
      if (
        ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key) &&
        fabricHelper.states.hasImageSelection
      ) {
        e.preventDefault();
        const delta = e.shiftKey ? 10 : 1;
        if (e.key === 'ArrowUp') fabricHelper.imageUpdater.nudge(0, -delta);
        if (e.key === 'ArrowDown') fabricHelper.imageUpdater.nudge(0, delta);
        if (e.key === 'ArrowLeft') fabricHelper.imageUpdater.nudge(-delta, 0);
        if (e.key === 'ArrowRight') fabricHelper.imageUpdater.nudge(delta, 0);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [fabricHelper, configHelper.canvasConfig.layout]);
}
