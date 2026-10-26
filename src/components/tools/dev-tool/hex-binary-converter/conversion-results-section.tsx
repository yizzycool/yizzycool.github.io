'use client';

import type { FormatOptions, HexBinaryResult } from './types';

import { Code } from 'lucide-react';

import { InsetGroup } from '@/components/tools/common/inset-group';
import LabelBar from '@/components/tools/common/label-bar';
import { PropertyRow } from '@/components/tools/common/property-row';

import FormatControlsBar from './format-controls-bar';

interface ConversionResultsSectionProps {
  result: HexBinaryResult;
  options: FormatOptions;
  onChangeOptions: (opts: FormatOptions) => void;
}

export default function ConversionResultsSection({
  result,
  options,
  onChangeOptions,
}: ConversionResultsSectionProps) {
  return (
    <div className="space-y-4">
      {/* Label and Summary Bar */}
      <LabelBar label="Conversion Output" icon={Code} />

      {/* Format Controls: Delimiter and Case Mode */}
      <FormatControlsBar options={options} onChangeOptions={onChangeOptions} />

      {/* Inset Grouped Container */}
      <InsetGroup rounded="2xl">
        {/* 1. UTF-8 Plain Text */}
        <PropertyRow
          label="UTF-8 Plain Text"
          badge={`${result.charCount} chars`}
          badgeVariant="neutral"
          value={result.text || '---'}
          copyable={Boolean(result.text)}
          grouped
          hoverAction
        />

        {/* 2. Hexadecimal */}
        <PropertyRow
          label="Hexadecimal (Hex)"
          badge={`${result.byteLength} Bytes`}
          badgeVariant="neutral"
          value={result.hex || '---'}
          copyable={Boolean(result.hex)}
          grouped
          hoverAction
        />

        {/* 3. Binary Bitstream */}
        <PropertyRow
          label="Binary (8-bit Bits)"
          badge={`${result.bitLength} Bits`}
          badgeVariant="neutral"
          value={result.binary || '---'}
          copyable={Boolean(result.binary)}
          grouped
          hoverAction
        />

        {/* 4. Decimal Bytes Array */}
        <PropertyRow
          label="Decimal Bytes Array"
          badge="Uint8Array"
          badgeVariant="neutral"
          value={result.decimal || '---'}
          copyable={Boolean(result.decimal)}
          grouped
          hoverAction
        />

        {/* 5. C / C++ Array Format */}
        <PropertyRow
          label="C / C++ Array"
          badge="uint8_t data[]"
          badgeVariant="neutral"
          value={result.cArray || '---'}
          copyable={Boolean(result.cArray && result.cArray !== '{ }')}
          grouped
          hoverAction
        />

        {/* 6. Python Bytes Literal */}
        <PropertyRow
          label="Python Bytes Literal"
          badge='b"\x.."'
          badgeVariant="neutral"
          value={result.pythonBytes || '---'}
          copyable={Boolean(result.pythonBytes && result.pythonBytes !== 'b""')}
          grouped
          hoverAction
        />
      </InsetGroup>
    </div>
  );
}
