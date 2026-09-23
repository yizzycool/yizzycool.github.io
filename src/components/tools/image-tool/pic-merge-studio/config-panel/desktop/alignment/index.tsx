'use client';

import {
  AlignCenterHorizontal,
  AlignCenterVertical,
  AlignEndHorizontal,
  AlignEndVertical,
  AlignStartHorizontal,
  AlignStartVertical,
  FoldHorizontal,
  FoldVertical,
  ImageUpscale,
  Scan,
  SquareArrowDownLeft,
  SquareArrowDownRight,
  SquareArrowUpLeft,
  SquareArrowUpRight,
  SquareSquare,
} from 'lucide-react';

import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/button';

import PanelLabel from '../../panel-label';

type Props = {
  setAlignment: (horizontal: string, vertical: string) => void;
  setObjectFit: (type: string) => void;
  selectedCount: number;
};

export default function Alignment({
  setAlignment,
  setObjectFit,
  selectedCount,
}: Props) {
  return (
    <div className="space-y-4 px-0.5">
      <PanelLabel
        badge={
          <span className="rounded-md bg-neutral-100 px-2 py-0.5 font-mono text-[11px] font-semibold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
            {selectedCount}
          </span>
        }
      >
        Selected Objects
      </PanelLabel>

      {/* Horizontal Alignment */}
      <div className="space-y-1.5">
        <PanelLabel icon={FoldHorizontal}>Horizontal Alignment</PanelLabel>
        <div className="grid grid-cols-3 gap-2">
          <Button
            variant="secondary"
            bordered
            title="Align Left"
            icon={AlignStartVertical}
            onClick={() => setAlignment('left', '')}
          />
          <Button
            variant="secondary"
            bordered
            title="Align Center"
            icon={AlignCenterVertical}
            onClick={() => setAlignment('center', '')}
          />
          <Button
            variant="secondary"
            bordered
            title="Align Right"
            icon={AlignEndVertical}
            onClick={() => setAlignment('right', '')}
          />
        </div>
      </div>

      {/* Vertical Alignment */}
      <div className="space-y-1.5">
        <PanelLabel icon={FoldVertical}>Vertical Alignment</PanelLabel>
        <div className="grid grid-cols-3 gap-2">
          <Button
            variant="secondary"
            bordered
            title="Align Top"
            icon={AlignStartHorizontal}
            onClick={() => setAlignment('', 'top')}
          />
          <Button
            variant="secondary"
            bordered
            title="Align Middle"
            icon={AlignCenterHorizontal}
            onClick={() => setAlignment('', 'center')}
          />
          <Button
            variant="secondary"
            bordered
            title="Align Bottom"
            icon={AlignEndHorizontal}
            onClick={() => setAlignment('', 'bottom')}
          />
        </div>
      </div>

      {/* Corner & Center Alignment */}
      <div className="space-y-1.5">
        <PanelLabel icon={Scan}>Corner & Center</PanelLabel>
        <div className="grid grid-cols-5 gap-2">
          <Button
            variant="secondary"
            bordered
            title="Top Left"
            icon={SquareArrowUpLeft}
            onClick={() => setAlignment('left', 'top')}
          />
          <Button
            variant="secondary"
            bordered
            title="Top Right"
            icon={SquareArrowUpRight}
            onClick={() => setAlignment('right', 'top')}
          />
          <Button
            variant="secondary"
            bordered
            title="Bottom Right"
            icon={SquareArrowDownRight}
            onClick={() => setAlignment('right', 'bottom')}
          />
          <Button
            variant="secondary"
            bordered
            title="Bottom Left"
            icon={SquareArrowDownLeft}
            onClick={() => setAlignment('left', 'bottom')}
          />
          <Button
            variant="secondary"
            bordered
            title="Center"
            icon={SquareSquare}
            onClick={() => setAlignment('center', 'center')}
          />
        </div>
      </div>

      {/* Object Fit */}
      <div className="space-y-1.5">
        <PanelLabel icon={ImageUpscale}>Object Fit</PanelLabel>
        <div className="grid grid-cols-2 gap-2">
          {/* Contain */}
          <Button
            variant="secondary"
            bordered
            title="Contain"
            onClick={() => setObjectFit('contain')}
          >
            <div
              className={cn(
                'flex h-[18px] w-[18px] items-center justify-center rounded-sm',
                'border-2 border-neutral-900 dark:border-neutral-100'
              )}
            >
              <div className="h-[8px] w-full bg-sky-400 dark:bg-sky-600" />
            </div>
          </Button>
          {/* Cover */}
          <Button
            variant="secondary"
            bordered
            title="Cover"
            onClick={() => setObjectFit('cover')}
          >
            <div className="relative flex h-[18px] w-[24px] items-center">
              <div className="h-[18px] w-[16px] bg-sky-200 dark:bg-sky-900" />
              <div
                className={cn(
                  'h-[18px] w-[18px] overflow-hidden rounded-sm',
                  'border-2 border-neutral-900 dark:border-neutral-100'
                )}
              >
                <div className="h-[14px] w-[14px] bg-sky-400 dark:bg-sky-600" />
              </div>
              <div className="h-[18px] w-[16px] bg-sky-200 dark:bg-sky-900" />
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
}
