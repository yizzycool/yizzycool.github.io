'use client';

import {
  AlignHorizontalJustifyCenter,
  Download,
  DraftingCompass,
  Frame,
  ImagePlus,
  Layers,
  LayoutGrid,
  Palette,
  Proportions,
  RefreshCw,
  Sliders,
  Sparkles,
  Square,
  Trash2,
} from 'lucide-react';

import { ActionToolbarList, type ToolbarAction } from './action-toolbar-list';

export { ActionToolbarList };
export type {
  ActionToolbarListProps,
  ToolbarAction,
} from './action-toolbar-list';

export type ActionToolId =
  | 'canvas-aspect-ratio'
  | 'canvas-layout'
  | 'canvas-background'
  | 'canvas-border'
  | 'image-align'
  | 'image-arrangement'
  | 'image-opacity'
  | 'image-border'
  | 'image-geometry'
  | 'image-filters'
  | 'batch-align'
  | 'batch-arrangement'
  | 'batch-opacity'
  | 'batch-border';

type Props = {
  selectedCount: number;
  activeToolId: string | null;
  onSelectTool: (id: ActionToolId | null) => void;
  onAddImages: (files: FileList) => void;
  onReplaceImage?: (file: File) => void;
  onDeleteSingle?: () => void;
  onDeleteBatch?: () => void;
  onExport?: () => void;
};

export default function ActionToolbar({
  selectedCount,
  activeToolId,
  onSelectTool,
  onAddImages,
  onReplaceImage,
  onDeleteSingle,
  onDeleteBatch,
  onExport,
}: Props) {
  const handleOpenAddFiles = () => {
    const input = document.getElementById(
      'studio-desktop-add-files'
    ) as HTMLInputElement;

    if (!input) return;
    input.value = '';
    input.click();
  };

  const handleOpenReplaceFile = () => {
    const input = document.getElementById(
      'studio-desktop-replace-file'
    ) as HTMLInputElement;

    if (!input) return;
    input.value = '';
    input.click();
  };

  const toggleTool = (toolId: ActionToolId) => {
    if (activeToolId === toolId) {
      onSelectTool(null);
    } else {
      onSelectTool(toolId);
    }
  };

  const getActions = (): ToolbarAction[] => {
    if (selectedCount === 0) {
      return [
        {
          id: 'add-images',
          label: 'Add Images',
          Icon: ImagePlus,
          onClick: handleOpenAddFiles,
        },
        {
          id: 'canvas-aspect-ratio',
          label: 'Canvas Size & Ratio',
          Icon: Proportions,
          onClick: () => toggleTool('canvas-aspect-ratio'),
          isActive: activeToolId === 'canvas-aspect-ratio',
        },
        {
          id: 'canvas-layout',
          label: 'Canvas Layout',
          Icon: LayoutGrid,
          onClick: () => toggleTool('canvas-layout'),
          isActive: activeToolId === 'canvas-layout',
        },
        {
          id: 'canvas-background',
          label: 'Canvas Background',
          Icon: Palette,
          onClick: () => toggleTool('canvas-background'),
          isActive: activeToolId === 'canvas-background',
        },
        {
          id: 'canvas-border',
          label: 'Canvas Border',
          Icon: Frame,
          onClick: () => toggleTool('canvas-border'),
          isActive: activeToolId === 'canvas-border',
        },
        ...(onExport
          ? [
              {
                id: 'export',
                label: 'Export Canvas',
                Icon: Download,
                onClick: onExport,
              },
            ]
          : []),
      ];
    }

    if (selectedCount === 1) {
      return [
        {
          id: 'add-images',
          label: 'Add Images',
          Icon: ImagePlus,
          onClick: handleOpenAddFiles,
        },
        {
          id: 'image-align',
          label: 'Alignment & Fit',
          Icon: AlignHorizontalJustifyCenter,
          onClick: () => toggleTool('image-align'),
          isActive: activeToolId === 'image-align',
        },
        {
          id: 'image-arrangement',
          label: 'Arrangement / Layer Order',
          Icon: Layers,
          onClick: () => toggleTool('image-arrangement'),
          isActive: activeToolId === 'image-arrangement',
        },
        {
          id: 'image-opacity',
          label: 'Opacity',
          Icon: Sliders,
          onClick: () => toggleTool('image-opacity'),
          isActive: activeToolId === 'image-opacity',
        },
        {
          id: 'image-border',
          label: 'Border',
          Icon: Square,
          onClick: () => toggleTool('image-border'),
          isActive: activeToolId === 'image-border',
        },
        {
          id: 'image-geometry',
          label: 'Geometry & Angle Snap',
          Icon: DraftingCompass,
          onClick: () => toggleTool('image-geometry'),
          isActive: activeToolId === 'image-geometry',
        },
        {
          id: 'image-filters',
          label: 'Filters',
          Icon: Sparkles,
          onClick: () => toggleTool('image-filters'),
          isActive: activeToolId === 'image-filters',
        },
        {
          id: 'replace-image',
          label: 'Replace Image',
          Icon: RefreshCw,
          onClick: handleOpenReplaceFile,
        },
        ...(onDeleteSingle
          ? [
              {
                id: 'delete-single',
                label: 'Delete Image',
                Icon: Trash2,
                onClick: onDeleteSingle,
                isDanger: true,
              },
            ]
          : []),
      ];
    }

    return [
      {
        id: 'add-images',
        label: 'Add Images',
        Icon: ImagePlus,
        onClick: handleOpenAddFiles,
      },
      {
        id: 'batch-align',
        label: 'Batch Alignment & Fit',
        Icon: AlignHorizontalJustifyCenter,
        onClick: () => toggleTool('batch-align'),
        isActive: activeToolId === 'batch-align',
      },
      {
        id: 'batch-arrangement',
        label: 'Batch Layer Order',
        Icon: Layers,
        onClick: () => toggleTool('batch-arrangement'),
        isActive: activeToolId === 'batch-arrangement',
      },
      {
        id: 'batch-opacity',
        label: 'Batch Opacity',
        Icon: Sliders,
        onClick: () => toggleTool('batch-opacity'),
        isActive: activeToolId === 'batch-opacity',
      },
      {
        id: 'batch-border',
        label: 'Batch Border',
        Icon: Square,
        onClick: () => toggleTool('batch-border'),
        isActive: activeToolId === 'batch-border',
      },
      ...(onDeleteBatch
        ? [
            {
              id: 'delete-batch',
              label: `Delete ${selectedCount} Images`,
              Icon: Trash2,
              onClick: onDeleteBatch,
              isDanger: true,
            },
          ]
        : []),
    ];
  };

  return (
    <div className="flex items-center justify-between border-b border-neutral-200/80 px-2 py-1.5 dark:border-neutral-800/80">
      {/* Hidden File Inputs */}
      <input
        id="studio-desktop-add-files"
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            onAddImages(e.target.files);
          }
        }}
      />
      <input
        id="studio-desktop-replace-file"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.[0] && onReplaceImage) {
            onReplaceImage(e.target.files[0]);
          }
        }}
      />

      <ActionToolbarList actions={getActions()} />
    </div>
  );
}
