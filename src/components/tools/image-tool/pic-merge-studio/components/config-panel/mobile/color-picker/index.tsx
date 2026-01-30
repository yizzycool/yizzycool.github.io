'use client';

import { Palette, Pipette, X } from 'lucide-react';
import { HexColorPicker } from 'react-colorful';
import { useState } from 'react';

import BaseDialog from '@/components/common/dialog/base';
import Button from '@/components/common/button';

type Props = {
  onColorPicked: (color: string) => void;
};

export default function ColorPicker({ onColorPicked }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [color, setColor] = useState('#000000');

  const onButtonClick = () => {
    setIsOpen(false);
    onColorPicked(color);
  };

  return (
    <div className="relative aspect-square">
      <Button
        variant="ghost"
        rounded="full"
        size="sm"
        bordered
        onClick={() => setIsOpen((prev) => !prev)}
        className="h-full w-full !p-2"
      >
        <Pipette className="h-full w-full" />
      </Button>
      <BaseDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        className="flex flex-col items-center"
      >
        <div className="flex items-center justify-end px-8 pb-4 pt-6">
          <Palette size={24} className="mr-2" style={{ fill: color }} />
          <h2 className="mr-4 flex-1 text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Pick a Color
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            className="-mr-2 rounded-full p-2 transition-colors hover:bg-slate-100 dark:hover:bg-white/10"
          >
            <X size={20} />
          </button>
        </div>
        <div className="px-8">
          <HexColorPicker color={color} onChange={setColor} />
        </div>
        <div className="w-full px-8 py-4">
          <Button
            variant="ghost"
            size="sm"
            bordered
            onClick={onButtonClick}
            className="w-full"
          >
            OK
          </Button>
        </div>
      </BaseDialog>
    </div>
  );
}
