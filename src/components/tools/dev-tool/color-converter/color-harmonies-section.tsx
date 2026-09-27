'use client';

import type { ColorHarmonySwatch } from './types';
import type { TintShadeStep } from './utils/color-harmonies';

import LabelBar from '@/components/tools/common/label-bar';

import HarmonySwatchItem from './harmony-swatch-item';
import TintShadeButton from './tint-shade-button';

type ColorHarmoniesSectionProps = {
  currentHex: string;
  tints: TintShadeStep[];
  shades: TintShadeStep[];
  harmonies: ColorHarmonySwatch[];
  onSelectColor: (hex: string) => void;
};

export default function ColorHarmoniesSection({
  currentHex,
  tints,
  shades,
  harmonies,
  onSelectColor,
}: ColorHarmoniesSectionProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* 1. Tints & Shades Ramp */}
      <section>
        <LabelBar
          label="Tints & Shades"
          description="Light tints (mixed with white) and dark shades (mixed with black). Click any swatch to select."
        />
        <div className="shadow-xs mt-2 flex w-full overflow-hidden rounded-xl border border-neutral-200/80 dark:border-neutral-800">
          {/* Tints (Light) */}
          {tints.map((tint, idx) => (
            <TintShadeButton
              key={`${tint.hex}-${idx}`}
              hex={tint.hex}
              name={tint.name}
              onSelectColor={onSelectColor}
            />
          ))}

          {/* Current Base Color */}
          <TintShadeButton
            hex={currentHex}
            name="Current Color"
            isCurrent
            onSelectColor={onSelectColor}
          />

          {/* Shades (Dark) */}
          {shades.map((shade, idx) => (
            <TintShadeButton
              key={`${shade.hex}-${idx}`}
              hex={shade.hex}
              name={shade.name}
              onSelectColor={onSelectColor}
            />
          ))}
        </div>
      </section>

      {/* 2. Color Harmonies */}
      <section>
        <LabelBar
          label="Color Harmonies"
          description="Harmonious palettes calculated from color wheel angles (complementary, analogous, triadic). Click any swatch to select."
        />
        <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {harmonies.map((swatch, idx) => (
            <HarmonySwatchItem
              key={`${swatch.role}-${swatch.hex}-${idx}`}
              hex={swatch.hex}
              name={swatch.name}
              role={swatch.role}
              onSelectColor={onSelectColor}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
