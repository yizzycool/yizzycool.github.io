'use client';

import type { ConfigHelper } from '../../../../types/config-helper';
import type { CanvasExportFormat } from '../../../../types/config';

import { Download, ImageDown, X } from 'lucide-react';

import { useControlDrawer } from '../hooks/use-control-drawer';
import Label from '@/components/common/label';
import ButtonTabs from '@/components/common/tabs/button';
import IconTextButton from '../icon-text-button';
import BaseDialog from '@/components/common/dialog/base';
import Button from '@/components/common/button';

type Props = {
  configHelper: ConfigHelper;
  exportCanvas: () => void;
};

export default function OutputFormat({ configHelper, exportCanvas }: Props) {
  const { isOpen, openDrawer, closeDrawer } = useControlDrawer();

  const updateOutputFormat = (exportFormat: CanvasExportFormat) => {
    configHelper.setCanvasConfig((prev) => ({ ...prev, exportFormat }));
  };

  return (
    <>
      <IconTextButton icon={Download} text="Export" onClick={openDrawer} />

      <BaseDialog isOpen={isOpen} onClose={closeDrawer}>
        <div className="space-y-4 px-8 py-6">
          <div>
            <X size={20} onClick={closeDrawer} className="ml-auto" />
          </div>

          <Label
            icon={ImageDown}
            className="!font-black uppercase tracking-widest"
          >
            Output Format
          </Label>

          <ButtonTabs
            tabs={['png', 'jpeg', 'svg']}
            onChange={(tab) => updateOutputFormat(tab as CanvasExportFormat)}
            size="sm"
            className="flex-1 font-black uppercase"
          />

          <Button
            icon={Download}
            size="sm"
            className="!mt-12 w-full !font-black uppercase tracking-widest"
            rounded="full"
            iconStrokeWidth={3}
            onClick={exportCanvas}
          >
            Export
          </Button>
        </div>
      </BaseDialog>
    </>
  );
}
