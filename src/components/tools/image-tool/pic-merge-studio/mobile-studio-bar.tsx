'use client';

import type { LucideIcon } from 'lucide-react';
import type { MobileStudioDrawerId } from './mobile-studio-sheet';

import { useRef } from 'react';
import {
  AlignHorizontalJustifyCenter,
  ChevronLeft,
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
  Type,
} from 'lucide-react';

import MobileStudioBarItem from './mobile-studio-bar-item';

type MobileBarActionId =
  | 'upload'
  | 'replace'
  | 'back-canvas'
  | 'export'
  | 'delete-single'
  | 'batch-delete'
  | Exclude<MobileStudioDrawerId, null>;

type MobileBarAction = {
  id: MobileBarActionId;
  label: string;
  icon: LucideIcon;
  drawerId?: Exclude<MobileStudioDrawerId, null>;
  isDanger?: boolean;
};

type Props = {
  activeDrawer: MobileStudioDrawerId;
  isGridLayout: boolean;
  hasImageSelection: boolean;
  hasImageSrc: boolean;
  selectedCount: number;
  onSelectDrawer: (drawer: MobileStudioDrawerId) => void;
  onAddImages: (files: FileList) => void;
  onReplaceImage: (file: File) => void;
  onDeselect: () => void;
  onDeleteSingle: () => void;
  onRequestBatchDelete: () => void;
  onOpenExport: () => void;
};

const CANVAS_ACTIONS: MobileBarAction[] = [
  { id: 'upload', label: 'Upload', icon: ImagePlus },
  {
    id: 'canvas-layout',
    label: 'Layout',
    icon: LayoutGrid,
    drawerId: 'canvas-layout',
  },
  {
    id: 'canvas-size',
    label: 'Size',
    icon: Proportions,
    drawerId: 'canvas-size',
  },
  { id: 'canvas-text', label: 'Text', icon: Type, drawerId: 'canvas-text' },
  {
    id: 'canvas-background',
    label: 'Background',
    icon: Palette,
    drawerId: 'canvas-background',
  },
  {
    id: 'canvas-border',
    label: 'Border',
    icon: Frame,
    drawerId: 'canvas-border',
  },
  {
    id: 'canvas-layers',
    label: 'Layers',
    icon: Layers,
    drawerId: 'canvas-layers',
  },
  { id: 'export', label: 'Export', icon: Download },
];

/**
 * Slim bottom action bar for Mobile (`< lg`), styled identically to Photo Editor Studio's
 * MobileLiteBar with rounded-xl pill buttons and context-aware Canvas / Image / Batch tools.
 */
export default function MobileStudioBar({
  activeDrawer,
  isGridLayout,
  hasImageSelection,
  hasImageSrc,
  selectedCount,
  onSelectDrawer,
  onAddImages,
  onReplaceImage,
  onDeselect,
  onDeleteSingle,
  onRequestBatchDelete,
  onOpenExport,
}: Props) {
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);

  const getActions = (): MobileBarAction[] => {
    if (!hasImageSelection) {
      return CANVAS_ACTIONS;
    }

    if (selectedCount > 1) {
      return [
        { id: 'back-canvas', label: 'Canvas', icon: ChevronLeft },
        {
          id: 'batch-align',
          label: 'Align',
          icon: AlignHorizontalJustifyCenter,
          drawerId: 'batch-align',
        },
        {
          id: 'batch-opacity',
          label: 'Opacity',
          icon: Sliders,
          drawerId: 'batch-opacity',
        },
        ...(!isGridLayout
          ? [
              {
                id: 'batch-border' as const,
                label: 'Border',
                icon: Square,
                drawerId: 'batch-border' as const,
              },
              {
                id: 'batch-order' as const,
                label: 'Order',
                icon: Layers,
                drawerId: 'batch-order' as const,
              },
            ]
          : []),
        {
          id: 'batch-delete',
          label: `Delete (${selectedCount})`,
          icon: Trash2,
          isDanger: true,
        },
      ];
    }

    return [
      { id: 'back-canvas', label: 'Canvas', icon: ChevronLeft },
      {
        id: 'replace',
        label: hasImageSrc ? 'Replace' : 'Upload',
        icon: hasImageSrc ? RefreshCw : ImagePlus,
      },
      ...(hasImageSrc
        ? [
            {
              id: 'image-filters' as const,
              label: 'Filters',
              icon: Sparkles,
              drawerId: 'image-filters' as const,
            },
            {
              id: 'image-geometry' as const,
              label: 'Geometry',
              icon: DraftingCompass,
              drawerId: 'image-geometry' as const,
            },
            {
              id: 'image-align' as const,
              label: 'Align',
              icon: AlignHorizontalJustifyCenter,
              drawerId: 'image-align' as const,
            },
            {
              id: 'image-opacity' as const,
              label: 'Opacity',
              icon: Sliders,
              drawerId: 'image-opacity' as const,
            },
            ...(!isGridLayout
              ? [
                  {
                    id: 'image-border' as const,
                    label: 'Border',
                    icon: Square,
                    drawerId: 'image-border' as const,
                  },
                  {
                    id: 'image-order' as const,
                    label: 'Order',
                    icon: Layers,
                    drawerId: 'image-order' as const,
                  },
                ]
              : []),
            {
              id: 'delete-single' as const,
              label: 'Delete',
              icon: Trash2,
              isDanger: true,
            },
          ]
        : []),
    ];
  };

  const handleActionClick = (action: MobileBarAction) => {
    if (action.drawerId) {
      onSelectDrawer(activeDrawer === action.drawerId ? null : action.drawerId);
      return;
    }

    switch (action.id) {
      case 'upload':
        uploadInputRef.current?.click();
        break;
      case 'replace':
        replaceInputRef.current?.click();
        break;
      case 'back-canvas':
        onSelectDrawer(null);
        onDeselect();
        break;
      case 'delete-single':
        onSelectDrawer(null);
        onDeleteSingle();
        break;
      case 'batch-delete':
        onRequestBatchDelete();
        break;
      case 'export':
        onOpenExport();
        break;
      default:
        break;
    }
  };

  const actions = getActions();

  return (
    <nav
      aria-label="PicMerge Mobile Tools"
      className="no-scrollbar flex h-14 shrink-0 items-center gap-1 overflow-x-auto border-t border-neutral-200/80 bg-white/95 px-2 lg:hidden dark:border-neutral-800/80 dark:bg-neutral-900/95"
    >
      <input
        ref={uploadInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            onAddImages(e.target.files);
          }
          e.target.value = '';
        }}
      />
      <input
        ref={replaceInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onReplaceImage(file);
          e.target.value = '';
        }}
      />

      {actions.map((item) => (
        <MobileStudioBarItem
          key={item.id}
          label={item.label}
          icon={item.icon}
          isActive={
            item.drawerId !== undefined && activeDrawer === item.drawerId
          }
          isDanger={item.isDanger}
          onClick={() => handleActionClick(item)}
        />
      ))}
    </nav>
  );
}
