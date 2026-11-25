'use client';

import type { QrCodeLevel } from './hooks/use-qr-code-generator';

import { Frame, LayoutTemplate, ShieldCheck } from 'lucide-react';

import { Chip } from '@/components/ui/chip';
import { Slider } from '@/components/ui/slider';

import LabelBar from '../../common/label-bar';
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
      <LabelBar label="Dimensions & Reliability" icon={LayoutTemplate} />

      <div className="space-y-5 rounded-xl border border-neutral-200/80 bg-white/70 p-4 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-900/40">
        {/* Output Resolution Presets */}
        <div className="space-y-3">
          <SettingHeader
            label="Output Resolution"
            value={`${size} × ${size} px`}
            valueClassName="font-mono font-semibold text-sky-600 dark:text-sky-400"
          />

          <div className="grid grid-cols-4 gap-2">
            {SIZE_PRESETS.map((preset) => (
              <Chip
                key={preset}
                selected={size === preset}
                onClick={() => setSize(preset)}
                className="justify-center py-1.5 font-mono text-xs"
              >
                {preset}px
              </Chip>
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
        <div className="space-y-3 border-t border-neutral-200/70 pt-4 dark:border-neutral-800/70">
          <SettingHeader
            label="Error Correction (ECC)"
            icon={ShieldCheck}
            hint="Higher error correction allows the QR code to be scanned even if partially damaged or obscured."
            value={`Level ${level}`}
          />

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {ECC_LEVELS.map((item) => (
              <Chip
                key={item.id}
                selected={level === item.id}
                onClick={() => setLevel(item.id)}
                className="flex-col p-2 text-center"
              >
                <span className="text-xs font-bold uppercase">
                  {item.label}
                </span>
                <span className="mt-0.5 text-[10px] text-neutral-400 dark:text-neutral-500">
                  {item.desc}
                </span>
              </Chip>
            ))}
          </div>
        </div>

        {/* Margin / Quiet Zone Slider */}
        <div className="space-y-3 border-t border-neutral-200/70 pt-4 dark:border-neutral-800/70">
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
      </div>
    </div>
  );
}
