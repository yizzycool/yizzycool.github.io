'use client';

import { useRef } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ImagePlus,
  Palette,
  Trash2,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ColorPicker } from '@/components/ui/color-picker';
import { Slider } from '@/components/ui/slider';

import LabelBar from '../../common/label-bar';
import SettingHeader from '../../common/setting-header';
import ColorPresetChip from './color-preset-chip';
import { getContrastRatio } from './utils/qr-payload';

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
  logoDataUrl: string | null;
  logoSizeRatio: number;
  setLogoSizeRatio: (ratio: number) => void;
  onUploadLogo: (file: File) => void;
  onRemoveLogo: () => void;
};

export default function Appearance({
  fgColor,
  setFgColor,
  bgColor,
  setBgColor,
  logoDataUrl,
  logoSizeRatio,
  setLogoSizeRatio,
  onUploadLogo,
  onRemoveLogo,
}: Props) {
  const logoInputRef = useRef<HTMLInputElement>(null);
  const contrastRatio = getContrastRatio(fgColor, bgColor);
  const isLowContrast = contrastRatio < 3.0;
  const isMediumContrast = contrastRatio >= 3.0 && contrastRatio < 4.5;

  return (
    <div className="space-y-3 text-left">
      <LabelBar label="Color Theme & Center Logo" icon={Palette}>
        <span
          className={
            isLowContrast
              ? 'inline-flex items-center gap-1 rounded-full border border-amber-300/80 bg-amber-50/90 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700 dark:border-amber-700/70 dark:bg-amber-950/40 dark:text-amber-300'
              : isMediumContrast
                ? 'inline-flex items-center gap-1 rounded-full border border-sky-200/80 bg-sky-50/90 px-2.5 py-0.5 text-[11px] font-semibold text-sky-700 dark:border-sky-800/70 dark:bg-sky-950/40 dark:text-sky-300'
                : 'inline-flex items-center gap-1 rounded-full border border-emerald-200/80 bg-emerald-50/90 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 dark:border-emerald-800/70 dark:bg-emerald-950/40 dark:text-emerald-300'
          }
        >
          {isLowContrast ? (
            <AlertTriangle className="h-3 w-3" />
          ) : (
            <CheckCircle2 className="h-3 w-3" />
          )}
          <span>
            {isLowContrast
              ? `Low Contrast (${contrastRatio.toFixed(1)}:1)`
              : `Scan Ready (${contrastRatio.toFixed(1)}:1)`}
          </span>
        </span>
      </LabelBar>

      <div className="space-y-5 rounded-xl border border-neutral-200/80 bg-white/70 p-4 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-900/40">
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

        {/* Low contrast readability notice */}
        {isLowContrast && (
          <p className="rounded-lg border border-amber-200/80 bg-amber-50/70 px-3 py-2 text-xs text-amber-800 dark:border-amber-800/60 dark:bg-amber-950/30 dark:text-amber-300">
            Foreground and background colors are too similar. Some camera
            scanners may struggle unless contrast is at least 3.0:1.
          </p>
        )}

        {/* Color Presets */}
        <div>
          <SettingHeader label="Curated Palettes" className="mb-2" />
          <div className="flex flex-wrap gap-2">
            {qrCodeColorPresets.map((p) => (
              <ColorPresetChip
                key={p.name}
                preset={p}
                isSelected={
                  fgColor.toLowerCase() === p.fg.toLowerCase() &&
                  bgColor.toLowerCase() === p.bg.toLowerCase()
                }
                onSelect={(fg, bg) => {
                  setFgColor(fg);
                  setBgColor(bg);
                }}
              />
            ))}
          </div>
        </div>

        {/* Center Brand Logo */}
        <div className="space-y-3 border-t border-neutral-200/70 pt-4 dark:border-neutral-800/70">
          <SettingHeader
            label="Center Brand Logo (Optional)"
            hint="Automatically enables High (30%) error correction so the QR code remains scannable with a logo."
            value={logoDataUrl ? `${Math.round(logoSizeRatio * 100)}%` : 'None'}
          />

          <input
            ref={logoInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onUploadLogo(file);
              e.target.value = '';
            }}
          />

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="secondary"
              size="xs"
              bordered
              icon={ImagePlus}
              onClick={() => logoInputRef.current?.click()}
            >
              {logoDataUrl ? 'Change Logo' : 'Upload Center Logo'}
            </Button>

            {logoDataUrl && (
              <>
                <Button
                  variant="ghost"
                  size="xs"
                  icon={Trash2}
                  onClick={onRemoveLogo}
                  className="text-red-500 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
                >
                  Remove
                </Button>
                <div className="min-w-[160px] flex-1">
                  <Slider
                    title="Logo Scale"
                    min={0.14}
                    max={0.28}
                    step={0.02}
                    value={logoSizeRatio}
                    showBubble={false}
                    onChange={(e) =>
                      setLogoSizeRatio(parseFloat(e.target.value))
                    }
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
