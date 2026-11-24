'use client';

import type {
  CanvasWatermarkConfig,
  CaptionConfig,
} from '../../../types/config';

import { Type } from 'lucide-react';

import BottomDrawer from '../bottom-drawer';
import GroupTitle from '../group-title';
import { useControlDrawer } from '../hooks/use-control-drawer';
import IconTextButton from '../icon-text-button';
import CaptionWatermarkDesktop from '../../desktop/caption-watermark';

type Props = {
  selectedCaption: CaptionConfig | null;
  watermark: CanvasWatermarkConfig;
  onAddCaption: (text?: string) => void;
  onUpdateCaption: (patch: Partial<CaptionConfig>) => void;
  onDeleteCaption: () => void;
  onUpdateWatermark: (patch: Partial<CanvasWatermarkConfig>) => void;
  onChangeEnd?: () => void;
};

/**
 * Mobile drawer trigger wrapping Quick Captions & Tiled Diagonal Watermark controls.
 */
export default function CaptionWatermarkMobile(props: Props) {
  const { isOpen, openDrawer, closeDrawer } = useControlDrawer();

  return (
    <>
      <IconTextButton icon={Type} text="Text" onClick={openDrawer} />
      <BottomDrawer isOpen={isOpen} onClose={closeDrawer}>
        <div className="space-y-3 p-4 pb-6">
          <GroupTitle text="Captions & Watermark" icon={Type} />
          <CaptionWatermarkDesktop {...props} />
        </div>
      </BottomDrawer>
    </>
  );
}
