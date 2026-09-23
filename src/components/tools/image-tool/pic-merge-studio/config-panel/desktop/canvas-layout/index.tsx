'use client';

import type { CanvasGridConfig } from '../../../types/config';
import type { ConfigHelper } from '../../../types/config-helper';
import type { LucideIcon } from 'lucide-react';

import { Grid2x2, Info, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { clamp } from 'lodash';

import { cn } from '@/utils/cn';
import { PillTabs } from '@/components/ui/tabs';
import { Selector } from '@/components/ui/selector';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  TooltipPopup,
  TooltipRoot,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import usePreventNumberWheel from '@/hooks/dom/use-prevent-number-wheel';

import { DEFAULT_CANVAS_CONFIG } from '../../..';
import PanelLabel from '../../panel-label';
import GridVisualizer from '../../grid-visualizer';

const MIN_GRID = 1;
const MAX_GRID = 10;

const layoutPresets = ['Free Collage', 'Grid Layout'];

const layoutIcons: Record<string, LucideIcon> = {
  'Free Collage': Sparkles,
  'Grid Layout': Grid2x2,
};

const GRID_PRESET_OPTIONS = [
  { label: '1 × 2 (Horizontal Split)', value: '1x2' },
  { label: '2 × 1 (Vertical Split)', value: '2x1' },
  { label: '2 × 2 (4 Grids)', value: '2x2' },
  { label: '3 × 3 (9 Grids)', value: '3x3' },
];

const GRID_FIELDS = [
  { key: 'rows', label: 'Rows', placeholder: 'Rows' },
  { key: 'cols', label: 'Columns', placeholder: 'Cols' },
] as const;

type Props = {
  configHelper: ConfigHelper;
  switchToGridLayout: (rows: number, cols: number) => void;
  switchToFreeLayout: () => void;
};

export default function CanvasLayout({
  configHelper,
  switchToGridLayout,
  switchToFreeLayout,
}: Props) {
  const currentAppliedLayout = configHelper.canvasConfig.layout;
  const currentAppliedRows =
    configHelper.canvasConfig.gridConfig?.rows ??
    DEFAULT_CANVAS_CONFIG.gridConfig.rows;
  const currentAppliedCols =
    configHelper.canvasConfig.gridConfig?.cols ??
    DEFAULT_CANVAS_CONFIG.gridConfig.cols;

  const [mode, setMode] = useState(
    currentAppliedLayout === 'grid' ? layoutPresets[1] : layoutPresets[0]
  );
  const [gridSize, setGridSize] = useState<Partial<CanvasGridConfig>>({
    rows: currentAppliedRows,
    cols: currentAppliedCols,
  });
  const [prevConfig, setPrevConfig] = useState({
    rows: currentAppliedRows,
    cols: currentAppliedCols,
    layout: currentAppliedLayout,
  });

  if (
    prevConfig.rows !== currentAppliedRows ||
    prevConfig.cols !== currentAppliedCols ||
    prevConfig.layout !== currentAppliedLayout
  ) {
    setPrevConfig({
      rows: currentAppliedRows,
      cols: currentAppliedCols,
      layout: currentAppliedLayout,
    });
    setGridSize({
      rows: currentAppliedRows,
      cols: currentAppliedCols,
    });
    setMode(
      currentAppliedLayout === 'grid' ? layoutPresets[1] : layoutPresets[0]
    );
  }

  const isGridLayout = mode === layoutPresets[1];

  const isGridApplied =
    currentAppliedLayout === 'grid' &&
    currentAppliedRows === gridSize.rows &&
    currentAppliedCols === gridSize.cols;

  const isApplyDisabled = !isGridLayout || isGridApplied;

  const refCallback = usePreventNumberWheel();

  const handleModeSelect = (selectedMode: string) => {
    setMode(selectedMode);
    if (
      configHelper.canvasConfig.layout !== 'free' &&
      selectedMode === layoutPresets[0]
    ) {
      switchToFreeLayout();
    }
  };

  const handleCustomSize = (key: 'rows' | 'cols', value: string) => {
    if (!isGridLayout) return;
    const num = parseInt(value, 10);
    const safeNum = Number.isNaN(num) ? 0 : num;
    setGridSize((prev) => ({ ...prev, [key]: safeNum }));
  };

  const handleApplyGrid = () => {
    if (!isGridLayout) return;
    const rows = clamp(gridSize.rows || MIN_GRID, MIN_GRID, MAX_GRID);
    const cols = clamp(gridSize.cols || MIN_GRID, MIN_GRID, MAX_GRID);
    setGridSize({ rows, cols });
    if (
      currentAppliedLayout === 'grid' &&
      currentAppliedRows === rows &&
      currentAppliedCols === cols
    ) {
      return;
    }
    switchToGridLayout(rows, cols);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleApplyGrid();
    }
  };

  const handleBlur = () => {
    if (!isGridLayout) return;
    const rows = clamp(gridSize.rows || MIN_GRID, MIN_GRID, MAX_GRID);
    const cols = clamp(gridSize.cols || MIN_GRID, MIN_GRID, MAX_GRID);
    setGridSize({ rows, cols });
  };

  const handlePresetSelect = (val: string) => {
    if (!isGridLayout) return;
    const [r, c] = val.split('x').map(Number);
    if (r && c) {
      setGridSize({ rows: r, cols: c });
    }
  };

  const currentPresetKey = `${gridSize.rows}x${gridSize.cols}`;
  const selectedPreset = GRID_PRESET_OPTIONS.some(
    (opt) => opt.value === currentPresetKey
  )
    ? currentPresetKey
    : '';

  return (
    <div className="space-y-3.5">
      {/* Header with info tooltip */}
      <div className="flex items-center gap-2">
        <PanelLabel>Canvas Layout</PanelLabel>
        <TooltipRoot delay={{ open: 150, close: 100 }}>
          <TooltipTrigger>
            <button
              type="button"
              className="text-neutral-400 transition-colors hover:text-neutral-600 dark:hover:text-neutral-200"
              aria-label="Layout modes description"
            >
              <Info size={13} />
            </button>
          </TooltipTrigger>
          <TooltipPopup
            placement="top"
            className="max-w-[210px] p-2.5 text-left text-xs leading-relaxed"
          >
            <div className="mb-1 font-semibold text-sky-400">Layout Modes</div>
            <div className="mb-1">
              <span className="font-medium text-white">Free:</span> Freely drag,
              resize, rotate, and overlap anywhere.
            </div>
            <div>
              <span className="font-medium text-white">Grid:</span> Organized N
              × M grid with automatic photo snapping.
            </div>
          </TooltipPopup>
        </TooltipRoot>
      </div>

      <PillTabs
        tabs={layoutPresets}
        tabIcons={layoutIcons}
        onChange={handleModeSelect}
        size="sm"
        fullWidth
        className="font-medium"
        tabClassName="px-1 gap-1"
      />

      {/* Grid System - Always displayed, strictly disabled in Free mode */}
      <div
        className={cn(
          'space-y-3 transition-opacity duration-200',
          !isGridLayout && 'pointer-events-none opacity-40'
        )}
      >
        {/* Rows, Columns & Mini Visualizer */}
        <div className="flex items-end gap-2 text-left">
          <div className="grid flex-1 grid-cols-2 gap-2">
            {GRID_FIELDS.map(({ key, label, placeholder }) => (
              <div key={key} className="space-y-1">
                <PanelLabel htmlFor={`grid-size-${key}`}>{label}</PanelLabel>
                <Input
                  ref={refCallback}
                  id={`grid-size-${key}`}
                  type="number"
                  disabled={!isGridLayout}
                  value={gridSize[key] === 0 ? '' : gridSize[key] || ''}
                  placeholder={placeholder}
                  onChange={(e) => handleCustomSize(key, e.target.value)}
                  onKeyDown={handleKeyDown}
                  onBlur={handleBlur}
                  className="!px-2.5 !py-1.5 font-mono text-xs font-semibold text-neutral-800 dark:text-neutral-200"
                />
              </div>
            ))}
          </div>
          <GridVisualizer
            rows={gridSize.rows}
            cols={gridSize.cols}
            active={isGridLayout}
          />
        </div>

        {/* Presets Selector - Placed below row/col inputs */}
        <div className="space-y-1.5">
          <PanelLabel>Presets</PanelLabel>
          <Selector
            size="sm"
            options={GRID_PRESET_OPTIONS}
            value={selectedPreset}
            onChange={handlePresetSelect}
            placeholder="Choose a grid preset..."
            disabled={!isGridLayout}
            className="w-full text-xs font-medium"
          />
        </div>

        {/* Apply Button & Info */}
        <div className="space-y-2 pt-1">
          <Button
            variant="primary"
            size="xs"
            className="w-full font-semibold"
            onClick={handleApplyGrid}
            disabled={isApplyDisabled}
          >
            {isGridApplied ? 'Grid Applied' : 'Apply Grid'}
          </Button>
          <p className="text-center text-[10px] text-neutral-400 dark:text-neutral-500">
            Range: 1x1 ~ 10x10
          </p>
        </div>
      </div>
    </div>
  );
}
