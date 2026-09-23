'use client';

import { ChevronDown, ChevronsDown, ChevronsUp, ChevronUp } from 'lucide-react';

import { Button } from '@/components/ui/button';

type Props = {
  setLayer: (type: 'front' | 'back' | 'forward' | 'backward') => void;
};

const layers = ['front', 'forward', 'backward', 'back'] as const;

const layersName = {
  front: 'Bring to front',
  forward: 'Bring forward',
  backward: 'Send backward',
  back: 'Send to back',
};

const layersIconMap = {
  front: ChevronsUp,
  forward: ChevronUp,
  backward: ChevronDown,
  back: ChevronsDown,
};

export default function Arrangement({ setLayer }: Props) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-2">
        {layers.map((layer) => (
          <Button
            variant="ghost"
            size="sm"
            bordered
            icon={layersIconMap[layer]}
            key={layer}
            onClick={() => setLayer(layer)}
            className="justify-start text-xs font-medium"
          >
            {layersName[layer]}
          </Button>
        ))}
      </div>
    </div>
  );
}
