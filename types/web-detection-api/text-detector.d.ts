interface TextDetectorInstance {
  detect: (
    image: HTMLImageElement | HTMLCanvasElement
  ) => Promise<TextDetectionResults>;
}

type TextDetectionResults = Array<{
  boundingBox: DetectedBoundingBox;
  cornerPoints: Array<{ x: number; y: number }>;
  rawValue: string;
}>;
