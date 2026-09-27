'use client';

import type { ColorSpaceValues } from './types';

import { useMemo } from 'react';

import LabelBar from '@/components/tools/common/label-bar';

import ColorSpaceItem from './color-space-item';
import { buildColorSpaceList } from './constants';

type ColorSpacesSectionProps = {
  colorSpaces: ColorSpaceValues;
  currentHex: string;
};

export default function ColorSpacesSection({
  colorSpaces,
  currentHex,
}: ColorSpacesSectionProps) {
  const items = useMemo(() => buildColorSpaceList(colorSpaces), [colorSpaces]);

  return (
    <section>
      <LabelBar
        label="Color Spaces"
        description="Real-time conversion across standard web, design, and print color spaces."
      />
      <div className="mt-2 divide-y divide-neutral-200/60 overflow-hidden rounded-xl border border-neutral-200/80 bg-white/70 shadow-sm backdrop-blur-md dark:divide-neutral-800/60 dark:border-neutral-800 dark:bg-neutral-900/60">
        {items.map((item) => (
          <ColorSpaceItem
            key={item.id}
            item={item}
            colorSwatchHex={currentHex}
          />
        ))}
      </div>
    </section>
  );
}
