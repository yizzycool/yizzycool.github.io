'use client';

import Label from '@/components/common/label';
import { Palette } from 'lucide-react';
import { QrCodeColorPresets } from '../..';
import ColorPicker from '@/components/common/color-picker';
import Card from '@/components/common/card';

type Props = {
  fgColor: string;
  setFgColor: React.Dispatch<React.SetStateAction<string>>;
  bgColor: string;
  setBgColor: React.Dispatch<React.SetStateAction<string>>;
};

export default function Appearance({
  fgColor,
  setFgColor,
  bgColor,
  setBgColor,
}: Props) {
  return (
    <div className="space-y-4 text-left">
      <Label icon={Palette}>Apperaance</Label>

      <Card className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-neutral-500 dark:text-neutral-400">
            Foreground
          </span>
          <ColorPicker
            value={fgColor}
            onChange={(e) => setFgColor(e.target.value)}
            ariaLabel="Foreground color picker"
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-neutral-500 dark:text-neutral-400">
            Background
          </span>
          <ColorPicker
            value={bgColor}
            onChange={(e) => setBgColor(e.target.value)}
            ariaLabel="Background color picker"
          />
        </div>

        <div className="pt-2">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
            Presets
          </span>
          <div className="mt-2 flex flex-wrap gap-2">
            {QrCodeColorPresets.map((p) => (
              <button
                key={p.name}
                onClick={() => {
                  setFgColor(p.fg);
                  setBgColor(p.bg);
                }}
                className="h-6 w-6 overflow-hidden rounded-full border border-neutral-200 dark:border-neutral-700"
                title={p.name}
                style={{
                  background: `linear-gradient(135deg, ${p.fg} 50%, ${p.bg} 50%)`,
                }}
              />
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
