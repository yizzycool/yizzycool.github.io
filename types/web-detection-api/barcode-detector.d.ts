interface BarcodeDetectorInstance {
  detect: (
    image: HTMLImageElement | HTMLCanvasElement
  ) => Promise<BarcodeDetectionResults>;
}

type BarcodeDetectorOptions = {
  formats: Array<string>;
};

type BarcodeDetectionResults = Array<{
  boundingBox: DetectedBoundingBox;
  cornerPoints: Array<{ x: number; y: number }>;
  format: string;
  rawValue: string;
}>;
