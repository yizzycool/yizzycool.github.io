import type { CanvasConfig, GlobalImageConfig, ImageConfig } from './config';

export type ConfigHelper = {
  canvasConfig: CanvasConfig;
  setCanvasConfig: React.Dispatch<React.SetStateAction<CanvasConfig>>;

  globalImageConfig: GlobalImageConfig;
  setGlobalImageConfig: React.Dispatch<React.SetStateAction<GlobalImageConfig>>;

  imageConfig: ImageConfig;
  setImageConfig: React.Dispatch<React.SetStateAction<ImageConfig>>;
};
