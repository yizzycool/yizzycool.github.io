'use client';

import type { MobileLiteDrawerId } from './mobile-lite-sheet';

import {
  Crop,
  Grid3X3,
  ImagePlus,
  Layers,
  LayoutTemplate,
  Maximize2,
  Scissors,
  SlidersHorizontal,
  SunMedium,
  Type,
} from 'lucide-react';
import { useRef } from 'react';

import { cn } from '@/utils/cn';

type Props = {
  activeDrawer: MobileLiteDrawerId;
  onSelectDrawer: (drawer: MobileLiteDrawerId) => void;
  onAddImages: (files: FileList) => void;
  onOpenTemplates: () => void;
  onStartCrop: () => void;
  onActivateMosaic: () => void;
  onRunFastCutout: () => void;
};

const MOBILE_ACTIONS: Array<{
  id:
    | 'import'
    | 'edit'
    | 'crop'
    | 'adjust'
    | 'layers'
    | 'canvas'
    | 'text'
    | 'mosaic'
    | 'templates'
    | 'cutout';
  label: string;
  icon: typeof ImagePlus;
}> = [
  { id: 'import', label: 'Import', icon: ImagePlus },
  { id: 'edit', label: 'Edit', icon: SlidersHorizontal },
  { id: 'crop', label: 'Crop', icon: Crop },
  { id: 'adjust', label: 'Adjust', icon: SunMedium },
  { id: 'layers', label: 'Layers', icon: Layers },
  { id: 'canvas', label: 'Canvas', icon: Maximize2 },
  { id: 'text', label: 'Text', icon: Type },
  { id: 'mosaic', label: 'Mosaic', icon: Grid3X3 },
  { id: 'templates', label: 'Templates', icon: LayoutTemplate },
  { id: 'cutout', label: 'AI Cutout', icon: Scissors },
];

/**
 * Slim bottom action bar for Mobile Lite (`< lg`), exposing OOM-safe lightweight
 * layer/canvas editing actions and fast cutout while hiding heavy desktop-only tools.
 */
export default function MobileLiteBar({
  activeDrawer,
  onSelectDrawer,
  onAddImages,
  onOpenTemplates,
  onStartCrop,
  onActivateMosaic,
  onRunFastCutout,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleActionClick = (id: (typeof MOBILE_ACTIONS)[number]['id']) => {
    if (id === 'import') {
      fileInputRef.current?.click();
    } else if (id === 'templates') {
      onOpenTemplates();
    } else if (id === 'crop') {
      if (activeDrawer === 'crop') {
        onSelectDrawer(null);
      } else {
        onStartCrop();
        onSelectDrawer('crop');
      }
    } else if (id === 'mosaic') {
      if (activeDrawer === 'mosaic') {
        onSelectDrawer(null);
      } else {
        onActivateMosaic();
        onSelectDrawer('mosaic');
      }
    } else if (id === 'cutout') {
      onRunFastCutout();
    } else {
      onSelectDrawer(activeDrawer === id ? null : id);
    }
  };

  return (
    <div className="relative shrink-0 lg:hidden">
      <nav
        aria-label="Mobile Lite Tools"
        className="no-scrollbar flex h-14 items-center gap-1 overflow-x-auto border-t border-neutral-200/80 bg-white/95 px-2 pr-7 dark:border-neutral-800/80 dark:bg-neutral-900/95"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.svg,.psd,.heic,.heif,.tif,.tiff"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              onAddImages(e.target.files);
            }
            e.target.value = '';
          }}
        />

        {MOBILE_ACTIONS.map((item) => {
          const Icon = item.icon;
          const isActive = activeDrawer === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleActionClick(item.id)}
              className={cn(
                'flex h-11 min-w-[56px] shrink-0 flex-col items-center justify-center gap-0.5 rounded-xl px-2 text-[10px] font-semibold transition-colors',
                isActive
                  ? 'shadow-xs bg-sky-500 text-white'
                  : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800'
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="whitespace-nowrap">{item.label}</span>
            </button>
          );
        })}
      </nav>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 right-0 top-px w-7 bg-gradient-to-l from-white via-white/75 to-transparent dark:from-neutral-900 dark:via-neutral-900/75"
      />
    </div>
  );
}
