'use client';

import type { FabricHelper } from '../types/fabric-helper';
import type { ConfigHelper } from '../types/config-helper';

import { useEffect } from 'react';

import useToolHotkeys, {
  hasOpenModalDialog,
} from '@/hooks/tools/use-tool-hotkeys';
import toast from '@/utils/toast';

type Props = {
  fabricHelper: FabricHelper;
  configHelper: ConfigHelper;
  onOpenExport: () => void;
  onRequestBatchDelete?: () => void;
  suppressHotkeys?: boolean;
};

function isEditableElementFocused(): boolean {
  const activeEl = document.activeElement;
  if (!activeEl) return false;
  return (
    activeEl.tagName === 'INPUT' ||
    activeEl.tagName === 'TEXTAREA' ||
    (activeEl as HTMLElement).isContentEditable
  );
}

export default function useStudioHotkeys({
  fabricHelper,
  configHelper,
  onOpenExport,
  onRequestBatchDelete,
  suppressHotkeys = false,
}: Props) {
  // Global Tool Hotkeys (Mod + S for export, Esc for deselect)
  useToolHotkeys(
    {
      onSave: onOpenExport,
      onClear: () => fabricHelper.canvasUpdater.discardActiveObject(),
    },
    { enabled: !suppressHotkeys }
  );

  // Keyboard navigation, Undo/Redo, Select All, Quick Delete & Nudge
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (suppressHotkeys || e.defaultPrevented || hasOpenModalDialog()) return;
      if (isEditableElementFocused()) return;

      const isMod = e.ctrlKey || e.metaKey;
      const keyLower = e.key.toLowerCase();

      // Redo (Ctrl/Cmd + Shift + Z or Ctrl + Y)
      if (
        (isMod && e.shiftKey && keyLower === 'z') ||
        (e.ctrlKey && keyLower === 'y')
      ) {
        e.preventDefault();
        void fabricHelper.historyUpdater.redo();
        return;
      }

      // Undo (Ctrl/Cmd + Z)
      if (isMod && !e.shiftKey && keyLower === 'z') {
        e.preventDefault();
        void fabricHelper.historyUpdater.undo();
        return;
      }

      // Select all layers (Ctrl + A or Cmd + A)
      if (isMod && keyLower === 'a') {
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
            if (onRequestBatchDelete) {
              onRequestBatchDelete();
            } else {
              fabricHelper.layersUpdater.batchDelete();
            }
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

    const handlePaste = async (e: ClipboardEvent) => {
      if (suppressHotkeys || hasOpenModalDialog()) return;
      if (isEditableElementFocused()) return;

      const items = e.clipboardData?.items;
      if (!items || items.length === 0) return;

      const imageFiles: File[] = [];
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          const blob = item.getAsFile();
          if (blob) {
            const ext = item.type.split('/')[1]?.replace('+xml', '') || 'png';
            const namedFile =
              blob.name && blob.name !== 'image.png'
                ? blob
                : new File([blob], `pasted-image-${Date.now()}.${ext}`, {
                    type: item.type,
                  });
            imageFiles.push(namedFile);
          }
        }
      }

      if (imageFiles.length === 0) return;
      e.preventDefault();

      if (configHelper.canvasConfig.layout === 'grid') {
        const addedCount =
          await fabricHelper.gridUpdater.handleImagesUpload(imageFiles);
        if (addedCount === 0) {
          toast.info(
            'All grid cells are occupied. Clear a cell or switch to Free layout.'
          );
        } else {
          toast.success(
            addedCount === 1
              ? 'Pasted image into grid cell'
              : `Pasted ${addedCount} images into grid cells`
          );
        }
      } else {
        await fabricHelper.canvasUpdater.handleImagesUpload(imageFiles);
        toast.success(
          imageFiles.length === 1
            ? 'Pasted image onto canvas'
            : `Pasted ${imageFiles.length} images onto canvas`
        );
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('paste', handlePaste);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('paste', handlePaste);
    };
  }, [
    fabricHelper,
    configHelper.canvasConfig.layout,
    onRequestBatchDelete,
    suppressHotkeys,
  ]);
}
