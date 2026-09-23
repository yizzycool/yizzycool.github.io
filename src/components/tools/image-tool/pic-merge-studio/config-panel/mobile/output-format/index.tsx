'use client';

import type { ConfigHelper } from '../../../types/config-helper';
import type { CanvasExportFormat } from '../../../types/config';

import { Download, ImageDown, X } from 'lucide-react';

import { BaseDialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PillTabs } from '@/components/ui/tabs';

import { useControlDrawer } from '../hooks/use-control-drawer';
import IconTextButton from '../icon-text-button';
import PanelLabel from '../../panel-label';

type Props = {
  configHelper: ConfigHelper;
  exportCanvas: () => void;
  onOpenExport?: () => void;
};

export default function OutputFormat({
  configHelper,
  exportCanvas,
  onOpenExport,
}: Props) {
  const { isOpen, openDrawer, closeDrawer } = useControlDrawer();

  const handleExportClick = () => {
    if (onOpenExport) {
      onOpenExport();
      return;
    }
    openDrawer();
  };

  const updateOutputFormat = (exportFormat: CanvasExportFormat) => {
    configHelper.setCanvasConfig((prev) => ({ ...prev, exportFormat }));
  };

  return (
    <>
      <IconTextButton
        icon={Download}
        text="Export"
        onClick={handleExportClick}
      />

      <BaseDialog isOpen={isOpen} onClose={closeDrawer}>
        <div className="space-y-4 px-8 py-6">
          <div>
            <X size={20} onClick={closeDrawer} className="ml-auto" />
          </div>

          <PanelLabel icon={ImageDown}>Output Format</PanelLabel>

          <PillTabs
            tabs={['png', 'jpeg']}
            onChange={(tab) => updateOutputFormat(tab as CanvasExportFormat)}
            size="sm"
            className="flex-1 font-semibold uppercase"
          />

          <Button
            icon={Download}
            size="sm"
            className="!mt-12 w-full font-semibold"
            rounded="full"
            iconStrokeWidth={2}
            onClick={exportCanvas}
          >
            Export
          </Button>
        </div>
      </BaseDialog>
    </>
  );
}
