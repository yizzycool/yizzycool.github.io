'use client';

import type { ConfigHelper } from '../../../types/config-helper';
import type { CanvasExportFormat } from '../../../types/config';

import { PillTabs } from '@/components/ui/tabs';

type Props = {
  configHelper: ConfigHelper;
};

export default function OutputFormat({ configHelper }: Props) {
  const updateOutputFormat = (exportFormat: CanvasExportFormat) => {
    configHelper.setCanvasConfig((prev) => ({ ...prev, exportFormat }));
  };

  return (
    <div className="space-y-4">
      <PillTabs
        tabs={['png', 'jpeg']}
        onChange={(tab) => updateOutputFormat(tab as CanvasExportFormat)}
        size="sm"
        className="flex-1 font-medium uppercase"
      />
    </div>
  );
}
