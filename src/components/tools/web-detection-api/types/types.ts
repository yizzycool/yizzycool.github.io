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

export type WindowDetector = {
  FaceDetector: new () => FaceDetectorInstance;
};
