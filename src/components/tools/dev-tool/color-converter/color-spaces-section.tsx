'use client';

import type { ColorSpaceValues } from './types';

import { useMemo } from 'react';

import { InsetGroup } from '@/components/tools/common/inset-group';
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
      <InsetGroup className="mt-2">
        {items.map((item) => (
          <ColorSpaceItem
            key={item.id}
            item={item}
            colorSwatchHex={currentHex}
          />
        ))}
      </InsetGroup>
    </section>
  );
}
