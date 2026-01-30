'use client';

import {
  ChevronDown,
  ChevronsDown,
  ChevronsUp,
  ChevronUp,
  LayersIcon,
} from 'lucide-react';

import { useControlDrawer } from '../hooks/use-control-drawer';
import Button from '@/components/common/button';
import IconTextButton from '../icon-text-button';
import BottomDrawer from '../bottom-drawer';
import GroupTitle from '../group-title';

import _xor from 'lodash/xor';

type Props = {
  setLayer: (type: 'front' | 'back' | 'forward' | 'backward') => void;
};

const Layers = ['front', 'back', 'forward', 'backward'] as const;

const LayersName = {
  front: 'To Front',
  back: 'To Back',
  forward: 'Forward',
  backward: 'Backward',
};

const LayersIconMap = {
  front: ChevronsUp,
  back: ChevronsDown,
  forward: ChevronUp,
  backward: ChevronDown,
};

export default function Arrangement({ setLayer }: Props) {
  const { isOpen, openDrawer, closeDrawer } = useControlDrawer();

  return (
    <>
      <IconTextButton
        icon={LayersIcon}
        text="Arrangement"
        onClick={openDrawer}
      />

      <BottomDrawer isOpen={isOpen} onClose={closeDrawer}>
        <div className="space-y-4 p-4">
          <GroupTitle text="Arrangement" icon={LayersIcon} />
          <div className="flex max-w-full gap-2 overflow-x-auto pb-4">
            {Layers.map((layer) => (
              <Button
                variant="ghost"
                size="sm"
                bordered
                icon={LayersIconMap[layer]}
                key={layer}
                onClick={() => setLayer(layer)}
                className="whitespace-nowrap font-black"
              >
                {LayersName[layer]}
              </Button>
            ))}
          </div>
        </div>
      </BottomDrawer>
    </>
  );
}
