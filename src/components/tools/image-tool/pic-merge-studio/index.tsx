'use client';

import type {
  CanvasConfig,
  GlobalImageConfig,
  ImageConfig,
} from './types/config';
import type { ConfigHelper } from './types/config-helper';

import { cn } from '@/utils/cn';
import { useRef, useState } from 'react';

import useFabric from './hooks/use-fabric';
import HeaderBlock from '../../header-block';
import SectionGap from '../../section-gap';
import Snackbar from '@/components/common/snackbar';
import Config from './config-panel';
import {
  PRESET_BACKGROUND_COLORS,
  PRESET_BORDER_COLORS,
} from './config-panel/data/background';

export const DEFAULT_CANVAS_CONFIG: CanvasConfig = {
  layout: 'free',
  size: { width: 1080, height: 1080 },
  background: {
    type: 'color',
    color: { color: PRESET_BACKGROUND_COLORS[0], opacity: 1 },
  },
  border: { width: 0, color: '', opacity: 1 },
  exportFormat: 'png',

  gridConfig: {
    rows: 2,
    cols: 2,
    border: {
      showOuter: false,
      width: 25,
      color: PRESET_BORDER_COLORS[0],
      opacity: 1,
    },
  },
};

const defaultGlobalImageConfig: GlobalImageConfig = {
  border: { width: 0, color: '', opacity: 1 },
  radius: 0,
};

const defaultImageConfig: ImageConfig = {
  opacity: 1,
  border: { width: 0, color: '', opacity: 1 },
  angle: 0,
  scaleX: 0,
  scaleY: 0,
  lockMovementX: false,
  lockMovementY: false,
  flipX: false,
  flipY: false,
  filters: [],
};

export default function PicMergeStudio() {
  const [canvasConfig, setCanvasConfig] = useState(DEFAULT_CANVAS_CONFIG);
  const [globalImageConfig, setGlobalImageConfig] = useState(
    defaultGlobalImageConfig
  );
  const [imageConfig, setImageConfig] = useState(defaultImageConfig);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const configHelper: ConfigHelper = {
    canvasConfig,
    setCanvasConfig,

    globalImageConfig,
    setGlobalImageConfig,

    imageConfig,
    setImageConfig,
  };

  const fabricHelper = useFabric({
    refs: {
      containerRef,
      canvasRef,
    },
    configHelper,
  });

  return (
    <div
      className={cn(
        'relative grid w-full lg:grid-cols-[1fr_300px]',
        'transition-all duration-500 ease-in'
      )}
    >
      <div className="flex-1 lg:pr-12">
        <HeaderBlock />

        <SectionGap />

        {/* Canvas Block */}
        <div
          ref={containerRef}
          className={cn(
            'relative h-[calc(100dvh_-_300px)] w-full flex-1 overflow-hidden lg:h-[calc(100dvh_-_100px)]',
            'bg-[radial-gradient(#e5e7eb_1.5px,transparent_1.5px)] [background-size:32px_32px] dark:bg-[radial-gradient(#1f2937_1.5px,transparent_1.5px)]'
          )}
        >
          <div className="absolute inset-0 *:mx-auto">
            <canvas ref={canvasRef} />
          </div>
        </div>
      </div>

      {/* Settings */}
      <Config fabricHelper={fabricHelper} configHelper={configHelper} />

      <Snackbar
        variant="error"
        open={false}
        onClose={() => {}}
        // open={error}
      />
    </div>
  );
}
