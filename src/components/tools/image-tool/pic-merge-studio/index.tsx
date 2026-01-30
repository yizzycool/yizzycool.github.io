'use client';

import type {
  CanvasConfig,
  GlobalImageConfig,
  ImageConfig,
} from './types/config';
import type { ConfigHelper } from './types/config-helper';

import clsx from 'clsx';
import { useRef, useState } from 'react';

import useFabric from './hooks/use-fabric';
import {
  PresetBackgroundColors,
  PresetBorderColors,
} from './components/config-panel/data/background';
import HeaderBlock from '../../components/header-block';
import SectionGap from '../../components/section-gap';
import Snackbar from '@/components/common/snackbar';
import Config from './components/config-panel';

import _isNull from 'lodash/isNull';
import _isEmpty from 'lodash/isEmpty';
import _size from 'lodash/size';

export const DefaultCanvasConfig: CanvasConfig = {
  layout: 'free',
  size: { width: 1080, height: 1080 },
  background: {
    type: 'color',
    color: { color: PresetBackgroundColors[0], opacity: 1 },
  },
  border: { width: 0, color: '', opacity: 1 },
  exportFormat: 'png',

  gridConfig: {
    rows: 2,
    cols: 2,
    border: {
      showOuter: false,
      width: 25,
      color: PresetBorderColors[0],
      opacity: 1,
    },
  },
};

const DefaultGlobalImageConfig: GlobalImageConfig = {
  border: { width: 0, color: '', opacity: 1 },
  radius: 0,
};

const DefaultImageConfig: ImageConfig = {
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
  const [canvasConfig, setCanvasConfig] = useState(DefaultCanvasConfig);
  const [globalImageConfig, setGlobalImageConfig] = useState(
    DefaultGlobalImageConfig
  );
  const [imageConfig, setImageConfig] = useState(DefaultImageConfig);

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
      className={clsx(
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
          className={clsx(
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
        // onClose={() => setImageInfo(DefaultImageInfo)}
      />
    </div>
  );
}
