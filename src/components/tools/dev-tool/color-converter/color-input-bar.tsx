'use client';

import { Pipette, Shuffle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ColorPicker } from '@/components/ui/color-picker';
import { Input } from '@/components/ui/input';

type ColorInputBarProps = {
  colorInput: string;
  currentHex: string;
  isEyeDropperSupported: boolean;
  onInputChange: (val: string) => void;
  onSelectColor: (hex: string) => void;
  onRandomColor: () => void;
  onEyeDropper: () => void;
};

export default function ColorInputBar({
  colorInput,
  currentHex,
  isEyeDropperSupported,
  onInputChange,
  onSelectColor,
  onRandomColor,
  onEyeDropper,
}: ColorInputBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
      {/* Native color picker using ColorPicker UI primitive */}
      <ColorPicker
        value={currentHex}
        onColorChange={onSelectColor}
        variant="solid"
        title="Color Picker"
      />

      {/* Text color input */}
      <div className="min-w-[200px] flex-1">
        <Input
          value={colorInput}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder="Enter color (e.g. #3B82F6, rgb(...), hsl(...), oklch(...))"
          className="font-mono text-sm"
        />
      </div>

      {/* EyeDropper button (if supported) */}
      {isEyeDropperSupported && (
        <Button
          variant="outline"
          size="xs"
          onClick={onEyeDropper}
          className="gap-1.5"
          aria-label="Pick color from screen"
          title="Sample color from any on-screen pixel (EyeDropper API)"
          tooltipPlacement="top"
        >
          <Pipette className="h-4 w-4" />
          <span className="hidden sm:inline">Pick Screen</span>
        </Button>
      )}

      {/* Random color button */}
      <Button
        variant="outline"
        size="xs"
        onClick={onRandomColor}
        className="gap-1.5"
        aria-label="Random color"
        title="Generate random vibrant color"
        tooltipPlacement="top"
      >
        <Shuffle className="h-4 w-4" />
        <span className="hidden sm:inline">Random</span>
      </Button>
    </div>
  );
}
