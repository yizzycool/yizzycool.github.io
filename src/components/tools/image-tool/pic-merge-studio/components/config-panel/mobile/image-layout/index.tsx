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
  LayoutGrid,
  Scan,
  SquareArrowDownLeft,
  SquareArrowDownRight,
  SquareArrowUpLeft,
  SquareArrowUpRight,
  SquareSquare,
  TextAlignStart,
} from 'lucide-react';
import clsx from 'clsx';

import { useControlDrawer } from '../hooks/use-control-drawer';
import Button from '@/components/common/button';
import IconTextButton from '../icon-text-button';
import BottomDrawer from '../bottom-drawer';
import GroupTitle from '../group-title';

type Props = {
  setAlignment: (horizontal: string, vertical: string) => void;
  setObjectFit: (type: string) => void;
};

export default function ImageLayout({ setAlignment, setObjectFit }: Props) {
  const { isOpen, openDrawer, closeDrawer } = useControlDrawer();

  return (
    <>
      <IconTextButton icon={LayoutGrid} text="Layout" onClick={openDrawer} />

      <BottomDrawer isOpen={isOpen} onClose={closeDrawer}>
        <div className="space-y-4 p-4">
          <GroupTitle icon={TextAlignStart} text="Alignment" />

          <div className="flex max-w-full items-start gap-4 overflow-x-auto pb-4 *:space-y-4">
            {/* Horizontal Alignment */}
            <div>
              <GroupTitle icon={FoldHorizontal} text="Horizontal" />
              <div className="flex gap-2">
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
            </div>

            {/* Divide */}
            <div className="mb-2 h-[30px] self-end border-l border-neutral-700" />

            {/* Vertical Alignment */}
            <div>
              <GroupTitle icon={FoldVertical} text="Vertical" />
              <div className="flex gap-2">
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
            </div>

            {/* Divide */}
            <div className="mb-2 h-[30px] self-end border-l border-neutral-700" />

            {/* Corner Alignment */}
            <div>
              <GroupTitle icon={Scan} text="Corner" />
              <div className="flex gap-2">
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
            </div>

            {/* Divide */}
            <div className="mb-2 h-[30px] self-end border-l border-neutral-700" />

            {/* Fit */}
            <div>
              <GroupTitle icon={ImageUpscale} text="Fit" />
              <div className="flex gap-2">
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
            {/* End */}
          </div>
        </div>
      </BottomDrawer>
    </>
  );
}
