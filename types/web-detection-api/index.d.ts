interface Window {
  FaceDetector: new () => FaceDetectorInstance;
  BarcodeDetector: new (
    options?: BarcodeDetectorOptions
  ) => BarcodeDetectorInstance;
  TextDetector: new () => TextDetectorInstance;
}

type DetectedBoundingBox = {
  bottom: number;
  height: number;
  left: number;
  right: number;
  top: number;
  width: number;
  x: number;
  y: number;
};
