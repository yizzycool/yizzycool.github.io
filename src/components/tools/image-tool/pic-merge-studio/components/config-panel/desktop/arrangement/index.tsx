'use client';

import {
  ChevronDown,
  ChevronsDown,
  ChevronsUp,
  ChevronUp,
  LayersIcon,
} from 'lucide-react';

import Label from '@/components/common/label';
import Button from '@/components/common/button';

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
  return (
    <div className="space-y-4">
      <Label
        icon={LayersIcon}
        className="text-xs !font-black uppercase tracking-widest"
      >
        Arrangement
      </Label>

      <div className="grid grid-cols-2 gap-2">
        {Layers.map((layer) => (
          <Button
            variant="ghost"
            size="sm"
            bordered
            icon={LayersIconMap[layer]}
            key={layer}
            onClick={() => setLayer(layer)}
            className="font-black"
          >
            {LayersName[layer]}
          </Button>
        ))}
      </div>
    </div>
  );
}
