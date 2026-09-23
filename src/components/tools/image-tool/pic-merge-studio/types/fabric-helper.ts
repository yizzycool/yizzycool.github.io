import type * as fabric from 'fabric';

export type FabricFilterValue = number | string | boolean;
export type FabricFilterValuesMap = Record<
  string,
  Record<string, FabricFilterValue> | FabricFilterValue
>;

export type LayerItem = {
  id: string;
  name: string;
  image: fabric.FabricImage;
  visible: boolean;
  thumbnail: string;
  isSelected: boolean;
};

export type FabricHelperStates = {
  isFabricReady: boolean;
  isExporting: boolean;
  hasImageSelection: boolean;
  hasImageSrc: boolean;
  selectedCount: number;
};

export type ExportOptions = {
  format?: 'png' | 'jpeg' | 'webp';
  quality?: number;
  filename?: string;
};

export type FabricHelperCanvasUpdater = {
  switchToFreeLayout: () => void;
  // Add images into Fabric Canvas
  handleImagesUpload: (files: FileList) => void;
  // Extract image from Fabric Canvas
  export: (options?: ExportOptions) => void;
  // Update size of Fabric Canvas
  setSize: (width: number, height: number) => void;
  // Update background of Fabric Canvas
  setBackgroundColor: (color: string, opacity: number) => void;
  // Update border width of Fabric Canvas
  setBorderWidth: (strokeWidth: number) => void;
  // Update color of Fabric Canvas
  setBorderColor: (color: string, opacity: number) => void;
  // Reset border width and color of Fabric Canvas
  resetBorder: () => void;

  // To de-selected object
  discardActiveObject: () => void;
};

export type FabricHelperImageUpdater = {
  // Replace with user selected image
  replaceImage: (file: File) => Promise<void>;
  // Delete selected image
  deleteImage: () => void;
  // Update image opacity
  setOpacity: (opacity: number) => void;

  // Update border width of Fabric Image
  setBorderWidth: (strokeWidth: number) => void;
  // Update color of Fabric Image
  setBorderColor: (color: string, opacity: number) => void;
  // Reset border width and color of Fabric Image
  resetBorder: () => void;

  // Update angle/rotateX/rotateY/flipX/flipY of Fabric Image
  setGeometry: (key: string, value: number | boolean) => void;
  // Update width and height of Fabric Image
  setSize: (width: number, height: number) => void;
  // Reset Fabric Image to 100% natural resolution
  resetOriginalSize: () => void;
  // Reset Fabric Image aspect ratio to 1:1 natural ratio
  resetAspectRatio: () => void;
  // Update filters of Fabric Image
  setFilters: (filter: string[], params?: FabricFilterValuesMap) => void;

  // Update layer of Fabric Image in Canvas
  setLayer: (type: 'front' | 'back' | 'forward' | 'backward') => void;

  // Update alignment of Fabric Image
  setAlignment: (horizontal: string, vertical: string) => void;
  // Update object-fit of Fabric Image
  setObjectFit: (type: string) => void;
  // Nudge selected image by dx, dy
  nudge: (dx: number, dy: number) => void;
};

export type FabricHelperImagesUpdater = {
  // Update border width of Fabric Image
  setBorderWidth: (strokeWidth: number) => void;
  // Update color of Fabric Image
  setBorderColor: (color: string, opacity: number) => void;
  // Reset border width and color of Fabric Image
  resetBorder: () => void;

  // Update alignment of Fabric Image
  setAlignment: (horizontal: string, vertical: string) => void;
  // Update object-fit of Fabric Image
  setObjectFit: (type: string) => void;
};

export type FabricHelperGridUpdater = {
  // To switch from `free` to grid`
  switchToGridLayout: (rows: number, cols: number) => void;
  // Add images into Fabric Canvas
  handleImagesUpload: (files: FileList) => void;
  // Update size of Fabric Canvas
  setSize: (width: number, height: number) => void;

  // To show outer border or not
  setShowOuterBorder: (showOuter: boolean) => void;
  // Update border width of Fabric Canvas
  setBorderWidth: (strokeWidth: number) => void;
  // Update color of Fabric Canvas
  setBorderColor: (color: string, opacity: number) => void;
  // Reset border width and color of Fabric Canvas
  resetBorder: () => void;

  // Replace with user selected image
  replaceImage: (file: File) => Promise<void>;
  // Delete selected image while keep image element
  deleteImage: () => void;

  // Update alignment of Fabric Image
  setAlignment: (horizontal: string, vertical: string) => void;
  // Update object-fit of Fabric Image
  setObjectFit: (type: string) => void;
};

export type FabricHelperLayersUpdater = {
  layers: LayerItem[];
  selectedCount: number;
  getLayers: () => LayerItem[];
  selectLayer: (
    image: fabric.FabricImage,
    isMulti?: boolean,
    isRange?: boolean
  ) => void;
  selectBackground: () => void;
  selectAll: () => void;
  toggleVisibility: (image: fabric.FabricImage) => void;
  reorderLayer: (fromVisualIndex: number, toVisualIndex: number) => void;
  reorderLayers: (newLayers: LayerItem[]) => void;
  // Batch operations for multi-selection
  batchSetOpacity: (opacity: number) => void;
  batchSetBorderWidth: (strokeWidth: number) => void;
  batchSetBorderColor: (color: string, opacity: number) => void;
  batchResetBorder: () => void;
  batchSetFilters: (filters: string[]) => void;
  batchDelete: () => void;
  batchSetLayer: (type: 'front' | 'back' | 'forward' | 'backward') => void;
};

export type FabricHelper = {
  states: FabricHelperStates;
  canvasUpdater: FabricHelperCanvasUpdater;
  imageUpdater: FabricHelperImageUpdater;
  imagesUpdater: FabricHelperImagesUpdater;
  gridUpdater: FabricHelperGridUpdater;
  layersUpdater: FabricHelperLayersUpdater;
};
