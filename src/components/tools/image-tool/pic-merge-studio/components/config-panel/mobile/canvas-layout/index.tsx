'use client';

import type { ConfigHelper } from '../../../../types/config-helper';
import type { CanvasGridConfig } from '../../../../types/config';

import clsx from 'clsx';
import { Check, Grid2x2, Grid3X3 } from 'lucide-react';
import { useState } from 'react';

import usePreventNumberWheel from '@/hooks/dom/use-prevent-number-wheel';
import { useControlDrawer } from '../hooks/use-control-drawer';
import ButtonTabs from '@/components/common/tabs/button';
import Button from '@/components/common/button';
import BottomDrawer from '../bottom-drawer';
import IconTextButton from '../icon-text-button';
import GroupTitle from '../group-title';
import { DefaultCanvasConfig } from '../../../..';

const LayoutPresets = ['Free Collage', 'Grid Layout'];

const GridSizes: Array<{ key: 'rows' | 'cols'; label: string }> = [
  {
    key: 'rows',
    label: 'Rows',
  },
  {
    key: 'cols',
    label: 'Columns',
  },
];

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
  const [mode, setMode] = useState(LayoutPresets[0]);
  const [gridSize, setGridSize] = useState<Partial<CanvasGridConfig>>({
    rows: DefaultCanvasConfig.gridConfig.rows,
    cols: DefaultCanvasConfig.gridConfig.cols,
  });

  const isGridLayout = mode === LayoutPresets[1];

  const { isOpen, openDrawer, closeDrawer } = useControlDrawer();

  const refCallback = usePreventNumberWheel();

  const handleModeSelect = (mode: string) => {
    setMode(mode);
    if (
      configHelper.canvasConfig.layout !== 'free' &&
      mode === LayoutPresets[0]
    ) {
      switchToFreeLayout();
    }
  };

  const handleCanvasSize = (key: string, value: string) => {
    if (!isGridLayout) return;
    const nextSize = parseInt(value);
    if (nextSize < 1 || nextSize > 10) return;
    setGridSize((prev) => ({ ...prev, [key]: parseInt(value) }));
  };

  const handleApplyGrid = () => {
    if (!isGridLayout) return;
    setMode(LayoutPresets[1]);
    switchToGridLayout(gridSize.rows!, gridSize.cols!);
  };

  return (
    <>
      <IconTextButton icon={Grid2x2} text="Layout" onClick={openDrawer} />

      <BottomDrawer isOpen={isOpen} onClose={closeDrawer}>
        <div className="relative space-y-4 p-4">
          <GroupTitle text="Layout" icon={Grid2x2} />
          <ButtonTabs
            tabs={LayoutPresets}
            defaultActiveTab={
              isGridLayout ? LayoutPresets[1] : LayoutPresets[0]
            }
            onChange={handleModeSelect}
            size="xs"
            className="font-black uppercase"
          />

          {/* Grid System */}
          <div
            className={clsx(
              'space-y-4 transition-all duration-500',
              !isGridLayout && 'opacity-30'
            )}
          >
            <GroupTitle text="Grid Size" icon={Grid3X3} />
            <div className="flex items-end gap-4 text-left">
              {GridSizes.map(({ key, label }) => (
                <div key={key} className="space-y-2">
                  <label
                    htmlFor={`size-${key}`}
                    className="block pl-1 text-xs font-bold uppercase tracking-widest text-neutral-400"
                  >
                    {label}
                  </label>
                  <input
                    ref={refCallback}
                    id={`grid-size-${key}`}
                    type="number"
                    value={gridSize[key] || ''}
                    onChange={(e) => handleCanvasSize(key, e.target.value)}
                    className={clsx(
                      'm-0 w-full',
                      'rounded-lg outline-none focus:ring-2 focus:ring-blue-500',
                      'px-4 py-2 text-sm font-bold transition-all',
                      'bg-transparent backdrop-blur',
                      'border border-neutral-500/20 text-neutral-600 dark:text-neutral-400',
                      !isGridLayout && 'cursor-not-allowed'
                    )}
                    disabled={!isGridLayout}
                  />
                </div>
              ))}
              <div>
                <Button
                  variant="primary"
                  rounded="full"
                  size="sm"
                  icon={Check}
                  onClick={handleApplyGrid}
                  disabled={!isGridLayout}
                />
              </div>
            </div>
          </div>
        </div>
      </BottomDrawer>
    </>
  );
}
