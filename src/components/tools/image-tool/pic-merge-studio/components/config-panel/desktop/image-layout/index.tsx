'use client';

import clsx from 'clsx';
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
  LayoutGrid,
  Scan,
  SquareArrowDownLeft,
  SquareArrowDownRight,
  SquareArrowUpLeft,
  SquareArrowUpRight,
  SquareSquare,
} from 'lucide-react';

import Label from '@/components/common/label';
import Button from '@/components/common/button';

type Props = {
  setAlignment: (horizontal: string, vertical: string) => void;
  setObjectFit: (type: string) => void;
};

export default function ImageLayout({ setAlignment, setObjectFit }: Props) {
  return (
    <div className="space-y-4">
      <Label
        icon={LayoutGrid}
        className="text-xs !font-black uppercase tracking-widest"
      >
        Layout
      </Label>

      <div className="space-y-4 rounded-xl bg-neutral-50 p-4 dark:bg-neutral-800/50">
        {/* Horizontal Alignment */}
        <Label
          icon={FoldHorizontal}
          className="text-xs !font-black uppercase tracking-widest"
        >
          Horizontal Alignment
        </Label>
        <div className="grid grid-cols-4 gap-2">
          <Button
            variant="secondary"
            bordered
            icon={AlignStartVertical}
            onClick={() => setAlignment('left', '')}
          />
          <Button
            variant="secondary"
            bordered
            icon={AlignCenterVertical}
            onClick={() => setAlignment('center', '')}
          />
          <Button
            variant="secondary"
            bordered
            icon={AlignEndVertical}
            onClick={() => setAlignment('right', '')}
          />
        </div>

        {/* Vertical Alignment */}
        <Label
          icon={FoldVertical}
          className="text-xs !font-black uppercase tracking-widest"
        >
          Vertical Alignment
        </Label>
        <div className="grid grid-cols-4 gap-2">
          <Button
            variant="secondary"
            bordered
            icon={AlignStartHorizontal}
            onClick={() => setAlignment('', 'top')}
          />
          <Button
            variant="secondary"
            bordered
            icon={AlignCenterHorizontal}
            onClick={() => setAlignment('', 'center')}
          />
          <Button
            variant="secondary"
            bordered
            icon={AlignEndHorizontal}
            onClick={() => setAlignment('', 'bottom')}
          />
        </div>

        {/* Corner Alignment */}
        <Label
          icon={Scan}
          className="text-xs !font-black uppercase tracking-widest"
        >
          Corner Alignment
        </Label>
        <div className="grid grid-cols-4 gap-2">
          <Button
            variant="secondary"
            bordered
            icon={SquareArrowUpLeft}
            onClick={() => setAlignment('left', 'top')}
          />
          <Button
            variant="secondary"
            bordered
            icon={SquareArrowUpRight}
            onClick={() => setAlignment('right', 'top')}
          />
          <Button
            variant="secondary"
            bordered
            icon={SquareArrowDownRight}
            onClick={() => setAlignment('right', 'bottom')}
          />
          <Button
            variant="secondary"
            bordered
            icon={SquareArrowDownLeft}
            onClick={() => setAlignment('left', 'bottom')}
          />
          <Button
            variant="secondary"
            bordered
            icon={SquareSquare}
            onClick={() => setAlignment('center', 'center')}
          />
        </div>

        {/* Fit */}
        <Label
          icon={ImageUpscale}
          className="text-xs !font-black uppercase tracking-widest"
        >
          Fit
        </Label>
        <div className="grid grid-cols-4 gap-2">
          {/* Contain */}
          <Button
            variant="secondary"
            bordered
            onClick={() => setObjectFit('contain')}
          >
            <div
              className={clsx(
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
            onClick={() => setObjectFit('cover')}
          >
            <div className="relative flex h-[18px] w-[24px] items-center">
              <div className="h-[18px] w-[16px] bg-sky-200 dark:bg-sky-900" />
              <div
                className={clsx(
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
