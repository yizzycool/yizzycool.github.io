import { FabricFilterParams } from './fabric-filter';

export type FabricHelperStates = {
  isFabricReady: boolean;
  isExporting: boolean;
  hasImageSelection: boolean;
  hasImageSrc: boolean;
};

export type FabricHelperCanvasUpdater = {
  switchToFreeLayout: () => void;
  // Add images into Fabric Canvas
  handleImagesUpload: (files: FileList) => void;
  // Extract image from Fabric Canvas
  export: () => void;
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

  // Update border width of Fabric Image
  setBorderWidth: (strokeWidth: number) => void;
  // Update color of Fabric Image
  setBorderColor: (color: string, opacity: number) => void;
  // Reset border width and color of Fabric Image
  resetBorder: () => void;

  // Update angle/rotateX/rotateY/flipX/flipY of Fabric Image
  setGeometry: (key: string, value: number | boolean) => void;
  // Update filters of Fabric Image
  setFilters: (
    filter: string[],
    params?: Record<string, FabricFilterParams>
  ) => void;

  // Update layer of Fabric Image in Canvas
  setLayer: (type: 'front' | 'back' | 'forward' | 'backward') => void;

  // Update alignment of Fabric Image
  setAlignment: (horizontal: string, vertical: string) => void;
  // Update object-fit of Fabric Image
  setObjectFit: (type: string) => void;
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

export type FabricHelper = {
  states: FabricHelperStates;
  canvasUpdater: FabricHelperCanvasUpdater;
  imageUpdater: FabricHelperImageUpdater;
  imagesUpdater: FabricHelperImagesUpdater;
  gridUpdater: FabricHelperGridUpdater;
};
