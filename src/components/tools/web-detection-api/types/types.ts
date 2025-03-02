export type FaceLandmark = {
  locations: Array<{ x: number; y: number }>;
  type: string;
};

export type BoundingBox = {
  bottom: number;
  height: number;
  left: number;
  right: number;
  top: number;
  width: number;
  x: number;
  y: number;
};

export type FaceDetectionResults = Array<{
  boundingBox: BoundingBox;
  landmarks: Array<FaceLandmark>;
}>;

export type FaceDetectorInstance = {
  detect: (
    image: HTMLImageElement | HTMLCanvasElement
  ) => Promise<FaceDetectionResults>;
};

export type BarcodeDetectionResults = Array<{
  boundingBox: BoundingBox;
  cornerPoints: Array<{ x: number; y: number }>;
  format: string;
  rawValue: string;
}>;

export type BarcodeDetectorInstance = {
  detect: (
    image: HTMLImageElement | HTMLCanvasElement
  ) => Promise<BarcodeDetectionResults>;
};

type BarcodeDetectorOptions = {
  formats: Array<string>;
};

export type WindowDetector = {
  FaceDetector: new () => FaceDetectorInstance;
  BarcodeDetector: new (
    options?: BarcodeDetectorOptions
  ) => BarcodeDetectorInstance;
};
