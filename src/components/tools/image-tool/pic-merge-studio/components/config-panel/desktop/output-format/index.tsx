'use client';

import type { ConfigHelper } from '../../../../types/config-helper';
import type { CanvasExportFormat } from '../../../../types/config';

import { ImageDown } from 'lucide-react';

import Label from '@/components/common/label';
import ButtonTabs from '@/components/common/tabs/button';

type Props = {
  configHelper: ConfigHelper;
};

export default function OutputFormat({ configHelper }: Props) {
  const updateOutputFormat = (exportFormat: CanvasExportFormat) => {
    configHelper.setCanvasConfig((prev) => ({ ...prev, exportFormat }));
  };

  return (
    <div className="space-y-4">
      <Label
        icon={ImageDown}
        className="text-xs !font-black uppercase tracking-widest"
      >
        Output Format
      </Label>

      <ButtonTabs
        tabs={['png', 'jpeg', 'svg']}
        onChange={(tab) => updateOutputFormat(tab as CanvasExportFormat)}
        size="sm"
        className="flex-1 font-black uppercase"
      />
    </div>
  );
}
