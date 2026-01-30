'use client';

import type { filters } from 'fabric';

import clsx from 'clsx';
import { Sparkles } from 'lucide-react';
import Image from 'next/image';

import { useControlDrawer } from '../hooks/use-control-drawer';
import IconTextButton from '../icon-text-button';
import BottomDrawer from '../bottom-drawer';
import { FabricFilterTypeList } from '../../../../data/fabric-filters';

import _xor from 'lodash/xor';

type Props = {
  filters: filters.BaseFilter<string>[];
  setFilters: (filters: string[]) => void;
};

export default function Filters({ filters, setFilters }: Props) {
  const activeFilterList = filters.map((f) => f.type);

  const { isOpen, openDrawer, closeDrawer } = useControlDrawer();

  const updateFilter = (filter: string) => {
    if (!FabricFilterTypeList.includes(filter)) return;
    setFilters(_xor(activeFilterList, [filter]));
  };

  const isActive = (type: string) => {
    return activeFilterList.includes(type);
  };

  return (
    <>
      <IconTextButton icon={Sparkles} text="Filters" onClick={openDrawer} />

      <BottomDrawer isOpen={isOpen} onClose={closeDrawer}>
        <div className="flex max-w-full gap-2 overflow-x-auto p-4 pb-4">
          {FabricFilterTypeList.map((type) => (
            <div
              key={type}
              onClick={() => updateFilter(type)}
              className="relative cursor-pointer"
            >
              <div
                className={clsx(
                  'aspect-square w-[80px] rounded border border-transparent p-1',
                  isActive(type) &&
                    clsx(
                      'text-sky-600 dark:text-sky-600',
                      'border-sky-500 dark:border-sky-600',
                      'bg-sky-100/50 dark:bg-sky-900/50',
                      'hover:bg-sky-100/50 hover:dark:bg-sky-900/50'
                    )
                )}
              >
                <div
                  className={clsx(
                    'relative h-full w-full overflow-hidden rounded-sm'
                  )}
                >
                  <Image
                    src={`/assets/images/tools/image-tool/pic-merge-studio/filters/cat_${type}.jpeg`}
                    alt=""
                    fill
                  />
                </div>
              </div>
              {/* Filter Name */}
              <div className="scale-90 text-xs font-black">{type}</div>
              {/* Order number */}
              {isActive(type) && (
                <div
                  className={clsx(
                    'absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2',
                    'flex h-5 w-5 items-center justify-center overflow-hidden rounded-full',
                    'border-2 border-neutral-900/70 dark:border-white/50',
                    'bg-white/20 backdrop-blur-sm',
                    'text-xs text-neutral-900/70 dark:text-white/80',
                    'font-black'
                  )}
                >
                  {activeFilterList.indexOf(type) + 1}
                </div>
              )}
            </div>
          ))}
        </div>
      </BottomDrawer>
    </>
  );
}
