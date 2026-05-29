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

type Props = {
  setLayer: (type: 'front' | 'back' | 'forward' | 'backward') => void;
};

const layers = ['front', 'back', 'forward', 'backward'] as const;

const layersName = {
  front: 'To Front',
  back: 'To Back',
  forward: 'Forward',
  backward: 'Backward',
};

const layersIconMap = {
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
            {layers.map((layer) => (
              <Button
                variant="ghost"
                size="sm"
                bordered
                icon={layersIconMap[layer]}
                key={layer}
                onClick={() => setLayer(layer)}
                className="whitespace-nowrap font-black"
              >
                {layersName[layer]}
              </Button>
            ))}
          </div>
        </div>
      </BottomDrawer>
    </>
  );
}
