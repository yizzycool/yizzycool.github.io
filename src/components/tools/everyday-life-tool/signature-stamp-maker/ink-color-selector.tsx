'use client';

import { ColorPicker } from '@/components/ui/color-picker';
import SettingHeader from '@/components/tools/common/setting-header';
import { cn } from '@/utils/cn';

interface InkPreset {
  label: string;
  value: string;
}

interface Props {
  label: string;
  value: string;
  presets: ReadonlyArray<InkPreset>;
  onChange: (color: string) => void;
}

export default function InkColorSelector({
  label,
  value,
  presets,
  onChange,
}: Props) {
  return (
    <div className="space-y-2.5">
      <SettingHeader label={label} value={value.toUpperCase()} />

      <div className="flex flex-wrap items-center gap-2">
        {presets.map((preset) => (
          <button
            key={preset.value}
            type="button"
            title={preset.label}
            aria-label={preset.label}
            onClick={() => onChange(preset.value)}
            className={cn(
              'h-7 w-7 cursor-pointer rounded-full border transition-transform hover:scale-105',
              value.toLowerCase() === preset.value.toLowerCase()
                ? 'ring-2 ring-sky-500 ring-offset-2 ring-offset-white dark:ring-offset-neutral-900'
                : 'border-neutral-300 dark:border-neutral-700'
            )}
            style={{ backgroundColor: preset.value }}
          />
        ))}

        <ColorPicker
          variant="swatch"
          value={value}
          onColorChange={onChange}
          title="Custom ink color"
          className="h-7 w-7"
        />
      </div>
    </div>
  );
}
