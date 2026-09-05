'use client';

import type { QrCodeLevel } from './hooks/use-qr-code-generator';

import { Frame, LayoutTemplate, ShieldCheck } from 'lucide-react';

import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Chip } from '@/components/ui/chip';
import SettingHeader from '../../common/setting-header';

type Props = {
  size: number;
  setSize: React.Dispatch<React.SetStateAction<number>>;
  margin: number;
  setMargin: React.Dispatch<React.SetStateAction<number>>;
  level: QrCodeLevel;
  setLevel: React.Dispatch<React.SetStateAction<QrCodeLevel>>;
};

const SIZE_PRESETS = [256, 512, 1024, 2048];

const ECC_LEVELS: { id: QrCodeLevel; label: string; desc: string }[] = [
  { id: 'L', label: 'Low', desc: '7% recovery' },
  { id: 'M', label: 'Medium', desc: '15% recovery' },
  { id: 'Q', label: 'Quartile', desc: '25% recovery' },
  { id: 'H', label: 'High', desc: '30% recovery' },
];

export default function Layout({
  size,
  setSize,
  margin,
  setMargin,
  level,
  setLevel,
}: Props) {
  return (
    <div className="space-y-3 text-left">
      <Label icon={LayoutTemplate}>Dimensions & Reliability</Label>

      <Card className="space-y-6 p-5">
        {/* Output Resolution Presets */}
        <div className="space-y-3">
          <SettingHeader
            label="Output Resolution"
            value={`${size} × ${size} px`}
            valueClassName="font-semibold text-sky-600 dark:text-sky-400"
          />

          <div className="grid grid-cols-4 gap-2">
            {SIZE_PRESETS.map((preset) => (
              <SizePreset
                key={preset}
                size={size}
                setSize={setSize}
                preset={preset}
              />
            ))}
          </div>

          <Slider
            desc="Custom Scale"
            min={128}
            max={2048}
            value={size}
            step={32}
            showBubble={false}
            onChange={(e) => setSize(Number(e.target.value))}
            ariaLabel="Custom QR code size slider"
          />
        </div>

        {/* Error Correction Level */}
        <div className="space-y-3 border-t border-neutral-200/60 pt-4 dark:border-neutral-800/60">
          <SettingHeader
            label="Error Correction (ECC)"
            icon={ShieldCheck}
            hint="Higher error correction allows the QR code to be scanned even if partially damaged or obscured."
            value={`Level ${level}`}
          />

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {ECC_LEVELS.map((item) => (
              <EccPreset
                key={item.id}
                level={level}
                setLevel={setLevel}
                item={item}
              />
            ))}
          </div>
        </div>

        {/* Margin / Quiet Zone Slider */}
        <div className="space-y-3 border-t border-neutral-200/60 pt-4 dark:border-neutral-800/60">
          <SettingHeader
            label="Quiet Zone (Margin)"
            icon={Frame}
            hint="The quiet zone is the blank margin around the QR code, helping scanners accurately detect and isolate the code."
            value={`${margin} modules`}
          />

          <Slider
            min={0}
            max={8}
            value={margin}
            step={1}
            showBubble={false}
            onChange={(e) => setMargin(Number(e.target.value))}
            ariaLabel="Margin slider to adjust whitespace surrounding QR code"
          />
        </div>
      </Card>
    </div>
  );
}

type SizePresetProps = {
  size: number;
  setSize: React.Dispatch<React.SetStateAction<number>>;
  preset: number;
};

function SizePreset({ size, setSize, preset }: SizePresetProps) {
  const isSelected = size === preset;
  return (
    <Chip
      selected={isSelected}
      onClick={() => setSize(preset)}
      className="justify-center py-1.5"
    >
      {preset}px
    </Chip>
  );
}

type EccLevelItem = {
  id: QrCodeLevel;
  label: string;
  desc: string;
};

type EccPresetProps = {
  level: QrCodeLevel;
  setLevel: React.Dispatch<React.SetStateAction<QrCodeLevel>>;
  item: EccLevelItem;
};

function EccPreset({ level, setLevel, item }: EccPresetProps) {
  const isSelected = level === item.id;
  return (
    <Chip
      selected={isSelected}
      onClick={() => setLevel(item.id)}
      className="flex-col p-2 text-center"
    >
      <span className="text-xs font-bold uppercase">{item.label}</span>
      <span className="mt-0.5 text-[10px] text-slate-400 dark:text-slate-500">
        {item.desc}
      </span>
    </Chip>
  );
}
