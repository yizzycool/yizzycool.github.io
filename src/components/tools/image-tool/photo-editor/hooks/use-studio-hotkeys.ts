'use client';

import type usePhotoEditorEngine from './use-photo-editor-engine';

import { useEffect } from 'react';

import useToolHotkeys, {
  hasOpenModalDialog,
} from '@/hooks/tools/use-tool-hotkeys';
import toast from '@/utils/toast';

import { STUDIO_TOOLS } from '../constants';

type StudioEngine = ReturnType<typeof usePhotoEditorEngine>;

type Props = {
  engine: StudioEngine;
  onOpenExport: () => void;
  onFocusLayerSearch: () => void;
  suppressHotkeys?: boolean;
};

function isEditableInputFocused(): boolean {
  const el = document.activeElement;
  if (!el) return false;
  return (
    el.tagName === 'INPUT' ||
    el.tagName === 'TEXTAREA' ||
    el.tagName === 'SELECT' ||
    (el as HTMLElement).isContentEditable
  );
}

/**
 * Registers Photoshop-style single-key tools, Mod+Z/Shift+Z Undo/Redo,
 * Space temporary Hand pan, Group/Ungroup, / layer search, and Mod+V paste.
 */
export default function useStudioHotkeys({
  engine,
  onOpenExport,
  onFocusLayerSearch,
  suppressHotkeys = false,
}: Props) {
  useToolHotkeys(
    {
      onSave: onOpenExport,
      onClear: () => {
        if (engine.states.activeTool === 'crop') {
          engine.cancelCrop();
        } else if (engine.states.activeTool === 'pen') {
          engine.cancelPenPath();
        } else if (engine.states.activeTool === 'magic-select') {
          engine.clearSamSelection();
          engine.setActiveTool('select');
        } else if (engine.states.activeTool === 'magic-eraser') {
          engine.clearMagicEraserMask();
          engine.setActiveTool('select');
        } else if (engine.states.selectedProps?.isEditingPathNodes) {
          engine.togglePathNodeEditing();
        } else if (engine.states.activeTool !== 'select') {
          engine.setActiveTool('select');
        } else {
          engine.discardSelection();
        }
      },
    },
    { enabled: !suppressHotkeys }
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (suppressHotkeys || e.defaultPrevented || hasOpenModalDialog()) return;
      if (isEditableInputFocused() || engine.isEditingTextOnCanvas()) return;

      const isMod = e.ctrlKey || e.metaKey;
      const keyLower = e.key.toLowerCase();

      // Hold Space for temporary Hand Pan
      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault();
        engine.setSpacePanMode(true);
        return;
      }

      // Toggle Rulers (Shift + R)
      if (!isMod && e.shiftKey && keyLower === 'r') {
        e.preventDefault();
        engine.toggleRulers();
        return;
      }

      // Commit Crop or Bezier Pen on Enter
      if (e.key === 'Enter') {
        if (engine.states.activeTool === 'crop') {
          e.preventDefault();
          engine.applyCrop();
          return;
        }
        if (
          engine.states.activeTool === 'pen' &&
          engine.states.penAnchorCount >= 2
        ) {
          e.preventDefault();
          engine.finishPenPath(false);
          return;
        }
      }

      // Layer search (keep Mod+K strictly for site-wide Global Search)
      if (!isMod && e.key === '/') {
        e.preventDefault();
        onFocusLayerSearch();
        return;
      }

      // Undo / Redo
      if (
        (isMod && e.shiftKey && keyLower === 'z') ||
        (e.ctrlKey && keyLower === 'y')
      ) {
        e.preventDefault();
        void engine.history.redo();
        return;
      }
      if (isMod && !e.shiftKey && keyLower === 'z') {
        e.preventDefault();
        void engine.history.undo();
        return;
      }

      // Group / Ungroup
      if (isMod && e.shiftKey && keyLower === 'g') {
        e.preventDefault();
        engine.ungroupSelected();
        return;
      }
      if (isMod && !e.shiftKey && keyLower === 'g') {
        e.preventDefault();
        engine.groupSelected();
        return;
      }

      // Duplicate / Select All
      if (isMod && keyLower === 'd') {
        e.preventDefault();
        void engine.duplicateSelected();
        return;
      }
      if (isMod && keyLower === 'a') {
        e.preventDefault();
        engine.selectAllLayers();
        return;
      }

      // Zoom 0 (Fit) & 1 (100%)
      if (isMod && e.key === '0') {
        e.preventDefault();
        engine.fitToScreen();
        return;
      }
      if (isMod && e.key === '1') {
        e.preventDefault();
        engine.zoomTo100();
        return;
      }

      // Delete active layers
      if (
        (e.key === 'Delete' || e.key === 'Backspace') &&
        engine.states.selectedProps
      ) {
        e.preventDefault();
        engine.deleteSelected();
        return;
      }

      // Arrow nudge
      if (
        ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key) &&
        engine.states.selectedProps
      ) {
        e.preventDefault();
        const delta = e.shiftKey ? 10 : 1;
        if (e.key === 'ArrowUp') engine.nudgeSelected(0, -delta);
        if (e.key === 'ArrowDown') engine.nudgeSelected(0, delta);
        if (e.key === 'ArrowLeft') engine.nudgeSelected(-delta, 0);
        if (e.key === 'ArrowRight') engine.nudgeSelected(delta, 0);
        return;
      }

      // Brush Size [ / ]
      if (!isMod && e.key === '[') {
        engine.updateBrushSettings({
          size: Math.max(1, engine.states.brushSettings.size - 4),
        });
        return;
      }
      if (!isMod && e.key === ']') {
        engine.updateBrushSettings({
          size: Math.min(120, engine.states.brushSettings.size + 4),
        });
        return;
      }

      // Single-key tool switches (V, H, B, E, T, U, I)
      if (!isMod && !e.altKey) {
        const matchedTool = STUDIO_TOOLS.find(
          (t) => t.hotkey.toLowerCase() === keyLower
        );
        if (matchedTool) {
          e.preventDefault();
          engine.setActiveTool(matchedTool.id);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        engine.setSpacePanMode(false);
      }
    };

    const handlePaste = async (e: ClipboardEvent) => {
      if (suppressHotkeys || hasOpenModalDialog()) return;
      if (isEditableInputFocused() || engine.isEditingTextOnCanvas()) return;

      const items = e.clipboardData?.items;
      if (!items || items.length === 0) return;

      const files: File[] = [];
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          const blob = item.getAsFile();
          if (blob) {
            const ext = item.type.split('/')[1]?.replace('+xml', '') || 'png';
            const named =
              blob.name && blob.name !== 'image.png'
                ? blob
                : new File([blob], `pasted-layer-${Date.now()}.${ext}`, {
                    type: item.type,
                  });
            files.push(named);
          }
        }
      }

      if (files.length === 0) return;
      e.preventDefault();
      await engine.addImages(files);
      toast.success(
        files.length === 1
          ? 'Pasted image layer onto canvas'
          : `Pasted ${files.length} image layers`
      );
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('paste', handlePaste);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('paste', handlePaste);
    };
  }, [engine, onFocusLayerSearch, suppressHotkeys]);
}
