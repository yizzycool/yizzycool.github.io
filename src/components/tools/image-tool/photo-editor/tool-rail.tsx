'use client';

import type { LucideIcon } from 'lucide-react';
import type { StudioToolId } from './types/studio';

import {
  Contrast,
  Crop,
  Eraser,
  Grid3X3,
  Group,
  Hand,
  MousePointer2,
  Paintbrush,
  PenTool,
  Pipette,
  Shapes,
  Sparkles,
  Type,
  Ungroup,
  Wand2,
} from 'lucide-react';

import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/button';
import {
  TooltipPopup,
  TooltipRoot,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import { STUDIO_TOOLS } from './constants';

const TOOL_ICONS: Record<StudioToolId, LucideIcon> = {
  select: MousePointer2,
  hand: Hand,
  crop: Crop,
  brush: Paintbrush,
  eraser: Eraser,
  mask: Contrast,
  mosaic: Grid3X3,
  pen: PenTool,
  text: Type,
  shape: Shapes,
  eyedropper: Pipette,
  'magic-select': Wand2,
  'magic-eraser': Sparkles,
};

type Props = {
  activeTool: StudioToolId;
  canGroup: boolean;
  canUngroup: boolean;
  onSelectTool: (tool: StudioToolId) => void;
  onGroup: () => void;
  onUngroup: () => void;
};

/**
 * Slim vertical left tool rail providing single-key tool selection and group actions.
 */
export default function ToolRail({
  activeTool,
  canGroup,
  canUngroup,
  onSelectTool,
  onGroup,
  onUngroup,
}: Props) {
  return (
    <aside
      aria-label="Editor Tools"
      className="hidden min-h-0 w-12 shrink-0 flex-col items-center justify-between overflow-y-auto border-r border-neutral-200/80 bg-white/95 py-2 lg:flex dark:border-neutral-800/80 dark:bg-neutral-900/95"
    >
      <div className="flex flex-col items-center gap-1">
        {STUDIO_TOOLS.map((tool) => {
          const Icon = TOOL_ICONS[tool.id];
          const isActive = activeTool === tool.id;
          return (
            <TooltipRoot key={tool.id} delay={{ open: 150, close: 50 }}>
              <TooltipTrigger>
                <button
                  type="button"
                  aria-label={`${tool.label} (${tool.hotkey})`}
                  onClick={() => onSelectTool(tool.id)}
                  className={cn(
                    'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors',
                    isActive
                      ? 'bg-sky-500 text-white shadow-sm'
                      : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100'
                  )}
                >
                  <Icon className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipPopup
                placement="right"
                showArrow
                className="px-2.5 py-1.5 text-xs"
              >
                <div className="flex items-center gap-2">
                  <span>{tool.label}</span>
                  <kbd className="rounded bg-white/15 px-1.5 py-0.5 font-mono text-[10px]">
                    {tool.hotkey}
                  </kbd>
                </div>
              </TooltipPopup>
            </TooltipRoot>
          );
        })}

        <div className="my-0.5 h-px w-6 bg-neutral-200 dark:bg-neutral-700" />

        <Button
          variant="ghost"
          size="xs"
          icon={Group}
          disabled={!canGroup}
          onClick={onGroup}
          title="Group Selected Layers (Ctrl+G)"
          tooltipPlacement="right"
          aria-label="Group Layers"
          className="!h-7 !min-h-7 !w-7 !min-w-7 shrink-0 !p-0"
        />
        <Button
          variant="ghost"
          size="xs"
          icon={Ungroup}
          disabled={!canUngroup}
          onClick={onUngroup}
          title="Ungroup Layers (Ctrl+Shift+G)"
          tooltipPlacement="right"
          aria-label="Ungroup Layers"
          className="!h-7 !min-h-7 !w-7 !min-w-7 shrink-0 !p-0"
        />
      </div>

      <div className="mt-1.5 shrink-0 px-1 text-center font-mono text-[9px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-600">
        Space
        <br />
        Pan
      </div>
    </aside>
  );
}
