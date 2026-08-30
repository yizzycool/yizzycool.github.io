'use client';

import { Palette } from 'lucide-react';
import Label from '@/components/common/label';
import ColorPicker from '@/components/common/color-picker';
import Card from '@/components/common/card';
import Chip from '@/components/common/chip';
import SettingHeader from '../../common/setting-header';

export type ColorPresetItem = {
  name: string;
  fg: string;
  bg: string;
};

export const qrCodeColorPresets: ColorPresetItem[] = [
  { name: 'Classic', fg: '#000000', bg: '#ffffff' },
  { name: 'Midnight', fg: '#0f172a', bg: '#f8fafc' },
  { name: 'Indigo', fg: '#1e1b4b', bg: '#eef2ff' },
  { name: 'Forest', fg: '#064e3b', bg: '#ecfdf5' },
  { name: 'Matcha', fg: '#365314', bg: '#f7fee7' },
  { name: 'Zen Stone', fg: '#292524', bg: '#f5f5f4' },
  { name: 'Mochi', fg: '#78350f', bg: '#fffbeb' },
  { name: 'Ocean', fg: '#0c4a6e', bg: '#f0f9ff' },
  { name: 'Seigaiha', fg: '#134e4a', bg: '#f0fdfa' },
  { name: 'Sakura', fg: '#831843', bg: '#fdf2f8' },
  { name: 'Autumn', fg: '#7c2d12', bg: '#fff7ed' },
];

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
    <div className="space-y-3 text-left">
      <Label icon={Palette}>Color Theme</Label>

      <Card className="space-y-5 p-5">
        {/* Custom Color Pickers */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <ColorPicker
            variant="card"
            label="Foreground"
            value={fgColor}
            onChange={(e) => setFgColor(e.target.value)}
          />
          <ColorPicker
            variant="card"
            label="Background"
            value={bgColor}
            onChange={(e) => setBgColor(e.target.value)}
          />
        </div>

        {/* Color Presets */}
        <div>
          <SettingHeader label="Curated Palettes" className="mb-2" />

          <div className="flex flex-wrap gap-2">
            {qrCodeColorPresets.map((p) => (
              <ColorPreset
                key={p.name}
                fgColor={fgColor}
                setFgColor={setFgColor}
                bgColor={bgColor}
                setBgColor={setBgColor}
                preset={p}
              />
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}

type ColorPresetProps = {
  fgColor: string;
  setFgColor: React.Dispatch<React.SetStateAction<string>>;
  bgColor: string;
  setBgColor: React.Dispatch<React.SetStateAction<string>>;
  preset: ColorPresetItem;
};

function ColorPreset({
  fgColor,
  setFgColor,
  bgColor,
  setBgColor,
  preset,
}: ColorPresetProps) {
  const isSelected =
    fgColor.toLowerCase() === preset.fg.toLowerCase() &&
    bgColor.toLowerCase() === preset.bg.toLowerCase();
  return (
    <Chip
      selected={isSelected}
      onClick={() => {
        setFgColor(preset.fg);
        setBgColor(preset.bg);
      }}
      title={`${preset.name} (FG: ${preset.fg}, BG: ${preset.bg})`}
      showCheck
    >
      <span
        className="shadow-2xs h-3.5 w-3.5 shrink-0 rounded-full border border-neutral-300/80 dark:border-neutral-600"
        style={{
          background: `linear-gradient(135deg, ${preset.fg} 50%, ${preset.bg} 50%)`,
        }}
      />
      <span>{preset.name}</span>
    </Chip>
  );
}
