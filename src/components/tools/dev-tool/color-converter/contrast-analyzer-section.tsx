'use client';

import type { ContrastResult, NormalizedRgba } from './types';

import LabelBar from '@/components/tools/common/label-bar';
import { InfoTooltip } from '@/components/ui/info-tooltip';

import ContrastPreviewItem from './contrast-preview-item';

type ContrastAnalyzerSectionProps = {
  backgroundColorRgba: NormalizedRgba;
  contrastAgainstBlack: ContrastResult;
  contrastAgainstWhite: ContrastResult;
};

export default function ContrastAnalyzerSection({
  backgroundColorRgba,
  contrastAgainstBlack,
  contrastAgainstWhite,
}: ContrastAnalyzerSectionProps) {
  return (
    <section>
      <LabelBar
        label="WCAG 2.1 Contrast Ratio"
        description="Evaluate text readability and compliance levels against black and white foregrounds."
        actions={
          <InfoTooltip size="base" ariaLabel="WCAG 2.1 guideline description">
            <div>
              <div className="font-semibold text-white">WCAG 2.1 Criteria:</div>
              {/* <div>• Normal Text (&lt;18pt): AA ≥ 4.5:1, AAA ≥ 7.0:1</div> */}
              <div>Normal Text (&lt;18pt)</div>
              <div>• AA ≥ 4.5 : 1</div>
              <div>• AAA ≥ 7.0 : 1</div>
              {/* <div>
                • Large Text (≥18pt or bold ≥14pt): AA ≥ 3.0:1, AAA ≥ 4.5:1
              </div> */}
              <div>Large Text (≥18pt or bold ≥14pt)</div>
              <div>• AA ≥ 3.0 : 1</div>
              <div>• AAA ≥ 4.5 : 1</div>
            </div>
          </InfoTooltip>
        }
        headerClassName="justify-start flex-row items-center"
        actionsClassName="self-auto"
      />

      <div className="mt-2 grid grid-cols-1 gap-4 md:grid-cols-2">
        <ContrastPreviewItem
          title="Black Text (#000000)"
          textColorHex="#000000"
          textColorName="Black"
          backgroundColorRgba={backgroundColorRgba}
          result={contrastAgainstBlack}
        />
        <ContrastPreviewItem
          title="White Text (#FFFFFF)"
          textColorHex="#FFFFFF"
          textColorName="White"
          backgroundColorRgba={backgroundColorRgba}
          result={contrastAgainstWhite}
        />
      </div>
    </section>
  );
}
